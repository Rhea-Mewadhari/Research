const fs = require('fs');
const path = require('path');

function copyHiddenTests(hiddenTestsRoot, repoRoot) {
  const targetTestsDir = path.join(repoRoot, 'tests');
  const hiddenFiles = fs.readdirSync(hiddenTestsRoot).filter(
    f => f.endsWith('.test.ts') || f.endsWith('.test.tsx')
  );

  for (const file of hiddenFiles) {
    fs.copyFileSync(path.join(hiddenTestsRoot, file), path.join(targetTestsDir, file));
  }

  return hiddenFiles;
}

function removeHiddenTests(files, repoRoot) {
  const targetTestsDir = path.join(repoRoot, 'tests');

  for (const file of files) {
    const filePath = path.join(targetTestsDir, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

module.exports = { copyHiddenTests, removeHiddenTests };
