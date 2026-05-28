import fs from 'fs';
import path from 'path';
import { capture } from './spawn-utils.js';

const PROMPTS = {
  gsd:    (target, taskId) => `/gsd-loop\n\nUse GSD to complete the ${target} task ${taskId}.`,
  wiggum: (target, taskId) => `/wiggum-loop\n\nUse the Wiggum loop to complete the ${target} task ${taskId}.`,
};

export function runAgent({ repoRoot, resultDir, framework, target, taskId }) {
  console.log(`\n[2/5 agent] Running ${framework.toUpperCase()} on ${target} ${taskId}...`);

  const agentStart = Date.now();
  const claudeResult = capture('claude', [
    '--print',
    '--output-format', 'json',
    '--max-turns', '50',
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
    agentMeta.cost_usd   = parsed.cost_usd   ?? null;
    agentMeta.num_turns  = parsed.num_turns  ?? null;
    agentMeta.session_id = parsed.session_id ?? null;
    agentMeta.is_error   = parsed.is_error   ?? false;
  } catch {
    agentMeta.parse_error = 'Could not parse claude JSON output — check agent-stdout.txt';
  }

  console.log(`Agent done — cost: $${agentMeta.cost_usd ?? 'unknown'}, turns: ${agentMeta.num_turns ?? 'unknown'}`);

  return agentMeta;
}
