import fs from 'fs';
import path from 'path';
import { invokeClaude } from './agent-runner.js';
import { checkpoint } from './sandbox.js';

const PLAN_PATH = '.wiggum/plan.json';

function readPlan(workDir) {
  const file = path.join(workDir, PLAN_PATH);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function hasOpenPhases(plan) {
  return !!plan && Array.isArray(plan.phases) && plan.phases.some(p => p.status === 'open');
}

function firstOpenPhaseId(plan) {
  if (!plan || !Array.isArray(plan.phases)) return null;
  const open = plan.phases.find(p => p.status === 'open');
  return open ? open.id : null;
}

function summarizeTotals(invocations) {
  const totalCostUsd = invocations.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
  const totalTurns   = invocations.reduce((sum, r) => sum + (r.num_turns ?? 0), 0);
  const last = invocations.at(-1);
  return {
    totalCostUsd: invocations.some(r => r.cost_usd != null) ? totalCostUsd : null,
    totalTurns:   invocations.some(r => r.num_turns != null) ? totalTurns : null,
    exitCode:     last?.exit_code ?? null,
    isError:      invocations.some(r => r.is_error === true),
    lastSessionId: last?.session_id ?? null,
  };
}

// External restart loop: the plan-generation call and every phase call below
// are independent `claude` processes started via invokeClaude, each run
// inside the sandbox (workDir) — none of them share a session, and the
// sandbox's own history is collapsed to one commit before and after each of
// them (see sandbox.js), so only .wiggum/plan.json and the files on disk
// persist across iterations, matching the Ralph Wiggum Loop's own restart
// mechanism.
export function runWiggum({ workDir, resultDir, target, taskId }) {
  const invocations = [];
  const invocationLabels = [];

  const planResult = invokeClaude(
    `/wiggum:plan\n\nTarget: ${target}\nTask: ${taskId}\n\n` +
    `Read the task instructions and produce ${PLAN_PATH}: a plan broken into ` +
    `discrete phases, each with an id, a title, and status "open". Do not ` +
    `write any implementation code in this step.`,
    { workDir, label: 'plan', resultDir }
  );
  let lastTreeHash = checkpoint(workDir, 'plan').treeHash;
  invocations.push(planResult);
  invocationLabels.push('plan');

  let plan = readPlan(workDir);
  const iterations = [];
  let terminationReason = 'plan-complete';
  let failedPhaseId = null;

  if (!plan) {
    terminationReason = 'no-plan';
  } else {
    const MAX_ITERATIONS = Math.max(10, plan.phases.length * 3);

    while (hasOpenPhases(plan)) {
      if (iterations.length >= MAX_ITERATIONS) {
        terminationReason = 'iteration-cap';
        break;
      }

      const planBefore = plan;
      const label = `iter${iterations.length + 1}`;

      const result = invokeClaude(
        `/wiggum:phase\n\nTarget: ${target}\nTask: ${taskId}\nPlan: ${PLAN_PATH}\n\n` +
        `Execute exactly one open phase from the plan. Do not assume any prior ` +
        `conversation context — the spec, the plan, and the current repo state ` +
        `are all you have. Update that phase's status in ${PLAN_PATH} before you stop.`,
        { workDir, label, resultDir }
      );
      const { treeHash } = checkpoint(workDir, label);
      invocations.push(result);
      invocationLabels.push(label);
      iterations.push({ index: iterations.length + 1, ...result });

      plan = readPlan(workDir);
      const progressed = treeHash !== lastTreeHash || JSON.stringify(planBefore) !== JSON.stringify(plan);
      lastTreeHash = treeHash;

      if (!progressed) {
        terminationReason = 'no-progress';
        failedPhaseId = firstOpenPhaseId(planBefore);
        break;
      }
    }
    // The while condition guarantees no open phases remain unless the loop
    // was broken out of above (both breaks set terminationReason already),
    // so 'plan-complete' is only left standing when the plan is genuinely done.
  }

  const totals = summarizeTotals(invocations);

  return {
    ...totals,
    invocationLabels,
    detail: {
      planPhases: plan?.phases ?? null,
      iterations,
      contextResets: iterations.length,
      terminationReason,
      failedPhaseId,
    },
  };
}
