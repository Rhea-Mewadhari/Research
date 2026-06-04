// Penalty table: each metric with a positive delta (regression) incurs a
// penalty. Penalties are capped per metric so one runaway value can't tank
// the whole score. qualityScore = max(0, 1 - totalPenalty)
const QUALITY_PENALTIES = {
  // Security — most critical: new findings are always bad
  security: {
    totalFindingCount: { perUnit: 0.20, max: 0.40 },
  },
  // Type discipline — GSD explicitly forbids any/ts-ignore/type errors
  typeDiscipline: {
    typeErrorCount:        { perUnit: 0.05, max: 0.20 },
    anyUsageCount:         { perUnit: 0.08, max: 0.20 },
    nonNullAssertionCount: { perUnit: 0.03, max: 0.10 },
    tsIgnoreCount:         { perUnit: 0.10, max: 0.20 },
  },
  // Coupling — circular deps and layer violations are structural regressions
  coupling: {
    circularDependencyCount: { perUnit: 0.15, max: 0.30 },
    layerViolationCount:     { perUnit: 0.10, max: 0.25 },
    crossModuleImportCount:  { perUnit: 0.005, max: 0.05 },
  },
  // Complexity — meaningful but lower priority than the above
  complexity: {
    cognitiveComplexityTotal: { perUnit: 0.02, max: 0.20 },
    functionsOverThreshold:   { perUnit: 0.05, max: 0.15 },
    maxNestingDepth:          { perUnit: 0.05, max: 0.10 },
    functionsTooLong:         { perUnit: 0.01, max: 0.15 },
  },
  // Duplication — lowest weight
  duplication: {
    duplicateBlockCount: { perUnit: 0.05, max: 0.15 },
    duplicatedLines:     { perUnit: 0.001, max: 0.10 },
  },
};

function round(num) {
  return Math.round(num * 1000) / 1000;
}

export function computeQualityScore(delta) {
  let totalPenalty = 0;

  for (const [dimension, metrics] of Object.entries(QUALITY_PENALTIES)) {
    const dimData = delta[dimension];
    if (!dimData || dimData.status !== 'compared') continue;

    for (const [metric, { perUnit, max }] of Object.entries(metrics)) {
      const metricData = dimData[metric];
      if (!metricData) continue;
      const regression = metricData.delta ?? 0;
      if (regression > 0) {
        totalPenalty += Math.min(regression * perUnit, max);
      }
    }
  }

  return round(Math.max(0, 1 - totalPenalty));
}
