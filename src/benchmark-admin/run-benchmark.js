import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { nowIso, ensureDir, runCommand, parseVitestSummary, writeLog } from './helpers/benchmark-utils.js';
import { copyHiddenTests, removeHiddenTests } from './helpers/hidden-tests.js';
import { computeScore } from './helpers/scorer.js';

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

  if (bugType) {
    console.log(`Injecting ${bugType} bugs for ${target}...`);
    const injectionScript = path.resolve(__dirname, `bug-injections/${target}/inject-${bugType}-bugs.js`);
    if (fs.existsSync(injectionScript)) {
      runCommand(`node ${injectionScript}`, __dirname);
    } else {
      console.warn(`No injection script found for ${target}/${bugType}`);
    }
  }

  // Visible tests
  const visible = runCommand('pnpm test -- --run', repoRoot);
  summary.timing.visibleMs = visible.durationMs;
  writeLog(resultDir, 'visible-tests.stdout.txt', visible.stdout);
  writeLog(resultDir, 'visible-tests.stderr.txt', visible.stderr);
  summary.visibleTests = { success: visible.success, ...parseVitestSummary(`${visible.stdout}\n${visible.stderr}`) };

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
  const build = runCommand('pnpm run build', repoRoot);
  summary.timing.buildMs  = build.durationMs;
  writeLog(resultDir, 'build.stdout.txt', build.stdout);
  writeLog(resultDir, 'build.stderr.txt', build.stderr);
  summary.build.success = build.success;

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
