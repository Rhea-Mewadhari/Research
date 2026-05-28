import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { buildPaths } from './helpers/paths.js';
import { runComplexity } from './dimensions/complexity.js';
import { runTypeDiscipline } from './dimensions/type-discipline.js';
import { runCoupling } from './dimensions/coupling.js';
import { runDuplication } from './dimensions/duplication.js';
import { runSecurity } from './dimensions/security.js';

const [target, outputFile] = process.argv.slice(2);

if (!target || !outputFile) {
  console.error('Usage: node analyze.js <frontend|backend> <outputFile>');
  process.exit(1);
}
if (target !== 'frontend' && target !== 'backend') {
  console.error('target must be "frontend" or "backend"');
  process.exit(1);
}

const ctx = { target, ...buildPaths(target) };

async function main() {
  console.log(`[analyze] target=${target} src=${ctx.srcDir}`);

  const report = {
    meta: {
      target,
      generatedAt: new Date().toISOString(),
      srcDir: ctx.srcDir,
    },
  };

  console.log('[analyze] running complexity...');
  report.complexity = await runComplexity(ctx);

  console.log('[analyze] running typeDiscipline...');
  report.typeDiscipline = await runTypeDiscipline(ctx);

  console.log('[analyze] running coupling...');
  report.coupling = runCoupling(ctx);

  console.log('[analyze] running duplication...');
  report.duplication = runDuplication(ctx);

  console.log('[analyze] running security...');
  report.security = runSecurity(ctx);

  const outPath = resolve(outputFile);
  const outDir  = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[analyze] written to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
