import { runCommand } from './benchmark-utils.js';

export function getHead(cwd) {
  const result = runCommand('git rev-parse HEAD', cwd);
  return result.success ? result.stdout.trim() : null;
}

// Stages everything and commits only if there's something to commit — a no-op
// phase (e.g. an investigation-only step) must not produce an empty commit,
// since commit presence is one of the no-progress signals the drivers check.
export function commitAll(cwd, message) {
  const status = runCommand('git status --porcelain', cwd);
  if (!status.success || !status.stdout.trim()) return null;

  runCommand('git add -A', cwd);
  const commit = runCommand(`git commit -m ${JSON.stringify(message)}`, cwd);
  return commit.success ? getHead(cwd) : null;
}
