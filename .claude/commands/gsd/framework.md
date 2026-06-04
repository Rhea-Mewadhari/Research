# GSD Framework — Standards and Conventions

## What is GSD

The Get Shit Done (GSD) framework is a specification-first agentic coding approach. It requires:

1. **Read the spec before writing any code.** Behaviour is defined by the task instructions; assumptions are not a substitute.
2. **Make the smallest valid change.** Each increment must map to an explicit requirement.
3. **Verify before continuing.** No change is "done" until checks pass.
4. **Anchor decisions in these standards.** When ambiguity exists, this file is the tiebreaker.

---

## Project Context

| Property | Value |
|---|---|
| Package manager | `pnpm` — never `npm` |
| Module format | ESM (`"type": "module"` in package.json) |
| Frontend target | `benchmark-frontend` — React 19, Vite, Vitest |
| Backend target | `benchmark-backend` — Express 5, TypeScript, Vitest |
| Task instructions | `benchmark-<target>/instructions/` |
| Visible tests | `benchmark-frontend/tests/` and `benchmark-backend/src/tests/visible/` |

---

## Naming Conventions

### Variables and Functions

- `camelCase` for all variables, function names, and parameters
- `const` by default; `let` only when reassignment is necessary; never `var`
- Boolean variables: prefix with `is`, `has`, `can`, or `should` (e.g., `isLoading`, `hasError`, `inStockOnly`)

### Types and Interfaces

- `PascalCase` for all TypeScript `type`, `interface`, and `enum` declarations
- Prefer `interface` for object shapes that describe a data structure (e.g., `Product`)
- Prefer `type` for unions, intersections, and utility compositions (e.g., `FilterState`)
- No `I` prefix on interfaces — `Product`, not `IProduct`

### Constants

- Module-level primitive constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RESULTS`)
- Object and array constants: `camelCase` with `const` is acceptable (e.g., `initialFilters`)

### Files

- TypeScript utility, service, and data files: `camelCase` (e.g., `productService.ts`, `productFilters.ts`)
- React component files: `PascalCase` matching the exported component (e.g., `ProductCard.tsx`)
- Test files: mirror the source file name with `.test.ts` / `.test.tsx` suffix

### React Components

- `PascalCase` function name matching the file name
- Props type: named `Props` when local to the file, or `<ComponentName>Props` when exported
- Custom hooks: always prefix with `use` (e.g., `useProductFilters`)

### Express Controllers and Middleware

- Route handler / controller exports: `camelCase` verb phrases (e.g., `getProducts`, `createProduct`)
- Middleware functions: `camelCase` describing the concern (e.g., `validateProductId`)

---

## TypeScript Standards

- **No `any`** unless interfacing with an external API where the shape is genuinely unknown — and even then, document why with a comment
- Prefer explicit return types on all exported functions
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining the reason
- No non-null assertions (`!`) except where the value is guaranteed by the call-site context and cannot be narrowed otherwise
- Use `import type` for type-only imports

---

## React Standards

- Functional components only; no class components
- State: `useState` for local UI state; `useMemo` for derived values; `useCallback` only when the memoised reference is a meaningful dependency
- Avoid `useEffect` for values that can be derived synchronously — use `useMemo` instead
- Do not pass raw state setter functions as props where the parent needs to constrain what the child sets; wrap them
- **Single Responsibility:** components own rendering and user interaction only — business logic (filtering, sorting, validation) belongs in utility functions, not component bodies
- **Accessibility:** every interactive control (`input`, `select`, `checkbox`, `button`) must be associated with a descriptive label via `htmlFor`/`id` pairing or `aria-label`; controls that cannot be found by label text are a defect

---

## Express / Backend Standards

Follow the existing layer separation: `routes → controllers → services → data`

- **Controllers** own HTTP concerns only: parse the request, call a service, send the response
- **Services** own business logic: filtering, sorting, validation — no access to `req` or `res`
- **Data layer** (`products.ts`) is the in-memory store — treat it as read-only unless the task explicitly requires mutation
- Query parameters: parse and normalise in the controller or a dedicated parser before passing to the service; do not let raw `query: any` propagate into business logic
- **Single Responsibility:** each service function does one thing; do not combine filtering, sorting, and pagination into a single function when they can be composed separately

---

## Data Integrity and Pure Functions

- **Never mutate function arguments.** Arrays and objects passed into a function must not be modified in place. When filtering or sorting, always derive a new array: `[...input].sort(...)` or `input.filter(...)` — never `input.sort(...)` directly.
- **Utility functions must be pure.** A pure function returns the same output for the same input and produces no side effects. Filtering, sorting, mapping, and validation functions must all be pure.
- **Treat shared data as read-only.** In-memory data stores and module-level constants are shared across calls; writing to them from a utility function is a defect even if the test passes.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why |
|---|---|
| Hardcoding values to match only the visible test cases | Produces brittle logic that fails on any input outside the fixture set |
| Modifying test files | Prohibited |
| Broad rewrites beyond the spec scope | Introduces regressions in untouched behaviour |
| Using `npm` instead of `pnpm` | Wrong package manager for this repo |
| Leaving `console.log` debug statements | Produces noise in output |
| Silent empty `catch` blocks | Suppresses errors that should surface |

---

## Constraint Rules (non-negotiable)

- Do not modify any file under `tests/` or `src/tests/`
- Do not access files outside the current target (`benchmark-frontend/` or `benchmark-backend/`) except to read instructions
- Resolve ambiguity by inspecting existing code and behaviour — not by guessing
- Preserve existing behaviour unless the spec explicitly requires a change
