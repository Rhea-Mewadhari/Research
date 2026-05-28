import { resolve } from 'path';
import { nullDimension, adminBin, tryRun } from '../helpers/utils.js';

export function runCoupling({ target, srcDir, adminDir, adminBins }) {
  const keys = ['circularDependencyCount', 'circularPaths', 'crossModuleImportCount', 'layerViolationCount', 'layerViolations'];

  try {
    const madgeBin = adminBin(adminBins, 'madge');
    const ext      = target === 'frontend' ? 'ts,tsx' : 'ts';
    const srcArg   = `"${srcDir}"`;

    const circResult = tryRun(`"${madgeBin}" --extensions ${ext} --circular --json ${srcArg}`, adminDir);
    let circularPaths = [];
    try { circularPaths = JSON.parse(circResult.stdout || '[]'); } catch { /* leave empty */ }
    const circularDependencyCount = circularPaths.length;

    const graphResult = tryRun(`"${madgeBin}" --extensions ${ext} --json ${srcArg}`, adminDir);
    let crossModuleImportCount = 0;
    try {
      const graph = JSON.parse(graphResult.stdout || '{}');
      for (const deps of Object.values(graph)) crossModuleImportCount += deps.length;
    } catch { /* leave 0 */ }

    let layerViolationCount = 0;
    let layerViolations     = [];

    if (target === 'backend') {
      const depCruiseBin = adminBin(adminBins, 'depcruise');
      const configPath   = resolve(adminDir, '.depcruiser-backend.cjs');
      const dcResult     = tryRun(
        `"${depCruiseBin}" --config "${configPath}" --output-type json ${srcArg}`,
        adminDir,
      );
      try {
        const dcJson = JSON.parse(dcResult.stdout || '{}');
        const violations = (dcJson.modules || [])
          .flatMap(m => (m.dependencies || []).map(d => ({ source: m.source, ...d })))
          .filter(d => d.rules && d.rules.length > 0);
        layerViolationCount = violations.length;
        layerViolations     = violations.map(d => ({
          from: d.source,
          to:   d.resolved,
          rule: d.rules[0]?.name,
        }));
      } catch { /* leave 0 */ }
    }

    return { error: null, circularDependencyCount, circularPaths, crossModuleImportCount, layerViolationCount, layerViolations };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  }
}
