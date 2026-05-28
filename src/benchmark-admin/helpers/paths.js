import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const BACKEND_DEAD_FILES = ['counter.ts', 'main.ts'];

export function buildPaths(target) {
  const adminDir   = dirname(__dirname); // helpers/ parent = benchmark-admin/
  const targetDir  = resolve(adminDir, `../benchmark-${target}`);
  const srcDir     = join(targetDir, 'src');
  const adminBins  = join(adminDir, 'node_modules', '.bin');
  const targetBins = join(targetDir, 'node_modules', '.bin');
  return { adminDir, targetDir, srcDir, adminBins, targetBins };
}
