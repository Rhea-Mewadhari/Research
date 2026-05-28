import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { diffDimension, numericDelta } from './helpers/delta-helpers.js';

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

if (security.status === 'compared') {
  const bSev = baseline.security.bySeverity  ?? {};
  const pSev = postAgent.security.bySeverity ?? {};
  const allSevs = new Set([...Object.keys(bSev), ...Object.keys(pSev)]);
  security.bySeverity = {};
  for (const sev of allSevs) {
    security.bySeverity[sev] = numericDelta(bSev[sev] ?? 0, pSev[sev] ?? 0);
  }
}

const delta = {
  meta: {
    baselineFile:    resolve(baselineFile),
    postAgentFile:   resolve(postAgentFile),
    generatedAt:     new Date().toISOString(),
    baselineTarget:  baseline.meta?.target,
    postAgentTarget: postAgent.meta?.target,
  },
  complexity,
  coupling,
  duplication,
  typeDiscipline,
  security,
};

const outPath = resolve(outputFile);
const outDir  = dirname(outPath);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

writeFileSync(outPath, JSON.stringify(delta, null, 2), 'utf8');
console.log(`[delta] written to ${outPath}`);
