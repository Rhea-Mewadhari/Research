import fs from 'fs';
import path from 'path';
import { capture } from './spawn-utils.js';
import { runGsd } from './gsd-driver.js';
import { runWiggum } from './wiggum-driver.js';
import { createSandbox, syncBack, destroySandbox, scopeVisibleTests } from './sandbox.js';

// One fresh, context-free `claude` process. Every phase/iteration of both
// frameworks goes through this — neither driver ever reuses a session, since
// external context reset between steps is the entire point of both designs.
// `workDir` is the sandbox directory, never the real repo — see sandbox.js.
export function invokeClaude(prompt, { workDir, maxTurns = 50, label, resultDir }) {
  const start = Date.now();
  const claudeResult = capture('claude', [
    '--print',
    '--output-format', 'json',
    '--max-turns', String(maxTurns),
    '--dangerously-skip-permissions',
    '-p', prompt,
  ], workDir);
  const wallDurationMs = Date.now() - start;

  if (resultDir && label) {
    fs.writeFileSync(path.join(resultDir, `agent-stdout-${label}.txt`), claudeResult.stdout || '', 'utf8');
    if (claudeResult.stderr) {
      fs.writeFileSync(path.join(resultDir, `agent-stderr-${label}.txt`), claudeResult.stderr, 'utf8');
    }
  }

  const record = {
    label,
    exit_code:        claudeResult.status,
    wall_duration_ms: wallDurationMs,
    cost_usd:         null,
    num_turns:        null,
    session_id:       null,
    is_error:         null,
  };

  try {
    const parsed = JSON.parse((claudeResult.stdout || '').trim());
    record.cost_usd   = parsed.total_cost_usd ?? null;
    record.num_turns  = parsed.num_turns  ?? null;
    record.session_id = parsed.session_id ?? null;
    record.is_error    = parsed.is_error   ?? false;
  } catch {
    record.parse_error = 'Could not parse claude JSON output — check agent-stdout file for this invocation';
  }

  console.log(`  [${label ?? 'invoke'}] cost: $${record.cost_usd ?? 'unknown'}, turns: ${record.num_turns ?? 'unknown'}`);

  return record;
}

// Concatenates every invocation's captured stdout/stderr into the single
// agent-stdout.txt / agent-stderr.txt file names run-experiment.js's closing
// log message promises, on top of the per-invocation agent-stdout-<label>.txt
// files each invokeClaude() call already wrote.
function concatLogs(resultDir, labels, ext) {
  const chunks = labels.map(label => {
    const file = path.join(resultDir, `agent-${ext}-${label}.txt`);
    if (!fs.existsSync(file)) return null;
    const content = fs.readFileSync(file, 'utf8');
    if (!content) return null;
    return `----- ${label} -----\n${content}`;
  }).filter(Boolean);

  if (chunks.length) {
    fs.writeFileSync(path.join(resultDir, `agent-${ext}.txt`), chunks.join('\n\n'), 'utf8');
  }
}

export function runAgent({ repoRoot, resultDir, framework, target, taskId }) {
  console.log(`\n[2/5 agent] Running ${framework.toUpperCase()} on ${target} ${taskId}...`);

  const agentStart = Date.now();

  // Every phase/iteration runs inside an isolated, history-free copy of the
  // (post-bug-injection) working tree — not the real repo — so the agent
  // can't shortcut the task via `git log`/`git branch -a`/`git diff <ref>`/
  // `git stash` to recover the pre-bug code or a previous run's solved code.
  // See sandbox.js for what "isolated" means here and its known limits.
  const sandbox = createSandbox(repoRoot);
  scopeVisibleTests(sandbox.sandboxDir, target, taskId);
  let driverResult;
  try {
    driverResult = framework === 'gsd'
      ? runGsd({ workDir: sandbox.sandboxDir, resultDir, target, taskId })
      : runWiggum({ workDir: sandbox.sandboxDir, resultDir, target, taskId });
    syncBack(sandbox.sandboxDir, repoRoot);
  } finally {
    destroySandbox(sandbox.sandboxDir);
  }

  const wallDurationMs = Date.now() - agentStart;

  concatLogs(resultDir, driverResult.invocationLabels, 'stdout');
  concatLogs(resultDir, driverResult.invocationLabels, 'stderr');

  const agentMeta = {
    framework,
    target,
    taskId,
    wall_duration_ms: wallDurationMs,
    cost_usd:   driverResult.totalCostUsd,
    num_turns:  driverResult.totalTurns,
    exit_code:  driverResult.exitCode,
    is_error:   driverResult.isError,
    session_id: driverResult.lastSessionId,
    [framework]: driverResult.detail,
  };

  console.log(`Agent done — total cost: $${agentMeta.cost_usd ?? 'unknown'}, total turns: ${agentMeta.num_turns ?? 'unknown'}`);

  return agentMeta;
}
