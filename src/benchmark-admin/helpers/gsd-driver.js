import fs from 'fs';
import path from 'path';
import { invokeClaude } from './agent-runner.js';
import { commitAll } from './git-utils.js';

const VERIFY_RESULT_PATH = '.planning/verify-result.json';
const MAX_REWORK = 2;

function readVerifyResult(repoRoot) {
  const file = path.join(repoRoot, VERIFY_RESULT_PATH);
  if (!fs.existsSync(file)) {
    return { passed: false, criteria: [], notes: 'verify-result.json not found — treating as failed' };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { passed: parsed.passed === true, criteria: parsed.criteria ?? [] };
  } catch {
    return { passed: false, criteria: [], notes: 'verify-result.json unparseable — treating as failed' };
  }
}

function formatCriteria(criteria) {
  return criteria
    .filter(c => !c.passed)
    .map(c => `- [${c.id}] ${c.description} — evidence: ${c.evidence ?? 'none given'}`)
    .join('\n');
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

// Six fresh `claude` invocations, one per GSD phase — state carried only via
// .planning/ files and the commit the driver makes after each phase, never
// via a shared session. verify-work is a real gate: complete-milestone only
// runs if verify-result.json says passed:true, with a bounded rework loop
// back through execute-phase in between.
export function runGsd({ repoRoot, resultDir, target, taskId }) {
  const invocations = [];
  const invocationLabels = [];
  const phases = [];

  const runPhase = (name, extra = '') => {
    const result = invokeClaude(
      `/gsd:${name}\n\nTarget: ${target}\nTask: ${taskId}${extra}`,
      { repoRoot, label: name, resultDir }
    );
    const commitSha = commitAll(repoRoot, `gsd: ${name} (${taskId})`);
    invocations.push(result);
    invocationLabels.push(name);
    phases.push({ name, commitSha, ...result });
    return result;
  };

  runPhase('new-project');
  runPhase('discuss-phase');
  runPhase('plan-phase');
  runPhase('execute-phase');

  runPhase('verify-work');
  let verify = readVerifyResult(repoRoot);
  const passedFirstAttempt = verify.passed;

  let reworkAttempts = 0;
  while (!verify.passed && reworkAttempts < MAX_REWORK) {
    reworkAttempts++;
    runPhase(
      'execute-phase',
      `\n\nRework attempt ${reworkAttempts}/${MAX_REWORK} — verify-work failed. ` +
      `Address these failed criteria:\n${formatCriteria(verify.criteria)}`
    );
    runPhase('verify-work');
    verify = readVerifyResult(repoRoot);
  }

  const completed = verify.passed;
  if (completed) {
    runPhase('complete-milestone');
  }

  const totals = summarizeTotals(invocations);

  return {
    ...totals,
    invocationLabels,
    detail: {
      phases,
      passedFirstAttempt,
      reworkAttempts,
      completed,
      failedAtPhase: completed ? null : 'verify-work',
      failedCriteria: completed ? [] : verify.criteria.filter(c => !c.passed),
    },
  };
}
