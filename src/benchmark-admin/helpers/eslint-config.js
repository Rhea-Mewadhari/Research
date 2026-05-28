import { ESLint } from 'eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';
import { BACKEND_DEAD_FILES } from './paths.js';

export function srcGlobs(target) {
  return target === 'frontend'
    ? ['**/*.ts', '**/*.tsx']
    : ['**/*.ts'];
}

export function makeEslintConfig(target, srcDir, ruleSet) {
  const ignores = target === 'backend'
    ? BACKEND_DEAD_FILES.map(f => `**/${f}`)
    : [];

  // In ESLint v9, files that don't match any config block's `files` key are excluded.
  // cwd must be srcDir so relative globs resolve within the target project.
  return new ESLint({
    cwd: srcDir,
    overrideConfigFile: true,
    overrideConfig: [
      ...(ignores.length ? [{ ignores }] : []),
      {
        files: srcGlobs(target),
        plugins: {
          sonarjs,
          '@typescript-eslint': tseslint.plugin,
        },
        languageOptions: {
          parser: tseslint.parser,
        },
        rules: ruleSet,
      },
    ],
  });
}
