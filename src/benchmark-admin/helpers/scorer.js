function safeRate(passed, total) {
  if (!total || total === 0) return 0;
  return passed / total;
}

function round(num) {
  return Math.round(num * 1000) / 1000;
}

export function computeScore(summary) {
  const visiblePassRate = safeRate(summary.visibleTests.passed, summary.visibleTests.total);
  const hiddenPassRate  = safeRate(summary.hiddenTests.passed,  summary.hiddenTests.total);
  const buildStability  = summary.build.success ? 1 : 0;

  const robustnessGap = Math.max(0, visiblePassRate - hiddenPassRate);

  const overallScore =
    (visiblePassRate * 0.3) +
    (hiddenPassRate  * 0.5) +
    (buildStability  * 0.2);

  return {
    visiblePassRate: round(visiblePassRate),
    hiddenPassRate:  round(hiddenPassRate),
    robustnessGap:   round(robustnessGap),
    buildStability,
    overallScore:    round(overallScore),
  };
}
