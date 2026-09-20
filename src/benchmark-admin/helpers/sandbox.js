import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { runCommand } from './benchmark-utils.js';

const ADMIN_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // helpers/ -> benchmark-admin/

const VISIBLE_TEST_DIR = {
  frontend: 'tests',
  backend:  'src/tests/visible',
};

// setup.ts/tsx is vitest config (setupFiles), not a test — never remove it
// regardless of the manifest.
const ALWAYS_KEEP = new Set(['setup.ts', 'setup.tsx']);

// Full-tree copy. Tries a macOS APFS clonefile copy first (near-instant,
// copy-on-write — cp(1) itself falls back to a regular copy if the volume
// doesn't support cloning), then falls back to a plain recursive copy
// anywhere `cp -c` isn't available (non-macOS, no `cp` at all, etc).
function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const cloned = spawnSync('cp', ['-R', '-c', `${src}/.`, dst], { stdio: 'ignore' });
  if (cloned.status !== 0) {
    fs.cpSync(src, dst, { recursive: true });
  }
}

function getTreeHash(dir) {
  const result = runCommand('git rev-parse HEAD^{tree}', dir);
  return result.success ? result.stdout.trim() : null;
}

// Wipes and recreates .git from scratch, adding and committing everything
// currently on disk as a single, brand-new commit. There is no parent commit,
// no branch but the current one, and no remote — nothing for `git log`,
// `git branch -a`, `git diff <ref>`, or `git stash` to recover an earlier
// state from, because as far as this .git is concerned, no earlier state
// ever existed. Called once at sandbox creation and again after every
// phase/iteration invocation, so this invariant holds before every single
// agent invocation, not just the first.
function reinitGit(dir, message) {
  fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true });
  runCommand('git init -q', dir);
  runCommand('git config core.logAllRefUpdates false', dir);
  runCommand('git config user.email sandbox@local', dir);
  runCommand('git config user.name sandbox', dir);
  runCommand('git add -A', dir);
  runCommand(`git commit -q -m ${JSON.stringify(message)}`, dir);
  return getTreeHash(dir);
}

// Creates an isolated copy of the current (post-bug-injection) working tree
// outside the real repo entirely (os.tmpdir(), not a subdirectory of
// repoRoot — an agent that `cd`s upward must not land back in the real repo),
// with history collapsed to one commit. This is what the agent actually runs
// in for every phase/iteration of a run.
export function createSandbox(repoRoot) {
  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'benchmark-sandbox-'));
  copyTree(repoRoot, sandboxDir);
  // .venv (semgrep's virtualenv) is unrelated to the agent's task and gets
  // discarded before the agent ever sees it — not just excluded on the way
  // back in syncBack(). It's riddled with symlinks (some absolute, some
  // relative) that a plain recursive copy can silently rewrite to point at
  // this very sandbox, so the safest thing is to never let it round-trip at
  // all.
  fs.rmSync(path.join(sandboxDir, '.venv'), { recursive: true, force: true });
  const treeHash = reinitGit(sandboxDir, 'sandbox: initial state (post bug-injection)');
  return { sandboxDir, treeHash };
}

// Removes visible test files that don't belong to this task from the
// sandbox, using the same manifest run-benchmark.js's scoring already reads
// (visible-tests-manifest/<target>.json). Scoping only the harness's own
// scoring step left the agent itself still running the full, unscoped test
// suite during its own execute-phase/verify-work checks — it would see
// other tasks' failing tests (e.g. task12's not-yet-built auth pages) and,
// entirely reasonably, try to fix them to satisfy its own "all tests pass"
// requirement. Removing the file from the sandbox — not just excluding it
// from a config the agent never looks at — means the agent's own `pnpm
// test` genuinely never sees it, the same way it never sees another
// branch's history. No manifest entry for a taskId leaves the directory
// untouched, matching run-benchmark.js's own fallback.
export function scopeVisibleTests(sandboxDir, target, taskId) {
  const manifestPath = path.join(ADMIN_DIR, 'visible-tests-manifest', `${target}.json`);
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const allowed = manifest[taskId];
  if (!allowed) return;

  const allowedBasenames = new Set(allowed.map(f => path.basename(f)));
  const testDir = path.join(sandboxDir, VISIBLE_TEST_DIR[target] ?? 'tests');
  if (!fs.existsSync(testDir)) return;

  for (const file of fs.readdirSync(testDir)) {
    if (ALWAYS_KEEP.has(file) || allowedBasenames.has(file)) continue;
    fs.rmSync(path.join(testDir, file), { force: true });
  }
}

// Call after every phase/iteration invocation. Snapshots whatever the agent
// left on disk into a single fresh commit (discarding whatever git state the
// agent itself created during its turn) and returns a content signature
// (the tree hash, not the commit hash — commit hashes always differ due to
// timestamps even with identical content, which would make "did anything
// change" detection meaningless) for the driver's no-progress checks.
export function checkpoint(sandboxDir, label) {
  const treeHash = reinitGit(sandboxDir, `sandbox: after ${label}`);
  return { treeHash };
}

// Copies the sandbox's final file state back onto the real repo root (which
// still has its own real git history) — excluding .git, node_modules, and
// .venv, none of which ever changed and none of which belong in the real
// checkout's tracked output — so the existing benchmark/static-analysis
// steps, which operate on the real repoRoot, see the agent's actual changes.
// (.venv shouldn't exist in the sandbox at all — createSandbox strips it —
// this exclusion is just defense in depth against that invariant changing.)
export function syncBack(sandboxDir, repoRoot) {
  fs.cpSync(sandboxDir, repoRoot, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(sandboxDir, src);
      const parts = rel.split(path.sep);
      return !parts.includes('.git') && !parts.includes('node_modules') && !parts.includes('.venv');
    },
  });
}

export function destroySandbox(sandboxDir) {
  fs.rmSync(sandboxDir, { recursive: true, force: true });
}
