// Entry for `node cli <command>`. Bundled to `cli/index.js` by `pnpm build`.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { backupDatabase } from "#/server/backup.ts";
import { dbPath, openSqlite } from "#/server/db.ts";
import { dataDir } from "#/server/env.ts";

const USAGE = `Usage: node cli <command>

Commands:
  backup                     Snapshot the database to $MORROW_DATA_DIR/backups/<timestamp>.db
  reset-password [options]   Set a new Owner password and sign out every session
      --password <password>  Use this password (visible in the process list; prefer the prompt)
      --password-stdin       Read the password from stdin
`;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function requireDatabase(): string {
  const file = dbPath();
  if (!existsSync(file)) fail(`No database at ${file}. Is MORROW_DATA_DIR correct?`);
  return file;
}

function backup() {
  const sqlite = openSqlite(requireDatabase());
  try {
    console.log(backupDatabase(sqlite, join(dataDir(), "backups")));
  } finally {
    sqlite.close();
  }
}

async function readStdin(): Promise<string> {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data.replace(/\r?\n$/, "");
}

/** Prompts on the terminal without echoing the typed characters. */
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    let asked = false;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
      if (!asked) write.call(rl, s);
    };
    rl.question(question, (answer) => {
      process.stdout.write("\n");
      rl.close();
      resolve(answer);
    });
    asked = true;
  });
}

async function resetPassword(args: string[]) {
  let password: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--password") password = args[++i];
    else if (args[i]?.startsWith("--password=")) password = args[i]!.slice("--password=".length);
    else if (args[i] === "--password-stdin") password = await readStdin();
    else fail(`Unknown option: ${args[i]}\n\n${USAGE}`);
  }
  requireDatabase();
  if (password === undefined) {
    if (!process.stdin.isTTY) fail("No password given. Use --password-stdin or run in a terminal.");
    password = await prompt("New Owner password: ");
    if ((await prompt("Repeat password: ")) !== password) fail("Passwords do not match.");
  }
  // Loaded lazily so `backup` needs no auth setup (and no MORROW_URL).
  const [
    { createAuth },
    { createDb, openSqlite },
    { authSecret, baseUrl },
    { resetOwnerPassword },
  ] = await Promise.all([
    import("#/server/create-auth.ts"),
    import("#/server/db.ts"),
    import("#/server/env.ts"),
    import("#/server/reset-password.ts"),
  ]);
  const sqlite = openSqlite(dbPath());
  const db = createDb(sqlite);
  const auth = createAuth({
    db,
    baseURL: baseUrl(),
    secret: authSecret(dataDir()),
    setupToken: () => null,
  });
  const email = await resetOwnerPassword(auth, db, password);
  sqlite.close();
  console.log(`Password updated for ${email}. All sessions were signed out.`);
}

const [command, ...rest] = process.argv.slice(2);
try {
  if (command === "backup") backup();
  else if (command === "reset-password") await resetPassword(rest);
  else fail(USAGE.trimEnd());
} catch (error) {
  fail(error instanceof Error ? humanise(error) : String(error));
}

/** AppError carries JSON in its message; show just the text. */
function humanise(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { message?: string };
    if (parsed.message) return parsed.message;
  } catch {}
  return error.message;
}
