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
  const hasHiddenTests  = summary.hiddenTests.total > 0;

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

  const hiddenPassRate   = safeRate(summary.hiddenTests.passed, summary.hiddenTests.total);
  const robustnessGap    = Math.max(0, visiblePassRate - hiddenPassRate);
  const correctnessScore =
    (visiblePassRate * 0.3) +
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
