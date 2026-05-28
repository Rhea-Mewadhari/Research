import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { nullDimension, adminBin, tryRun } from '../helpers/utils.js';
import { BACKEND_DEAD_FILES } from '../helpers/paths.js';

export function runDuplication({ target, srcDir, adminBins }) {
  const keys = ['duplicateBlockCount', 'duplicatedLines', 'duplicatedTokens', 'findings'];

  const tmpDir = join(os.tmpdir(), `jscpd-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    const jscpdBin = adminBin(adminBins, 'jscpd');

    // jscpd must run from srcDir with "." — absolute Windows paths are not resolved correctly
    // .tsx files are not in the built-in typescript format; register them via --formats-exts
    const formatArg = target === 'frontend'
      ? '--format typescript --formats-exts "typescript:tsx"'
      : '--format typescript';

    const ignoreArg = target === 'backend'
      ? BACKEND_DEAD_FILES.map(f => `--ignore "${f}"`).join(' ')
      : '';

    tryRun(
      `"${jscpdBin}" . --min-tokens 30 --reporters json --output "${tmpDir}" ${formatArg} ${ignoreArg} --no-gitignore`,
      srcDir,
    );

    const reportPath = join(tmpDir, 'jscpd-report.json');
    if (!existsSync(reportPath)) {
      // jscpd writes the report even with 0 clones; a missing file means a hard failure
      return nullDimension(keys, 'jscpd produced no report file — check jscpd installation');
    }

    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    const stats  = report.statistics?.total ?? {};

    return {
      error:               null,
      duplicateBlockCount: stats.clones          ?? 0,
      duplicatedLines:     stats.duplicatedLines  ?? 0,
      duplicatedTokens:    stats.duplicatedTokens ?? 0,
      findings: (report.duplicates || []).map(d => ({
        format:     d.format,
        lines:      d.lines,
        tokens:     d.tokens,
        firstFile:  d.firstFile?.name,
        secondFile: d.secondFile?.name,
      })),
    };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  } finally {
    try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
}
