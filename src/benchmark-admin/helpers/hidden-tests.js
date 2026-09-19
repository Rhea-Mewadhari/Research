import fs from 'fs';
import path from 'path';

// Hidden tests get copied next to each target's own visible tests, not into
// a separate location — frontend visible tests live at benchmark-frontend/tests/,
// backend visible tests live at benchmark-backend/src/tests/visible/. Hidden
// tests land at the analogous sibling (tests/ for frontend, src/tests/hidden/
// for backend) so that any reasonable vitest `include` pattern that covers a
// target's own visible tests structurally covers its hidden tests too —
// backend agents have twice independently narrowed vitest.config.ts's
// `include` to `src/**/*.test.ts`, which silently excludes anything outside
// src/ entirely. Placing hidden tests outside src/ made that exclusion
// inevitable regardless of anything an agent does; placing them under src/
// fixes it structurally instead of relying on agent behavior.
//
// Their source-relative imports need rewriting to be valid from the new
// location: e.g. '../../../benchmark-frontend/src/' → '../src/' (1 level up
// from tests/) or '../../../benchmark-backend/src/' → '../../' (2 levels up
// from src/tests/hidden/, matching src/tests/visible/'s own '../../' convention).
const IMPORT_REWRITES = {
  frontend: [
    [/(['"])\.\.\/\.\.\/\.\.\/benchmark-frontend\/src\//g, '$1../src/'],
  ],
  backend: [
    [/(['"])\.\.\/\.\.\/\.\.\/benchmark-backend\/src\//g, '$1../../'],
  ],
};

function rewriteImports(content, target) {
  let out = content;
  for (const [pattern, replacement] of IMPORT_REWRITES[target] ?? []) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function copyHiddenTests(hiddenTestsRoot, targetTestsDir, taskId, target) {
  const manifestPath = path.join(hiddenTestsRoot, 'manifest.json');

  let hiddenFiles;
  if (taskId && fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    hiddenFiles = manifest[taskId] ?? [];
  } else {
    hiddenFiles = fs.readdirSync(hiddenTestsRoot).filter(
      f => f.endsWith('.test.ts') || f.endsWith('.test.tsx')
    );
  }

  fs.mkdirSync(targetTestsDir, { recursive: true });

  for (const file of hiddenFiles) {
    const src     = path.join(hiddenTestsRoot, file);
    const dest    = path.join(targetTestsDir, file);
    const content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, rewriteImports(content, target), 'utf8');
  }

  return hiddenFiles;
}

export function removeHiddenTests(files, targetTestsDir) {
  for (const file of files) {
    const filePath = path.join(targetTestsDir, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
