import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ─── vitest.config.ts ─────────────────────────────────────────────────────────
// Three bugs:
//   1. globals: false  → describe/it/expect are undefined at test runtime
//   2. setupFiles points to ./src/tests/setup.ts (does not exist)
//      → fetch is never stubbed, tests call the real DummyJSON API and fail
//   3. include: ['src/**/*.spec.ts']
//      → tests in tests/visible/ (*.test.ts) are never discovered

write(
  path.join(repoRoot, 'vitest.config.ts'),
  `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
`
);

// ─── tsconfig.json ────────────────────────────────────────────────────────────
// moduleResolution "node" conflicts with allowImportingTsExtensions.
// tsc -p tsconfig.build.json emits:
//   TS5095: Option 'allowImportingTsExtensions' can only be used when
//   'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'.

write(
  path.join(repoRoot, 'tsconfig.json'),
  `{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023"],
    "types": ["vitest/globals"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`
);

// ─── src/server.ts ────────────────────────────────────────────────────────────
// PORT has no numeric fallback — Number(undefined) === NaN.
// The server silently passes NaN to app.listen(), which Node.js accepts
// but binds to an OS-assigned ephemeral port rather than 3001.

write(
  path.join(repoRoot, 'src', 'server.ts'),
  `import app from "./app";

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
);
