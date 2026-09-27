# Companion.energy: Contracts prototype

A prototype for the Companion.energy dashboard.

## Running it

### With Docker (no Node needed)

```bash
docker compose up --build
```

Then open <http://localhost:8080>.

### With Node

Requires Node 20.19+ (see `.nvmrc`).

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Quality checks

| Command                 | What it does                                 |
| ----------------------- | -------------------------------------------- |
| `npm run typecheck`     | TypeScript in strict mode                    |
| `npm run lint`          | ESLint (type-aware rules, React hooks, a11y) |
| `npm run format:check`  | Prettier formatting check (`format` to fix)  |
| `npm run test`          | Vitest unit and component tests              |
| `npm run test:coverage` | Tests with a coverage report                 |
| `npm run check`         | All of the above, as CI runs them            |

The same checks run on every push through GitHub Actions (`.github/workflows/ci.yml`).

## The problem

_To be written._

## The solution

_To be written._

## Mock data

_To be written._

## Project structure

```
src/
  app/      App shell
  styles/   Design tokens and global styles
  test/     Test setup
```

## Stack

React 19, TypeScript, Vite, CSS Modules, Vitest with Testing Library, ESLint and Prettier.
