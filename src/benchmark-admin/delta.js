import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

const [baselineFile, postAgentFile, outputFile] = process.argv.slice(2);

if (!baselineFile || !postAgentFile || !outputFile) {
  console.error('Usage: node delta.js <baselineFile> <postAgentFile> <outputFile>');
  process.exit(1);
}

function loadReport(filePath) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(abs, 'utf8'));
}

const baseline  = loadReport(baselineFile);
const postAgent = loadReport(postAgentFile);

// ---------------------------------------------------------------------------
// Delta helpers
// ---------------------------------------------------------------------------

function dimStatus(b, p) {
  const bNull = b === null || b === undefined || b.error != null;
  const pNull = p === null || p === undefined || p.error != null;
  if (bNull && pNull)  return 'null_both';
  if (bNull)           return 'null_baseline';
  if (pNull)           return 'null_postAgent';
  return 'compared';
}

function numericDelta(bVal, pVal) {
  if (bVal == null || pVal == null) return { baseline: bVal ?? null, postAgent: pVal ?? null, delta: null };
  return { baseline: bVal, postAgent: pVal, delta: pVal - bVal };
}

function diffDimension(bDim, pDim, numericKeys) {
  const status = dimStatus(bDim, pDim);
  if (status !== 'compared') {
    return {
      status,
      baselineError:  bDim?.error ?? null,
      postAgentError: pDim?.error ?? null,
    };
  }

  const out = { status };
  for (const key of numericKeys) {
    out[key] = numericDelta(bDim[key], pDim[key]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-dimension deltas
// ---------------------------------------------------------------------------

const complexity = diffDimension(
  baseline.complexity, postAgent.complexity,
  ['cognitiveComplexityTotal', 'functionsOverThreshold', 'maxNestingDepth', 'functionsTooLong'],
);

const coupling = diffDimension(
  baseline.coupling, postAgent.coupling,
  ['circularDependencyCount', 'crossModuleImportCount', 'layerViolationCount'],
);

const duplication = diffDimension(
  baseline.duplication, postAgent.duplication,
  ['duplicateBlockCount', 'duplicatedLines', 'duplicatedTokens'],
);

const typeDiscipline = diffDimension(
  baseline.typeDiscipline, postAgent.typeDiscipline,
  ['typeErrorCount', 'anyUsageCount', 'nonNullAssertionCount', 'tsIgnoreCount'],
);

const security = diffDimension(
  baseline.security, postAgent.security,
  ['totalFindingCount'],
);

// For security, also diff bySeverity if both available
if (security.status === 'compared') {
  const bSev = baseline.security.bySeverity  ?? {};
  const pSev = postAgent.security.bySeverity ?? {};
  const allSevs = new Set([...Object.keys(bSev), ...Object.keys(pSev)]);
  security.bySeverity = {};
  for (const sev of allSevs) {
    security.bySeverity[sev] = numericDelta(bSev[sev] ?? 0, pSev[sev] ?? 0);
  }
}

// ---------------------------------------------------------------------------
// Assemble and write
// ---------------------------------------------------------------------------

const delta = {
  meta: {
    baselineFile:  resolve(baselineFile),
    postAgentFile: resolve(postAgentFile),
    generatedAt:   new Date().toISOString(),
    baselineTarget:  baseline.meta?.target,
    postAgentTarget: postAgent.meta?.target,
  },
  complexity,
  coupling,
  duplication,
  typeDiscipline,
  security,
};

const outDir = dirname(resolve(outputFile));
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

writeFileSync(resolve(outputFile), JSON.stringify(delta, null, 2), 'utf8');
console.log(`[delta] written to ${resolve(outputFile)}`);
