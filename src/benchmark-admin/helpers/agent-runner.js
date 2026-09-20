import fs from 'fs';
import path from 'path';
import { capture } from './spawn-utils.js';
import { runGsd } from './gsd-driver.js';
import { runWiggum } from './wiggum-driver.js';
import { createSandbox, syncBack, destroySandbox, scopeVisibleTests } from './sandbox.js';

// Generous relative to every legitimate phase duration observed in practice
// (even the heaviest — verify-work with 40 turns, plan-phase's 4-way
// investigation fan-out — complete well under 15 minutes). This exists to
// bound the *failure* case: a degraded/hung invocation was observed running
// 20-40 minutes before the CLI gave up on its own (no timeout of its own to
// tune — there is no --timeout flag), which made even one retry attempt a
// potential half-hour-plus wait. Killing it here is what actually makes a
// bad attempt fail fast instead of just eventually failing.
const ATTEMPT_TIMEOUT_MS = 15 * 60 * 1000;

// A single `claude` process, no retry. Broken out so invokeClaude can call
// it more than once per logical invocation without duplicating the
// capture/parse logic.
function runOnce(prompt, { workDir, maxTurns, label, resultDir }) {
  const start = Date.now();
  const claudeResult = capture('claude', [
    '--print',
    '--output-format', 'json',
    '--max-turns', String(maxTurns),
    '--dangerously-skip-permissions',
    '-p', prompt,
  ], workDir, { timeoutMs: ATTEMPT_TIMEOUT_MS });
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

  if (claudeResult.timedOut) {
    record.is_error = true;
    record.parse_error = `killed after exceeding ${ATTEMPT_TIMEOUT_MS / 60000}min timeout`;
    return record;
  }

  try {
    const parsed = JSON.parse((claudeResult.stdout || '').trim());
    record.cost_usd   = parsed.total_cost_usd ?? null;
    record.num_turns  = parsed.num_turns  ?? null;
    record.session_id = parsed.session_id ?? null;
    record.is_error    = parsed.is_error   ?? false;
  } catch {
    record.parse_error = 'Could not parse claude JSON output — check agent-stdout file for this invocation';
  }

  return record;
}

const MAX_ATTEMPTS = 3;

// One fresh, context-free `claude` process. Every phase/iteration of both
// frameworks goes through this — neither driver ever reuses a session, since
// external context reset between steps is the entire point of both designs.
// `workDir` is the sandbox directory, never the real repo — see sandbox.js.
//
// Retries automatically on is_error (the CLI reported a transient failure —
// observed in practice as an outright "Request timed out" — not the agent
// judging the task unsolvable). Since every invocation is already
// stateless/fresh-context, a retry is just "try again from scratch"; no
// special-casing needed. Without this, an errored phase would still get
// checkpointed and the driver would plow ahead to the next phase (or, for
// GSD's rework loop, burn one of its two rework attempts) on a call that
// failed for reasons that had nothing to do with the task.
export function invokeClaude(prompt, { workDir, maxTurns = 50, label, resultDir }) {
  const costs  = [];
  const turns  = [];
  let last;
  let attemptsUsed = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attemptsUsed = attempt;
    last = runOnce(prompt, { workDir, maxTurns, label: `${label}-attempt${attempt}`, resultDir });
    costs.push(last.cost_usd);
    turns.push(last.num_turns);
    if (!last.is_error) break;
    if (attempt < MAX_ATTEMPTS) {
      console.log(`  [${label}] attempt ${attempt} errored (${last.parse_error ?? 'is_error=true'}) — retrying (${MAX_ATTEMPTS - attempt} left)`);
    }
  }

  // Promote the final attempt's raw output to the canonical filename so
  // concatLogs (and anyone skimming resultDir) finds the attempt that
  // actually matters without digging through retries — every attempt's own
  // file still exists alongside it for the full audit trail.
  if (resultDir && label) {
    for (const ext of ['stdout', 'stderr']) {
      const src = path.join(resultDir, `agent-${ext}-${label}-attempt${attemptsUsed}.txt`);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(resultDir, `agent-${ext}-${label}.txt`));
    }
  }

  const cost_usd  = costs.some(c => c != null) ? costs.reduce((s, c) => s + (c ?? 0), 0) : null;
  const num_turns = turns.some(t => t != null) ? turns.reduce((s, t) => s + (t ?? 0), 0) : null;

  console.log(`  [${label}] cost: $${cost_usd ?? 'unknown'}, turns: ${num_turns ?? 'unknown'}${attemptsUsed > 1 ? ` (${attemptsUsed} attempts)` : ''}`);

  return { ...last, label, cost_usd, num_turns, attemptsUsed };
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
