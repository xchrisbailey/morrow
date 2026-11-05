import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 3100;
const URL = `http://localhost:${PORT}`;

/**
 * Starts the production server on a fresh temporary data dir, reads the setup
 * token from its stdout (the way an operator would from `docker logs`) and
 * hands it to the tests in MORROW_E2E_TOKEN.
 */
export default async function globalSetup() {
  if (!existsSync(".output/server/index.mjs")) {
    throw new Error("No production build found. Run `pnpm build` first.");
  }
  const dataDir = mkdtempSync(join(tmpdir(), "morrow-e2e-"));
  const server: ChildProcess = spawn("node", [".output/server/index.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      MORROW_URL: URL,
      MORROW_DATA_DIR: dataDir,
      MORROW_SETUP_TOKEN: "",
    },
    stdio: ["ignore", "pipe", "inherit"],
  });

  let output = "";
  const token = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No setup token in server output:\n${output}`)),
      30_000,
    );
    server.once("exit", (code) => reject(new Error(`Server exited (${code}):\n${output}`)));
    server.stdout!.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const match = output.match(/Setup token: (\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]!);
      }
    });
  });
  process.env.MORROW_E2E_TOKEN = token;

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${URL}/api/health`)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  return () => {
    server.removeAllListeners("exit");
    server.kill();
    rmSync(dataDir, { recursive: true, force: true });
  };
}
