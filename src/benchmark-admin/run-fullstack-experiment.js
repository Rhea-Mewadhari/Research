import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from './helpers/spawn-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [taskId, runId, framework] = process.argv.slice(2);

if (!taskId || !runId || !framework) {
  console.error('Usage: node run-fullstack-experiment.js <taskId> <runId> <framework>');
  console.error('  framework: gsd | wiggum');
  console.error('');
  console.error('Runs a task that spans both benchmark-frontend and benchmark-backend');
  console.error('with a single command, by invoking run-experiment.js once per target.');
  console.error('Bug injection is not supported here — fullstack tasks are net-new features.');
  process.exit(1);
}

if (!['gsd', 'wiggum'].includes(framework)) {
  console.error(`Unknown framework: ${framework}. Use gsd or wiggum.`);
  process.exit(1);
}

const resultsRoot = path.resolve(__dirname, 'results');

// Frontend keeps the bare runId; backend gets a `-be` suffix so its
// results/<taskId>__<runId>/ directory never collides with the frontend's —
// run-experiment.js has no notion of `target` in its result path, so two
// distinct runIds are what keep the two runs from overwriting each other.
const TARGETS = [
  { target: 'frontend', runId },
  { target: 'backend',  runId: `${runId}-be` },
];

for (const { target, runId: targetRunId } of TARGETS) {
  run(
    `fullstack/${target}`,
    'node',
    ['run-experiment.js', taskId, targetRunId, target, framework],
    __dirname,
  );
}

// ─── Combine both targets' scores into one place ───────────────────────────

function readSummary(targetRunId) {
  const summaryPath = path.join(resultsRoot, `${taskId}__${targetRunId}`, 'summary.json');
  if (!fs.existsSync(summaryPath)) return null;
  return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
}

const summaries = Object.fromEntries(
  TARGETS.map(({ target, runId: targetRunId }) => [target, readSummary(targetRunId)]),
);

const combinedDir = path.join(resultsRoot, `${taskId}__${runId}`);
fs.mkdirSync(combinedDir, { recursive: true });

const combinedPath = path.join(combinedDir, 'fullstack-summary.json');
fs.writeFileSync(
  combinedPath,
  JSON.stringify(
    {
      taskId,
      runId,
      framework,
      // Each target's full summary.json verbatim — this file is a container,
      // not a blended score. Frontend and backend are graded independently,
      // same as every other task in this harness.
      frontend: summaries.frontend,
      backend: summaries.backend,
    },
    null,
    2,
  ),
  'utf8',
);

console.log('\nFullstack experiment complete.');
console.log(`Frontend results: results/${taskId}__${runId}/summary.json`);
console.log(`Backend results:  results/${taskId}__${runId}-be/summary.json`);
console.log(`Combined view:    ${combinedPath}`);
console.log('');
for (const { target, runId: targetRunId } of TARGETS) {
  const s = summaries[target];
  if (!s) {
    console.log(`  ${target.padEnd(8)} — no summary.json found (run may have crashed before scoring)`);
    continue;
  }
  const score = s.score ?? {};
  console.log(
    `  ${target.padEnd(8)} (${targetRunId})  ` +
    `visible=${score.visiblePassRate ?? '—'}  ` +
    `hidden=${score.hiddenPassRate ?? '—'}  ` +
    `build=${score.buildStability ?? '—'}  ` +
    `correctness=${score.correctnessScore ?? '—'}  ` +
    `overall=${score.overallScore ?? '—'}`,
  );
}
