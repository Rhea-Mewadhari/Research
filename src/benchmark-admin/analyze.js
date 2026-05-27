import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { ESLint } from 'eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

const [target, outputFile] = process.argv.slice(2);

if (!target || !outputFile) {
  console.error('Usage: node analyze.js <frontend|backend> <outputFile>');
  process.exit(1);
}
if (target !== 'frontend' && target !== 'backend') {
  console.error('target must be "frontend" or "backend"');
  process.exit(1);
}

const targetDir = resolve(__dirname, `../benchmark-${target}`);
const srcDir    = join(targetDir, 'src');
const adminDir  = __dirname;
const adminBins = join(adminDir, 'node_modules', '.bin');
const targetBins = join(targetDir, 'node_modules', '.bin');

const BACKEND_DEAD_FILES = ['counter.ts', 'main.ts'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function adminBin(name) {
  return join(adminBins, name);
}

function targetBin(name) {
  const p = join(targetBins, name);
  return existsSync(p) ? p : adminBin(name);
}

function tryRun(cmd, cwd = adminDir) {
  try {
    const stdout = execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, stdout, stderr: '' };
  } catch (e) {
    return {
      ok: false,
      stdout: e.stdout ? String(e.stdout) : '',
      stderr: e.stderr ? String(e.stderr) : String(e.message),
    };
  }
}

function nullDimension(keys, error) {
  const obj = { error };
  for (const k of keys) obj[k] = null;
  return obj;
}

// ---------------------------------------------------------------------------
// Build ESLint config shared across both ESLint passes
// ---------------------------------------------------------------------------

function makeEslintConfig(ruleSet) {
  const ignores = target === 'backend'
    ? BACKEND_DEAD_FILES.map(f => `**/${f}`)
    : [];

  // In ESLint v9, files that don't match any config block's `files` key are excluded.
  // cwd must be srcDir so relative globs resolve within the target project.
  const files = target === 'frontend'
    ? ['**/*.ts', '**/*.tsx']
    : ['**/*.ts'];

  return new ESLint({
    cwd: srcDir,
    overrideConfigFile: true,
    overrideConfig: [
      ...(ignores.length ? [{ ignores }] : []),
      {
        files,
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

function srcGlobs() {
  return target === 'frontend'
    ? ['**/*.ts', '**/*.tsx']
    : ['**/*.ts'];
}

// ---------------------------------------------------------------------------
// Complexity dimension
// ---------------------------------------------------------------------------

async function runComplexity() {
  const keys = ['cognitiveComplexityTotal', 'functionsOverThreshold', 'maxNestingDepth', 'functionsTooLong', 'findings'];
  try {
    const eslint = makeEslintConfig({
      'sonarjs/cognitive-complexity':  ['warn', 0],
      'max-depth':                     ['warn', 0],
      'max-lines-per-function':        ['warn', { max: 0, skipBlankLines: false, skipComments: false }],
    });

    const results = await eslint.lintFiles(srcGlobs());

    let cognitiveComplexityTotal = 0;
    let functionsOverThreshold   = 0;
    let maxNestingDepth          = 0;
    let functionsTooLong         = 0;
    const findings = [];

    for (const file of results) {
      for (const msg of file.messages) {
        const entry = { file: file.filePath, line: msg.line, rule: msg.ruleId, value: null };

        if (msg.ruleId === 'sonarjs/cognitive-complexity') {
          const m = msg.message.match(/(\d+)/);
          const val = m ? parseInt(m[1], 10) : 1;
          entry.value = val;
          cognitiveComplexityTotal += val;
          functionsOverThreshold++;
          findings.push(entry);
        } else if (msg.ruleId === 'max-depth') {
          const m = msg.message.match(/(\d+)/);
          const val = m ? parseInt(m[1], 10) : 1;
          entry.value = val;
          if (val > maxNestingDepth) maxNestingDepth = val;
          findings.push(entry);
        } else if (msg.ruleId === 'max-lines-per-function') {
          functionsTooLong++;
          findings.push(entry);
        }
      }
    }

    return { error: null, cognitiveComplexityTotal, functionsOverThreshold, maxNestingDepth, functionsTooLong, findings };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  }
}

// ---------------------------------------------------------------------------
// Type discipline dimension
// ---------------------------------------------------------------------------

async function runTypeDiscipline() {
  const keys = ['typeErrorCount', 'anyUsageCount', 'nonNullAssertionCount', 'tsIgnoreCount'];

  // --- tsc (use target project's own tsc binary for correct TS version) ---
  let typeErrorCount = 0;
  let tscError = null;
  try {
    const tscBin      = targetBin('tsc');
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

  // --- ESLint type-discipline rules ---
  try {
    const eslint = makeEslintConfig({
      '@typescript-eslint/no-explicit-any':       'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment':        ['warn', {
        'ts-ignore':       true,
        'ts-nocheck':      false,
        'ts-check':        false,
        'ts-expect-error': false,
      }],
    });

    const results = await eslint.lintFiles(srcGlobs());

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

// ---------------------------------------------------------------------------
// Coupling dimension
// ---------------------------------------------------------------------------

function runCoupling() {
  const keys = ['circularDependencyCount', 'circularPaths', 'crossModuleImportCount', 'layerViolationCount', 'layerViolations'];

  try {
    const madgeBin = adminBin('madge');
    const ext      = target === 'frontend' ? 'ts,tsx' : 'ts';
    const srcArg   = `"${srcDir}"`;

    // Circular dependencies
    const circResult = tryRun(`"${madgeBin}" --extensions ${ext} --circular --json ${srcArg}`);
    let circularPaths = [];
    try { circularPaths = JSON.parse(circResult.stdout || '[]'); } catch { /* leave empty */ }
    const circularDependencyCount = circularPaths.length;

    // Full dependency graph → total import edge count
    const graphResult = tryRun(`"${madgeBin}" --extensions ${ext} --json ${srcArg}`);
    let crossModuleImportCount = 0;
    try {
      const graph = JSON.parse(graphResult.stdout || '{}');
      for (const deps of Object.values(graph)) crossModuleImportCount += deps.length;
    } catch { /* leave 0 */ }

    // Layer violations (backend only via dependency-cruiser)
    let layerViolationCount = 0;
    let layerViolations     = [];

    if (target === 'backend') {
      const depCruiseBin = adminBin('depcruise');
      const configPath   = resolve(adminDir, '.depcruiser-backend.cjs');
      const dcResult     = tryRun(
        `"${depCruiseBin}" --config "${configPath}" --output-type json ${srcArg}`,
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

// ---------------------------------------------------------------------------
// Duplication dimension
// ---------------------------------------------------------------------------

function runDuplication() {
  const keys = ['duplicateBlockCount', 'duplicatedLines', 'duplicatedTokens', 'findings'];

  const tmpDir = join(os.tmpdir(), `jscpd-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    const jscpdBin  = adminBin('jscpd');

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
      duplicateBlockCount: stats.clones         ?? 0,
      duplicatedLines:     stats.duplicatedLines ?? 0,
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

// ---------------------------------------------------------------------------
// Security dimension
// ---------------------------------------------------------------------------

function runSecurity() {
  const keys = ['totalFindingCount', 'bySeverity', 'findings'];

  try {
    const semgrepBin = adminBin('semgrep');
    const configs    = ['p/typescript', 'p/javascript', 'p/react', 'p/express']
      .map(c => `--config ${c}`)
      .join(' ');

    const result = tryRun(
      `"${semgrepBin}" scan ${configs} --json --no-rewrite-rule-ids "${srcDir}"`,
    );

    // semgrep exits 0 (no findings) or 1 (findings found) — both produce valid JSON on stdout.
    // If stdout is empty the binary wasn't found or crashed before producing output.
    if (!result.stdout) {
      const hint = result.stderr.slice(0, 200) || 'binary not found or produced no output';
      return nullDimension(keys, `semgrep unavailable: ${hint}`);
    }

    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      const hint = result.stderr.slice(0, 200) || result.stdout.slice(0, 200);
      return nullDimension(keys, `semgrep JSON parse failed: ${hint}`);
    }

    const rawFindings = parsed.results || [];
    const bySeverity  = {};
    const findings    = rawFindings.map(f => {
      const sev = f.extra?.severity ?? 'UNKNOWN';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
      return {
        ruleId:   f.check_id,
        severity: sev,
        file:     f.path,
        line:     f.start?.line,
        message:  f.extra?.message,
      };
    });

    return { error: null, totalFindingCount: findings.length, bySeverity, findings };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`[analyze] target=${target} src=${srcDir}`);

  const report = {
    meta: {
      target,
      generatedAt: new Date().toISOString(),
      srcDir,
    },
  };

  console.log('[analyze] running complexity...');
  report.complexity = await runComplexity();

  console.log('[analyze] running typeDiscipline...');
  report.typeDiscipline = await runTypeDiscipline();

  console.log('[analyze] running coupling...');
  report.coupling = runCoupling();

  console.log('[analyze] running duplication...');
  report.duplication = runDuplication();

  console.log('[analyze] running security...');
  report.security = runSecurity();

  const outPath = resolve(outputFile);
  const outDir  = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[analyze] written to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
