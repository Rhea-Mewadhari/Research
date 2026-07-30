function safeRate(passed, total) {
  if (!total || total === 0) return 0;
  return passed / total;
}

function round(num) {
  return Math.round(num * 1000) / 1000;
}

export function computeScore(summary) {
  const visiblePassRate = safeRate(summary.visibleTests.passed, summary.visibleTests.total);
  const buildStability  = summary.build.success ? 1 : 0;
  // Whether hidden tests exist for this task is a fact about the task
  // (how many files the manifest declared), not about whether the run
  // produced a parseable count — a crashed run must still be scored as a
  // hidden-test failure, not silently treated as "no hidden tests".
  const hasHiddenTests  = (summary.hiddenTests.expectedFiles ?? summary.hiddenTests.total) > 0;

  if (!hasHiddenTests) {
    return {
      visiblePassRate:  round(visiblePassRate),
      hiddenPassRate:   null,
      robustnessGap:    null,
      buildStability,
      correctnessScore: round((visiblePassRate * 0.8) + (buildStability * 0.2)),
      hiddenTestsNote:  'No hidden tests for this task; visible weight 80%, build weight 20%.',
    };
  }

  const hiddenPassRate = safeRate(summary.hiddenTests.passed, summary.hiddenTests.total);
  const robustnessGap  = Math.max(0, visiblePassRate - hiddenPassRate);

  // Testgen tasks include branch coverage in correctnessScore:
  //   hidden 40% + coverage 30% + visible 20% + build 10%
  // All other tasks use the standard formula:
  //   hidden 50% + visible 30% + build 20%
  const branchPct = summary.coverage?.branchPct ?? null;
  const correctnessScore = branchPct != null
    ? (hiddenPassRate  * 0.4) +
      (branchPct       * 0.3) +
      (visiblePassRate * 0.2) +
      (buildStability  * 0.1)
    : (visiblePassRate * 0.3) +
      (hiddenPassRate  * 0.5) +
      (buildStability  * 0.2);

  return {
    visiblePassRate:  round(visiblePassRate),
    hiddenPassRate:   round(hiddenPassRate),
    robustnessGap:    round(robustnessGap),
    buildStability,
    correctnessScore: round(correctnessScore),
  };
}
