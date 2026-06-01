# Task 3: Fix Syntax and Runtime Errors

## Objective
Fix all compile-time and runtime errors in the backend so the application starts and all endpoints respond correctly.

## What to Look For

The codebase contains errors that prevent it from compiling or running. Find and fix all of them:

- Broken or missing imports/exports
- TypeScript type errors
- Incorrect async/await usage
- Undefined variables or properties
- Crashing route handlers

## Expected Files to Check
All files under `src/` may contain errors — check `server.ts`, `app.ts`, `routes/`, `controllers/`, `services/`, `data/`, and `types/`.

## Constraints
- Do not change functionality beyond fixing errors
- Do not restructure files unnecessarily

## Success Criteria
- The server starts without errors
- `GET /products` responds with a JSON array
- All visible tests pass
- No uncaught runtime errors in the server log
