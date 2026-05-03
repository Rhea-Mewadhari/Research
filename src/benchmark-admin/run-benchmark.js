const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[4] || 'frontend'; // frontend | backend

const repoRoot = path.resolve(
  __dirname,
  `../benchmark-${target}`
);

const hiddenTestsRoot = path.resolve(
  __dirname,
  `hidden-tests/${target}`
);
const resultsRoot = path.resolve(__dirname, 'results');

const taskId = process.argv[2] || 'unknown_task';
const runId = process.argv[3] || `run_${Date.now()}`;

if (!fs.existsSync(resultsRoot)) {
  fs.mkdirSync(resultsRoot, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCommand(command, cwd) {
  const start = Date.now();
  try {
    const stdout = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return {
      success: true,
      stdout,
      stderr: '',
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout ? String(error.stdout) : '',
      stderr: error.stderr ? String(error.stderr) : String(error.message),
      durationMs: Date.now() - start,
    };
  }
}

function parseVitestSummary(output) {
  const text = output || '';

  let passed = 0;
  let failed = 0;
  let total = 0;

  const passedMatch = text.match(/(\d+)\s+passed/i);
  const failedMatch = text.match(/(\d+)\s+failed/i);

  if (passedMatch) passed = Number(passedMatch[1]);
  if (failedMatch) failed = Number(failedMatch[1]);

  total = passed + failed;

  return {
    passed,
    failed,
    total,
  };
}

function copyHiddenTests() {
  const targetTestsDir = path.join(repoRoot, 'tests');
  const hiddenFiles = fs.readdirSync(hiddenTestsRoot).filter((file) =>
  file.endsWith('.test.ts') || file.endsWith('.test.tsx')
);

  for (const file of hiddenFiles) {
    const src = path.join(hiddenTestsRoot, file);
    const dest = path.join(targetTestsDir, file);
    fs.copyFileSync(src, dest);
  }

  return hiddenFiles;
}

function removeHiddenTests(files) {
  const targetTestsDir = path.join(repoRoot, 'tests');

  for (const file of files) {
    const target = path.join(targetTestsDir, file);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  }
}

function writeLog(dir, name, content) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

function main() {
  const startedAt = nowIso();
  const runStart = Date.now();

  const resultDir = path.join(resultsRoot, `${taskId}__${runId}`);
  ensureDir(resultDir);

  const summary = {
    taskId,
    runId,
    timestamp: startedAt,
    build: {
      success: false,
    },
    visibleTests: {
      success: false,
      passed: 0,
      failed: 0,
      total: 0,
    },
    hiddenTests: {
      success: false,
      passed: 0,
      failed: 0,
      total: 0,
    },
    overall: {
      success: false,
    },
    timing: {
      visibleMs: 0,
      hiddenMs: 0,
      buildMs: 0,
      totalMs: 0,
    },
  };

  console.log(`Running benchmark for task=${taskId}, run=${runId}`);
  const bugType = process.argv[5]; // logical | syntax | undefined

  if (bugType) {
    console.log(`Injecting ${bugType} bugs for ${target}...`);

    const injectionScript = path.resolve(
      __dirname,
      `bug-injections/${target}/inject-${bugType}-bugs.js`
    );

    if (fs.existsSync(injectionScript)) {
      runCommand(`node ${injectionScript}`, __dirname);
    } else {
      console.warn(`No injection script found for ${target}/${bugType}`);
    }
  }

  // Visible tests
  const visible = runCommand('npm test -- --run', repoRoot);
  summary.timing.visibleMs = visible.durationMs;
  writeLog(resultDir, 'visible-tests.stdout.txt', visible.stdout);
  writeLog(resultDir, 'visible-tests.stderr.txt', visible.stderr);

  const visibleParsed = parseVitestSummary(`${visible.stdout}\n${visible.stderr}`);
  summary.visibleTests = {
    success: visible.success,
    ...visibleParsed,
  };

  // Hidden tests
  let hiddenFiles = [];
  try {
    hiddenFiles = copyHiddenTests();

    const hidden = runCommand('npm test -- --run', repoRoot);
    summary.timing.hiddenMs = hidden.durationMs;
    writeLog(resultDir, 'hidden-tests.stdout.txt', hidden.stdout);
    writeLog(resultDir, 'hidden-tests.stderr.txt', hidden.stderr);

    const hiddenParsed = parseVitestSummary(`${hidden.stdout}\n${hidden.stderr}`);
    summary.hiddenTests = {
      success: hidden.success,
      ...hiddenParsed,
    };
  } finally {
    removeHiddenTests(hiddenFiles);
  }

  // Build
  const build = runCommand('npm run build', repoRoot);
  summary.timing.buildMs = build.durationMs;
  writeLog(resultDir, 'build.stdout.txt', build.stdout);
  writeLog(resultDir, 'build.stderr.txt', build.stderr);

  summary.build.success = build.success;

  summary.overall.success =
    summary.visibleTests.success &&
    summary.hiddenTests.success &&
    summary.build.success;

  summary.timing.totalMs = Date.now() - runStart;

  fs.writeFileSync(
    path.join(resultDir, 'summary.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );

  // ======================
  // SCORING MODEL
  // ======================

  function safeRate(passed, total) {
    if (!total || total === 0) return 0;
    return passed / total;
  }

  const score = {
    visiblePassRate: safeRate(
      summary.visibleTests.passed,
      summary.visibleTests.total
    ),

    hiddenPassRate: safeRate(
      summary.hiddenTests.passed,
      summary.hiddenTests.total
    ),

    robustnessGap: 0,
    buildStability: summary.build.success ? 1 : 0,
    overallScore: 0
  };

  // Robustness gap
  score.robustnessGap =
    score.visiblePassRate - score.hiddenPassRate;

  // Clamp (avoid negative edge cases)
  if (score.robustnessGap < 0) {
    score.robustnessGap = 0;
  }

  // Weighted scoring
  score.overallScore =
    (score.visiblePassRate * 0.3) +
    (score.hiddenPassRate * 0.5) +
    (score.buildStability * 0.2);

  // Round for cleaner output
  function round(num) {
    return Math.round(num * 1000) / 1000;
  }

  score.visiblePassRate = round(score.visiblePassRate);
  score.hiddenPassRate = round(score.hiddenPassRate);
  score.robustnessGap = round(score.robustnessGap);
  score.overallScore = round(score.overallScore);

  // Attach to summary
  summary.score = score;

  console.log(JSON.stringify(summary, null, 2));
}

main();