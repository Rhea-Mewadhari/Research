import fs from 'fs';
import path from 'path';
import { capture } from './spawn-utils.js';

// Fullstack tasks (12+) span two repos with several new endpoints/pages each —
// meaningfully more surface area than the single-target tasks 1-11, which is
// what the default cap below was calibrated against. Raise it only for those,
// so 1-11 stay comparable to each other.
const DEFAULT_MAX_TURNS   = 50;
const FULLSTACK_MAX_TURNS = 120;
const FULLSTACK_TASKS     = new Set(['task12', 'task13']);

function maxTurnsFor(taskId) {
  return FULLSTACK_TASKS.has(taskId) ? FULLSTACK_MAX_TURNS : DEFAULT_MAX_TURNS;
}

// Instructions directories hold every task's spec side by side, so an agent
// that goes exploring can find and start a task it wasn't asked to run (seen
// in practice: a task12 run also implementing task13's ProfilePage). Naming
// the scope explicitly keeps runs — and their turn/cost accounting —
// attributable to the task actually being measured.
function scopeGuard(taskId) {
  return [
    `Scope constraint: only read and implement the instructions for ${taskId}.`,
    `Do not open, reference, or implement any other numbered task file in`,
    `either repo's instructions/ directory (e.g. any other taskN.md /`,
    `TASKN.MD), even if it looks related or seems like a natural next step.`,
    `If you finish ${taskId} early, stop — do not start additional tasks.`,
  ].join(' ');
}

const PROMPTS = {
  gsd:    (target, taskId) => `/gsd-loop\n\nUse GSD to complete the ${target} task ${taskId}.\n\n${scopeGuard(taskId)}`,
  wiggum: (target, taskId) => `/wiggum-loop\n\nUse the Wiggum loop to complete the ${target} task ${taskId}.\n\n${scopeGuard(taskId)}`,
};

export function runAgent({ repoRoot, resultDir, framework, target, taskId }) {
  const maxTurns = maxTurnsFor(taskId);
  console.log(`\n[2/5 agent] Running ${framework.toUpperCase()} on ${target} ${taskId} (max-turns=${maxTurns})...`);

  const agentStart = Date.now();
  const claudeResult = capture('claude', [
    '--print',
    '--output-format', 'json',
    '--max-turns', String(maxTurns),
    '--dangerously-skip-permissions',
    '-p', PROMPTS[framework](target, taskId),
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
    exit_code:        claudeResult.status,
    wall_duration_ms: wallDurationMs,
    cost_usd:         null,
    num_turns:        null,
    session_id:       null,
    is_error:         null,
  };

  try {
    const parsed = JSON.parse((claudeResult.stdout || '').trim());
    agentMeta.cost_usd   = parsed.total_cost_usd ?? null;
    agentMeta.num_turns  = parsed.num_turns  ?? null;
    agentMeta.session_id = parsed.session_id ?? null;
    agentMeta.is_error   = parsed.is_error   ?? false;
  } catch {
    agentMeta.parse_error = 'Could not parse claude JSON output — check agent-stdout.txt';
  }

  console.log(`Agent done — cost: $${agentMeta.cost_usd ?? 'unknown'}, turns: ${agentMeta.num_turns ?? 'unknown'}`);

  return agentMeta;
}
