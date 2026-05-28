import { nullDimension, targetBin, tryRun } from '../helpers/utils.js';
import { makeEslintConfig, srcGlobs } from '../helpers/eslint-config.js';
import { BACKEND_DEAD_FILES } from '../helpers/paths.js';

export async function runTypeDiscipline({ target, srcDir, targetDir, adminBins, targetBins }) {
  const keys = ['typeErrorCount', 'anyUsageCount', 'nonNullAssertionCount', 'tsIgnoreCount'];

  let typeErrorCount = 0;
  let tscError = null;
  try {
    const tscBin      = targetBin(adminBins, targetBins, 'tsc');
    const tsconfigArg = target === 'frontend' ? '-p tsconfig.app.json' : '-p tsconfig.json';
    const result      = tryRun(`"${tscBin}" --noEmit --strict ${tsconfigArg}`, targetDir);
    const output      = `${result.stdout}\n${result.stderr}`;

    for (const line of output.split('\n')) {
      if (target === 'backend' && BACKEND_DEAD_FILES.some(f => line.includes(f))) continue;
      if (/error TS\d+/i.test(line)) typeErrorCount++;
    }
  } catch (e) {
    tscError = String(e.message).slice(0, 300);
  }

  if (tscError) {
    return nullDimension(keys, `tsc failed: ${tscError}`);
  }

  try {
    const eslint = makeEslintConfig(target, srcDir, {
      '@typescript-eslint/no-explicit-any':       'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment':        ['warn', {
        'ts-ignore':       true,
        'ts-nocheck':      false,
        'ts-check':        false,
        'ts-expect-error': false,
      }],
    });

    const results = await eslint.lintFiles(srcGlobs(target));

    let anyUsageCount = 0, nonNullAssertionCount = 0, tsIgnoreCount = 0;

    for (const file of results) {
      for (const msg of file.messages) {
        if (msg.ruleId === '@typescript-eslint/no-explicit-any')       anyUsageCount++;
        if (msg.ruleId === '@typescript-eslint/no-non-null-assertion')  nonNullAssertionCount++;
        if (msg.ruleId === '@typescript-eslint/ban-ts-comment')         tsIgnoreCount++;
      }
    }

    return { error: null, typeErrorCount, anyUsageCount, nonNullAssertionCount, tsIgnoreCount };
  } catch (e) {
    return { error: String(e.message), typeErrorCount, anyUsageCount: null, nonNullAssertionCount: null, tsIgnoreCount: null };
  }
}
