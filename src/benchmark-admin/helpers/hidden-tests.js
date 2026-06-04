import fs from 'fs';
import path from 'path';

// When hidden tests are copied from benchmark-admin into benchmark-frontend/tests/,
// their source-relative imports need to be rewritten to be valid from the new location.
// e.g. '../../../benchmark-frontend/src/' → '../src/'
const IMPORT_REWRITES = [
  [/(['"])\.\.\/\.\.\/\.\.\/benchmark-frontend\/src\//g, '$1../src/'],
  [/(['"])\.\.\/\.\.\/\.\.\/benchmark-backend\/src\//g,  '$1../src/'],
];

function rewriteImports(content) {
  let out = content;
  for (const [pattern, replacement] of IMPORT_REWRITES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function copyHiddenTests(hiddenTestsRoot, repoRoot, taskId) {
  const targetTestsDir = path.join(repoRoot, 'tests');
  const manifestPath   = path.join(hiddenTestsRoot, 'manifest.json');

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
    fs.writeFileSync(dest, rewriteImports(content), 'utf8');
  }

  return hiddenFiles;
}

export function removeHiddenTests(files, repoRoot) {
  const targetTestsDir = path.join(repoRoot, 'tests');
  for (const file of files) {
    const filePath = path.join(targetTestsDir, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
