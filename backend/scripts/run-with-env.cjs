const { existsSync } = require("fs");
const { resolve } = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [, , envFileArg, ...command] = process.argv;

if (!envFileArg || command.length === 0) {
  fail("Usage: node scripts/run-with-env.cjs <env-file> <command...>");
}

const cwd = process.cwd();
const baseEnvPath = resolve(cwd, ".env");
const envFilePath = resolve(cwd, envFileArg);

if (existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath, override: false });
}

if (!existsSync(envFilePath)) {
  fail(`[test-env] Missing env file: ${envFileArg}`);
}

dotenv.config({ path: envFilePath, override: true });

const useShell = process.platform === "win32";
const child = useShell
  ? spawnSync(command.join(" "), {
      cwd,
      env: process.env,
      stdio: "inherit",
      shell: true,
    })
  : spawnSync(command[0], command.slice(1), {
      cwd,
      env: process.env,
      stdio: "inherit",
      shell: false,
    });

if (child.error) {
  fail(`[test-env] Failed to run command: ${child.error.message}`);
}

process.exit(child.status ?? 1);
