import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { nowIso, ensureDir, runCommand, parseVitestSummary, writeLog, getGitChangedFiles, parseTscErrors } from './helpers/benchmark-utils.js';
import { copyHiddenTests, removeHiddenTests } from './helpers/hidden-tests.js';
import { computeScore } from './helpers/scorer.js';

const COVERAGE_TARGETS = {
  frontend: 'src/utils/productFilters.ts',
  backend:  'src/services/productService.ts',
};

function parseCoverage(coveragePath, targetFile) {
  if (!fs.existsSync(coveragePath)) return null;
  let data;
  try { data = JSON.parse(fs.readFileSync(coveragePath, 'utf8')); } catch { return null; }

  const normalised = targetFile.split('/').join(path.sep);
  const key = Object.keys(data).find(k => k.endsWith(normalised));
  if (!key) return null;

  const { s, b, f } = data[key];

  function stmtPct(hits) {
    const vals = Object.values(hits);
    if (!vals.length) return 1;
    return vals.filter(v => v > 0).length / vals.length;
  }

  function branchPct(hits) {
    let total = 0, covered = 0;
    for (const counts of Object.values(hits)) {
      for (const n of counts) { total++; if (n > 0) covered++; }
    }
    return total ? covered / total : 1;
  }

  const round = n => Math.round(n * 1000) / 1000;
  return {
    file:         targetFile,
    branchPct:    round(branchPct(b)),
    statementPct: round(stmtPct(s)),
    functionPct:  round(stmtPct(f)),
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const taskId  = process.argv[2] || 'unknown_task';
const runId   = process.argv[3] || `run_${Date.now()}`;
const target  = process.argv[4] || 'frontend'; // frontend | backend
const bugType = process.argv[5];               // logical | syntax | undefined

const repoRoot         = path.resolve(__dirname, `../benchmark-${target}`);
const hiddenTestsRoot  = path.resolve(__dirname, `hidden-tests/${target}`);
const visibleManifest  = path.resolve(__dirname, `visible-tests-manifest/${target}.json`);
const resultsRoot      = path.resolve(__dirname, 'results');

ensureDir(resultsRoot);

// Tasks whose visible tests don't stand alone in the tests/ directory — e.g.
// task13's PATCH /api/users/me tests sit alongside task12's, since task13
// builds on a completed task12 run rather than the clean baseline — get an
// entry here scoping run-benchmark.js to just their own files. Tasks without
// an entry (1-11) fall back to running the whole directory, unchanged.
function getScopedVisibleFiles(taskId) {
  if (!fs.existsSync(visibleManifest)) return null;
  const manifest = JSON.parse(fs.readFileSync(visibleManifest, 'utf8'));
  return manifest[taskId] ?? null;
}

function main() {
  const startedAt = nowIso();
  const runStart  = Date.now();

  const resultDir = path.join(resultsRoot, `${taskId}__${runId}`);
  ensureDir(resultDir);

  const summary = {
    taskId,
    runId,
    timestamp: startedAt,
    build:        { success: false },
    visibleTests: { success: false, passed: 0, failed: 0, total: 0 },
    hiddenTests:  { success: false, passed: 0, failed: 0, total: 0 },
    overall:      { success: false },
    timing:       { visibleMs: 0, hiddenMs: 0, buildMs: 0, totalMs: 0 },
  };

  console.log(`Running benchmark for task=${taskId}, run=${runId}`);

  // Visible tests
  const scopedVisibleFiles = getScopedVisibleFiles(taskId);
  let visible;
  if (scopedVisibleFiles && scopedVisibleFiles.length > 0) {
    // No `--` separator — see the identical note on the hidden-tests run
    // below; passed directly, args reach vitest correctly in this pnpm setup.
    const visiblePaths = scopedVisibleFiles.map(f => `"${f}"`).join(' ');
    visible = runCommand(`pnpm test ${visiblePaths}`, repoRoot);
  } else {
    visible = runCommand('pnpm test -- --run', repoRoot);
  }
  summary.timing.visibleMs = visible.durationMs;
  writeLog(resultDir, 'visible-tests.stdout.txt', visible.stdout);
  writeLog(resultDir, 'visible-tests.stderr.txt', visible.stderr);
  summary.visibleTests = { success: visible.success, ...parseVitestSummary(`${visible.stdout}\n${visible.stderr}`) };

  // Coverage (testgen tasks only — runs on agent's visible tests before hidden tests are added)
  if (bugType === 'testgen' && COVERAGE_TARGETS[target]) {
    const cov = runCommand('pnpm test:coverage', repoRoot);
    writeLog(resultDir, 'coverage.stdout.txt', cov.stdout);
    const coveragePath = path.join(repoRoot, 'coverage', 'coverage-final.json');
    summary.coverage = parseCoverage(coveragePath, COVERAGE_TARGETS[target]);
    fs.rmSync(path.join(repoRoot, 'coverage'), { recursive: true, force: true });
  }

  // Hidden tests
  // Scoped to only the hidden test files themselves (not the whole tests/ dir) —
  // otherwise every visible test file re-runs alongside them, so a single
  // pre-existing visible failure gets counted a second time here, double-weighted
  // in computeScore (visible 30% + hidden 50%).
  let hiddenFiles = [];
  try {
    hiddenFiles = copyHiddenTests(hiddenTestsRoot, repoRoot, taskId);

    let hidden;
    if (hiddenFiles.length > 0) {
      // No `--` separator here: in this pnpm setup, args forwarded across
      // `--` to the `vitest run` script silently fail to reach vitest at all
      // (verified — even a bogus filter runs the full suite unfiltered
      // through `pnpm test -- <filter>`); passed directly, they work.
      const hiddenPaths = hiddenFiles.map(f => `"tests/${f}"`).join(' ');
      hidden = runCommand(`pnpm test ${hiddenPaths}`, repoRoot);
    } else {
      hidden = { success: true, stdout: '', stderr: '', durationMs: 0 };
    }
    summary.timing.hiddenMs = hidden.durationMs;
    writeLog(resultDir, 'hidden-tests.stdout.txt', hidden.stdout);
    writeLog(resultDir, 'hidden-tests.stderr.txt', hidden.stderr);

    const hiddenOutput = `${hidden.stdout}\n${hidden.stderr}`;
    const hiddenParsed  = parseVitestSummary(hiddenOutput);
    // A crash during collection (e.g. a broken import) can still leave the
    // per-file "Test Files X failed (X)" line intact even though vitest's own
    // "Tests  no tests" line shows zero tests actually ran — parseVitestSummary
    // then falls back to that file-level count, so `total` isn't reliably 0.
    // Check vitest's literal marker too. Distinguish this from "this task
    // genuinely has no hidden tests" using the manifest-declared file count,
    // not the parsed total — otherwise scorer.js would silently drop hidden-test
    // weighting for what is actually a catastrophic failure.
    const crashed = !hidden.success && hiddenFiles.length > 0 &&
      (hiddenParsed.total === 0 || /no tests/i.test(hiddenOutput));
    if (crashed) {
      console.warn(`[hidden tests] Crashed before producing a parseable summary (expected ${hiddenFiles.length} file(s)) — not treating as "no hidden tests".`);
    }

    summary.hiddenTests = {
      success: hidden.success,
      ...hiddenParsed,
      expectedFiles: hiddenFiles.length,
      crashed,
    };
  } finally {
    removeHiddenTests(hiddenFiles, repoRoot);
  }

  // Build
  // Snapshot the agent's footprint *before* the build step so pre-existing,
  // unrelated scaffold errors elsewhere in the project don't fail the run —
  // only errors in files the agent actually touched count against build.success.
  const changedFiles = getGitChangedFiles(repoRoot);
  const build = runCommand('pnpm run build', repoRoot);
  summary.timing.buildMs  = build.durationMs;
  writeLog(resultDir, 'build.stdout.txt', build.stdout);
  writeLog(resultDir, 'build.stderr.txt', build.stderr);

  const tscErrors      = parseTscErrors(`${build.stdout}\n${build.stderr}`);
  const agentErrors    = tscErrors.filter(e => changedFiles.has(e.file));
  const preExisting    = tscErrors.filter(e => !changedFiles.has(e.file));

  if (preExisting.length) {
    console.warn(`[build] Ignoring ${preExisting.length} pre-existing error(s) outside agent-modified files:`);
    preExisting.forEach(e => console.warn(`  ${e.file}(${e.line},${e.column}): ${e.code} ${e.message}`));
  }

  // Only downgrade a raw failure to success when every diagnostic in the output
  // was positively attributed to a non-agent file. If the failure produced no
  // parseable tsc diagnostics at all (missing dependency, config error, etc.),
  // we can't attribute it — leave rawSuccess as the final word.
  const attributableFailure = build.success || (tscErrors.length > 0 && agentErrors.length === 0);

  summary.build = {
    success:      attributableFailure,
    rawSuccess:   build.success,
    preExistingErrors: preExisting,
  };

  summary.overall.success =
    summary.visibleTests.success &&
    summary.hiddenTests.success  &&
    summary.build.success;

  summary.timing.totalMs = Date.now() - runStart;

  summary.score = computeScore(summary);

  fs.writeFileSync(path.join(resultDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
}

main();
