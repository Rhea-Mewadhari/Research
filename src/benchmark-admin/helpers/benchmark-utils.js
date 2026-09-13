import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function nowIso() {
  return new Date().toISOString();
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function runCommand(command, cwd) {
  const start = Date.now();
  try {
    const stdout = execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { success: true, stdout, stderr: '', durationMs: Date.now() - start };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout ? String(error.stdout) : '',
      stderr: error.stderr ? String(error.stderr) : String(error.message),
      durationMs: Date.now() - start,
    };
  }
}

export function parseVitestSummary(output) {
  const text = output || '';
  // Use the last occurrences so we capture the "Tests" summary line totals
  // (individual test counts) rather than per-file inline counts or the
  // "Test Files" line that appears earlier in vitest output — the "Tests"
  // line is test-level, "Test Files" is file-level, and they usually differ.
  const passedMatches = [...text.matchAll(/(\d+)\s+passed/gi)];
  const failedMatches = [...text.matchAll(/(\d+)\s+failed/gi)];
  const passed = passedMatches.length ? Number(passedMatches.at(-1)[1]) : 0;
  const failed = failedMatches.length ? Number(failedMatches.at(-1)[1]) : 0;
  return { passed, failed, total: passed + failed };
}

export function writeLog(dir, name, content) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

// Files the agent actually touched since the last clean reset, relative to `cwd`.
// Used to scope build failures to the agent's own changes so pre-existing,
// unrelated scaffold errors elsewhere in the project don't fail the run.
export function getGitChangedFiles(cwd) {
  const normalise = (p) => p.trim().replace(/\\/g, '/');
  const runGit = (command) => {
    try {
      return execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' });
    } catch {
      return '';
    }
  };

  const modified = runGit('git diff --name-only --relative HEAD');
  const untracked = runGit('git ls-files --others --exclude-standard');

  return new Set(
    `${modified}\n${untracked}`
      .split('\n')
      .map(normalise)
      .filter(Boolean)
  );
}

// Parses `tsc` diagnostic lines of the form:
//   src/services/dataFetcher.ts(6,5): error TS2322: Type 'number' is not assignable to type 'string'.
export function parseTscErrors(output) {
  const text = output || '';
  const regex = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm;
  const errors = [];
  let match;
  while ((match = regex.exec(text))) {
    errors.push({
      file: match[1].trim().replace(/\\/g, '/'),
      line: Number(match[2]),
      column: Number(match[3]),
      code: match[4],
      message: match[5].trim(),
    });
  }
  return errors;
}
