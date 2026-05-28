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
  const passedMatch = text.match(/(\d+)\s+passed/i);
  const failedMatch = text.match(/(\d+)\s+failed/i);
  const passed = passedMatch ? Number(passedMatch[1]) : 0;
  const failed = failedMatch ? Number(failedMatch[1]) : 0;
  return { passed, failed, total: passed + failed };
}

export function writeLog(dir, name, content) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}
