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

export function capture(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.error) throw result.error;
  return result;
}
