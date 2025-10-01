# AGENTS.md

This is AGENTS.md, a README for agents: a dedicated, predictable place to provide the context and instructions to help AI coding agents work on your project.

## Do

- default to small files and diffs. avoid repo wide rewrites unless asked
- use descriptive commit messages
- follow the coding style of the project
- run tests, linters, and type checkers on changed files
- keep changes focused and minimal
- explain your reasoning in commit messages or PR descriptions
- modify the MCP server version only when necessary, according to semver

## Don't

- don't make large speculative changes without confirmation
- don't add or remove dependencies without approval
- don't change files unrelated to the task
- don't ignore linting or type errors
- don't leave commented out code or excessive logging

## Commands

> **Note:** Always lint, test, and typecheck updated files. Use project-wide build sparingly.

- **Type check a single file by path:** `npm exec tsc -- --noEmit path/to/file.ts`
- **Format a single file by path:** `npm exec prettier -- --write path/to/file.ts`
- **Lint a single file by path:** `npm exec eslint -- --fix path/to/file.ts`
- **Full build (when explicitly requested):** `npm run build`

## Safety and permissions

Allowed without prompt:

- read files, list files
- tsc single file, prettier, eslint

Ask first:

- package installs
- git push
- deleting files, chmod
- running full build

## Project structure

- `src/index.ts` - entry point with a small CLI to run the MCP Server using standard input/output transport or HTTP transport depending on the command line arguments
- `src/mcp.ts` - MCP Server implementation
- `src/pvpc.ts` - Class to interact with the esios API

## API docs

- esios API docs live in <https://api.esios.ree.es/>
- use the Context 7 MCP server to look up docs on the fly

## Pull Request checklist

- title: `feat(scope): short description`
- format, lint, type check - all green before commit
- diff is small and focused. include a brief summary of what changed and why
- remove any excessive logs or comments before sending a PR

## When stuck

- ask a clarifying question, propose a short plan, or open a draft PR with notes
- do not push large speculative changes without confirmation
