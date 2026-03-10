# oh-my-codex: `omx doctor` false negative on Windows Codex CLI detection

## Summary

On Windows, `omx doctor` can report:

```text
[XX] Codex CLI: not found - install from https://github.com/openai/codex
```

even when Codex CLI is installed, logged in, and usable.

In the affected environment:

- `codex --version` works in an interactive shell
- `codex login status` reports logged-in when run with normal user permissions
- `codex exec "Reply with exactly: ok"` succeeds
- `omx doctor` still reports `Codex CLI: not found`

## Environment

- OS: Windows
- Node.js: `v24.14.0`
- `oh-my-codex`: `0.8.5`
- Codex CLI installed globally with npm
- Codex resolved from PowerShell as:

```text
C:\Users\YJU\AppData\Roaming\npm\codex.ps1
```

and available on PATH via:

```text
C:\Users\YJU\AppData\Roaming\npm\codex.cmd
```

## Root Cause

`omx doctor` currently checks Codex CLI by calling:

```js
execFileSync('codex', ['--version'], ...)
```

That is brittle on Windows for two reasons:

1. Windows often exposes npm global executables as `codex.cmd` / `codex.ps1`, not a plain `codex` binary.
2. In some environments, child-process execution can be restricted even though the executable is present and usable from the interactive shell, causing `execFileSync()` to throw `EPERM` / `EINVAL`.

That makes `doctor` produce a false negative.

## Reproduction

1. Install Codex CLI globally on Windows:

```powershell
npm install -g @openai/codex
```

2. Verify interactive usage works:

```powershell
codex --version
codex login
codex login status
codex exec "Reply with exactly: ok"
```

3. Run:

```powershell
omx doctor
```

4. Observe:

```text
[XX] Codex CLI: not found
```

## Proposed Fix

Make `checkCodexCli()` more defensive on Windows:

1. Try `codex`
2. On Windows also try `codex.cmd` and `codex.exe`
3. If execution still fails, scan `PATH` for `codex.cmd` / `codex.exe` / `codex`
4. If found, treat Codex CLI as installed even if version probing is blocked

This avoids false negatives while preserving the current fast path.

## Suggested Patch

```js
function checkCodexCli() {
    const candidates = process.platform === 'win32'
        ? ['codex', 'codex.cmd', 'codex.exe']
        : ['codex'];

    for (const candidate of candidates) {
        try {
            const version = execFileSync(candidate, ['--version'], {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            return { name: 'Codex CLI', status: 'pass', message: `installed (${version})` };
        } catch {
        }
    }

    const pathDirs = (process.env.PATH || '')
        .split(process.platform === 'win32' ? ';' : ':')
        .map((dir) => dir.trim())
        .filter((dir) => dir.length > 0);

    const fileNames = process.platform === 'win32'
        ? ['codex.cmd', 'codex.exe', 'codex']
        : ['codex'];

    for (const dir of pathDirs) {
        for (const fileName of fileNames) {
            const resolved = join(dir, fileName);
            if (existsSync(resolved)) {
                return {
                    name: 'Codex CLI',
                    status: 'pass',
                    message: `installed (found ${resolved})`,
                };
            }
        }
    }

    return {
        name: 'Codex CLI',
        status: 'fail',
        message: 'not found - install from https://github.com/openai/codex',
    };
}
```

## Validation

After applying the patch in the installed package, `omx doctor` changed from:

```text
Results: 8 passed, 0 warnings, 1 failed
```

to:

```text
Results: 9 passed, 0 warnings, 0 failed
All checks passed! oh-my-codex is ready.
```

## Short Issue Body

```md
On Windows, `omx doctor` can falsely report `Codex CLI: not found` even when Codex is installed and usable.

In my environment:
- `codex --version` works
- `codex login status` reports logged in
- `codex exec "Reply with exactly: ok"` succeeds
- `omx doctor` still reports Codex CLI missing

The current implementation appears to rely on `execFileSync('codex', ['--version'])`, which is brittle on Windows because npm global installs commonly expose `codex.cmd` / `codex.ps1`, and child-process execution may fail even when the executable is present on PATH.

Suggested fix:
- try `codex`, `codex.cmd`, and `codex.exe` on Windows
- if version probing fails, scan PATH for Codex and treat file presence as installed

This resolved the false negative locally.
```
