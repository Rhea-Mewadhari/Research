import { spawnSync } from 'child_process';

export function run(label, cmd, args, cwd) {
  console.log(`\n[${label}] ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', encoding: 'utf8' });
  if (result.error) {
    console.error(`Failed to spawn ${cmd}: ${result.error.message}`);
    process.exit(1);
  }
  return result;
}

export function capture(cmd, args, cwd, { timeoutMs } = {}) {
  const result = spawnSync(cmd, args, {
    cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
    ...(timeoutMs ? { timeout: timeoutMs, killSignal: 'SIGKILL' } : {}),
  });
  // A timeout kill sets result.error to an ETIMEDOUT Error (verified against
  // the Node version actually running this) rather than leaving result.error
  // unset with just result.signal populated — check for it before the
  // generic error throw below, or every real timeout would crash the whole
  // harness process instead of becoming a retriable failure.
  if (result.error?.code === 'ETIMEDOUT' || result.signal) {
    result.timedOut = true;
    return result;
  }
  if (result.error) throw result.error;
  return result;
}
