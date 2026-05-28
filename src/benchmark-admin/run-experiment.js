import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

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
const resultDir = path.join(resultsRoot, `${taskId}__${runId}`);
fs.mkdirSync(resultDir, { recursive: true });

function run(label, cmd, args, cwd) {
  console.log(`\n[${label}] ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', encoding: 'utf8' });
  if (result.error) {
    console.error(`Failed to spawn ${cmd}: ${result.error.message}`);
    process.exit(1);
  }
  return result;
}

function capture(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.error) throw result.error;
  return result;
}

// ── 0. Bug injection (must happen before baseline so agent starts on broken code) ──
if (bugType) {
  const injectionScript = path.resolve(__dirname, `bug-injections/${target}/inject-${bugType}-bugs.js`);
  if (!fs.existsSync(injectionScript)) {
    console.error(`Bug injection script not found: ${injectionScript}`);
    process.exit(1);
  }
  run('0/5 inject bugs', 'node', [injectionScript], __dirname);
}

// ── 1. Baseline quality ──────────────────────────────────────────────────────
run('1/5 baseline quality', 'node', [
  'analyze.js', target,
  path.join(resultDir, 'baseline-quality.json'),
], __dirname);

// ── 2. Run agent ─────────────────────────────────────────────────────────────
const prompts = {
  gsd:    `/gsd-loop\n\nUse GSD to complete the ${target} task ${taskId}.`,
  wiggum: `/wiggum-loop\n\nUse the Wiggum loop to complete the ${target} task ${taskId}.`,
};

console.log(`\n[2/5 agent] Running ${framework.toUpperCase()} on ${target} ${taskId}...`);

const agentStart = Date.now();
const claudeResult = capture('claude', [
  '--print',
  '--output-format', 'json',
  '--max-turns', '50',
  '--dangerously-skip-permissions',
  '-p', prompts[framework],
], repoRoot);
const wallDurationMs = Date.now() - agentStart;

fs.writeFileSync(path.join(resultDir, 'agent-stdout.txt'), claudeResult.stdout || '', 'utf8');
if (claudeResult.stderr) {
  fs.writeFileSync(path.join(resultDir, 'agent-stderr.txt'), claudeResult.stderr, 'utf8');
}

const agentMeta = {
  framework,
  target,
  taskId,
  exit_code: claudeResult.status,
  wall_duration_ms: wallDurationMs,
  cost_usd: null,
  num_turns: null,
  session_id: null,
  is_error: null,
};

try {
  const parsed = JSON.parse((claudeResult.stdout || '').trim());
  agentMeta.cost_usd   = parsed.cost_usd    ?? null;
  agentMeta.num_turns  = parsed.num_turns   ?? null;
  agentMeta.session_id = parsed.session_id  ?? null;
  agentMeta.is_error   = parsed.is_error    ?? false;
} catch {
  agentMeta.parse_error = 'Could not parse claude JSON output — check agent-stdout.txt';
}

fs.writeFileSync(
  path.join(resultDir, 'agent-metadata.json'),
  JSON.stringify(agentMeta, null, 2),
  'utf8'
);

console.log(`Agent done — cost: $${agentMeta.cost_usd ?? 'unknown'}, turns: ${agentMeta.num_turns ?? 'unknown'}`);

// ── 3. Benchmark evaluation ───────────────────────────────────────────────────
run('3/5 benchmark', 'node', ['run-benchmark.js', taskId, runId, target], __dirname);

// ── 4. Post-agent quality ─────────────────────────────────────────────────────
run('4/5 post quality', 'node', [
  'analyze.js', target,
  path.join(resultDir, 'post-quality.json'),
], __dirname);

// ── 5. Quality delta ──────────────────────────────────────────────────────────
run('5/5 delta', 'node', [
  'delta.js',
  path.join(resultDir, 'baseline-quality.json'),
  path.join(resultDir, 'post-quality.json'),
  path.join(resultDir, 'quality-delta.json'),
], __dirname);

// ── Merge agent metadata into summary.json ────────────────────────────────────
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
