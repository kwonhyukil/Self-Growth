const { existsSync } = require("fs");
const { resolve } = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const cwd = process.cwd();
const envPath = resolve(cwd, ".env.test");

if (!existsSync(envPath)) {
  fail("[test-db] Missing backend/.env.test");
}

dotenv.config({ path: resolve(cwd, ".env"), override: false });
dotenv.config({ path: envPath, override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  fail("[test-db] DATABASE_URL is required in .env.test");
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch {
  fail("[test-db] DATABASE_URL is not a valid URL");
}

const dbName = parsed.pathname.replace(/^\//, "");
if (!dbName) {
  fail("[test-db] DATABASE_URL must include a database name");
}

const sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
const useShell = process.platform === "win32";
const dbHost = parsed.hostname;
const dbPort = parsed.port || "3306";
const dbUser = decodeURIComponent(parsed.username || "root");
const dbPassword = decodeURIComponent(parsed.password || "");

const dockerName = "self-growth-mysql";
const dockerExecArgs = [
  "exec",
  dockerName,
  "mysql",
  `-u${dbUser}`,
  `-p${dbPassword}`,
  "-e",
  sql,
];

const result = useShell
  ? spawnSync(`docker ${dockerExecArgs.map((arg) => `"${arg}"`).join(" ")}`, {
      cwd,
      env: process.env,
      stdio: "inherit",
      shell: true,
    })
  : spawnSync("docker", dockerExecArgs, {
      cwd,
      env: process.env,
      stdio: "inherit",
      shell: false,
    });

if (result.error) {
  fail(`[test-db] Failed to prepare database: ${result.error.message}`);
}

if ((result.status ?? 1) !== 0) {
  fail(
    `[test-db] Could not prepare the test database via Docker container '${dockerName}'. Ensure MySQL is reachable at ${dbHost}:${dbPort} and the container is running.`,
  );
}

process.exit(0);
