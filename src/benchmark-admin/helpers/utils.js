import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export function adminBin(adminBins, name) {
  return join(adminBins, name);
}

export function targetBin(adminBins, targetBins, name) {
  const p = join(targetBins, name);
  return existsSync(p) ? p : adminBin(adminBins, name);
}

export function tryRun(cmd, cwd) {
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

export function nullDimension(keys, error) {
  const obj = { error };
  for (const k of keys) obj[k] = null;
  return obj;
}
