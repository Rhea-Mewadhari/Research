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

const repoRoot        = path.resolve(__dirname, `../benchmark-${target}`);
const hiddenTestsRoot = path.resolve(__dirname, `hidden-tests/${target}`);
const resultsRoot     = path.resolve(__dirname, 'results');

ensureDir(resultsRoot);

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
  const visible = runCommand('pnpm test -- --run', repoRoot);
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
  let hiddenFiles = [];
  try {
    hiddenFiles = copyHiddenTests(hiddenTestsRoot, repoRoot, taskId);

    const hidden = runCommand('pnpm test -- --run', repoRoot);
    summary.timing.hiddenMs = hidden.durationMs;
    writeLog(resultDir, 'hidden-tests.stdout.txt', hidden.stdout);
    writeLog(resultDir, 'hidden-tests.stderr.txt', hidden.stderr);
    summary.hiddenTests = { success: hidden.success, ...parseVitestSummary(`${hidden.stdout}\n${hidden.stderr}`) };
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
