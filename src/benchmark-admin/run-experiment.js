import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from './helpers/spawn-utils.js';
import { runAgent } from './helpers/agent-runner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '../..');

const [taskId, runId, target, framework, bugType] = process.argv.slice(2);

if (!taskId || !runId || !target || !framework) {
  console.error('Usage: node run-experiment.js <taskId> <runId> <target> <framework> [bugType]');
  console.error('  target:    frontend | backend');
  console.error('  framework: gsd | wiggum');
  console.error('  bugType:   logical | syntax  (optional, for bug-fix tasks)');
  process.exit(1);
}

if (!['frontend', 'backend'].includes(target)) {
  console.error(`Unknown target: ${target}. Use frontend or backend.`);
  process.exit(1);
}

if (!['gsd', 'wiggum'].includes(framework)) {
  console.error(`Unknown framework: ${framework}. Use gsd or wiggum.`);
  process.exit(1);
}

if (bugType && !['logical', 'syntax'].includes(bugType)) {
  console.error(`Unknown bugType: ${bugType}. Use logical or syntax.`);
  process.exit(1);
}

const resultsRoot = path.resolve(__dirname, 'results');
const resultDir   = path.join(resultsRoot, `${taskId}__${runId}`);
fs.mkdirSync(resultDir, { recursive: true });

//  0. Bug injection 
if (bugType) {
  const injectionScript = path.resolve(__dirname, `bug-injections/${target}/inject-${bugType}-bugs.js`);
  if (!fs.existsSync(injectionScript)) {
    console.error(`Bug injection script not found: ${injectionScript}`);
    process.exit(1);
  }
  run('0/5 inject bugs', 'node', [injectionScript], __dirname);
}

//  1. Baseline quality 
run('1/5 baseline quality', 'node', [
  'analyze.js', target, path.join(resultDir, 'baseline-quality.json'),
], __dirname);

//  2. Run agent 
const agentMeta = runAgent({ repoRoot, resultDir, framework, target, taskId });
fs.writeFileSync(path.join(resultDir, 'agent-metadata.json'), JSON.stringify(agentMeta, null, 2), 'utf8');

//  3. Benchmark evaluation 
run('3/5 benchmark', 'node', ['run-benchmark.js', taskId, runId, target], __dirname);

//  4. Post-agent quality 
run('4/5 post quality', 'node', [
  'analyze.js', target, path.join(resultDir, 'post-quality.json'),
], __dirname);

//  5. Quality delta 
run('5/5 delta', 'node', [
  'delta.js',
  path.join(resultDir, 'baseline-quality.json'),
  path.join(resultDir, 'post-quality.json'),
  path.join(resultDir, 'quality-delta.json'),
], __dirname);

// Merge agent metadata into summary.json 
const summaryPath = path.join(resultDir, 'summary.json');
if (fs.existsSync(summaryPath)) {
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  summary.agent = agentMeta;
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
}

console.log('\nExperiment complete.');
console.log(`Results: ${resultDir}`);
console.log('  summary.json          — test scores + agent cost/turns');
console.log('  quality-delta.json    — code quality regression delta');
console.log('  agent-stdout.txt      — full agent output');
