# Decisions

## 2026-08-07: Keep TypeScript configuration compatible with 5.5

The root package pins TypeScript 5.5.4, so `ignoreDeprecations` must use the
latest value that compiler accepts: `"5.0"`. This preserves the existing
`baseUrl`-based `mocha` path mapping without preventing `compile:ts` from
running.

## 2026-08-07: Run AHK v2 e2e tests in an isolated VS Code build

The e2e configuration can use `VSCODE_EXEC_PATH`, a stable local VS Code
installation, or the stable registry association. It intentionally does not
automatically select VS Code Insiders: an active Insiders update prevents test
startup. When no supported local path is available, `@vscode/test-cli` downloads
an isolated stable build for the test run.
