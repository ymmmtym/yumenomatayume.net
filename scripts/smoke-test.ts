import { spawn } from "node:child_process";

const PORT = Number(process.env.PORT ?? 8787);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PATHS = [
  "/",
  "/blog",
  "/feed",
  "/sitemap.xml",
  "/robots.txt",
  "/privacy",
  "/contact",
  "/form",
  "/ads.txt",
  "/offline",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons/icon-192.png",
];
const SECURITY_HEADERS = [
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-Frame-Options",
  "Cross-Origin-Opener-Policy",
  "Strict-Transport-Security",
  "Content-Security-Policy-Report-Only",
];
const BOT_USER_AGENT = "GPTBot/1.0";
const READY_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
}

function missingSecurityHeaders(res: Response) {
  return SECURITY_HEADERS.filter((name) => !res.headers.get(name));
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < READY_TIMEOUT_MS) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/`);
      if (res.status > 0) return;
    } catch {
      // server not ready yet
    }
    await sleep(500);
  }
  throw new Error(`Server did not become ready within ${READY_TIMEOUT_MS}ms`);
}

async function main() {
  const server = spawn(
    "bunx",
    ["wrangler", "dev", "--port", String(PORT), "--ip", "127.0.0.1"],
    {
      stdio: "inherit",
      env: process.env,
    },
  );

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.kill("SIGTERM");
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await waitForServer();

    const failures: { path: string; status?: number; error?: string }[] = [];
    for (const path of PATHS) {
      const url = `${BASE_URL}${path}`;
      try {
        const res = await fetchWithTimeout(url);
        if (res.status !== 200) {
          failures.push({ path, status: res.status });
        } else {
          console.log(`OK ${res.status} ${path}`);
        }
      } catch (error) {
        failures.push({
          path,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 通常のレスポンスと、ブロックした 403 の両方にセキュリティヘッダーが付くこと
    const headerChecks: { label: string; init?: RequestInit; expectedStatus: number }[] = [
      { label: "GET / (security headers)", expectedStatus: 200 },
      {
        label: "GET / (blocked bot: headers on 403)",
        init: { headers: { "User-Agent": BOT_USER_AGENT } },
        expectedStatus: 403,
      },
    ];
    for (const check of headerChecks) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/`, check.init);
        const missing = missingSecurityHeaders(res);
        if (res.status !== check.expectedStatus) {
          failures.push({ path: check.label, status: res.status });
        } else if (missing.length > 0) {
          failures.push({ path: `${check.label}: missing ${missing.join(", ")}` });
        } else {
          console.log(`OK ${res.status} ${check.label}`);
        }
      } catch (error) {
        failures.push({
          path: check.label,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (failures.length > 0) {
      console.error("Smoke test failed:");
      for (const failure of failures) {
        if (failure.error) {
          console.error(`- ${failure.path}: ${failure.error}`);
        } else {
          console.error(`- ${failure.path}: HTTP ${failure.status}`);
        }
      }
      process.exitCode = 1;
    } else {
      console.log(`Smoke test passed (${PATHS.length} paths + ${headerChecks.length} header checks).`);
    }
  } finally {
    shutdown();
    await new Promise<void>((resolve) => {
      if (server.exitCode !== null || server.signalCode !== null) {
        resolve();
        return;
      }
      server.once("exit", () => resolve());
      setTimeout(() => {
        if (server.exitCode === null && server.signalCode === null) {
          server.kill("SIGKILL");
        }
      }, 5_000).unref();
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
