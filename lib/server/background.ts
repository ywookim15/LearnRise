import "server-only";

import { waitUntil } from "@vercel/functions";

/**
 * Run fire-and-forget work that must survive past the HTTP response.
 *
 * On Vercel's serverless/edge runtime, the function instance is frozen (and may
 * be killed) as soon as the response is returned — any un-awaited promise can
 * be silently dropped. `waitUntil` registers the promise with the platform so
 * the instance stays alive until it settles.
 *
 * Locally (`next dev`) there is no Vercel request context; `waitUntil` either
 * no-ops or throws, so we fall back to a plain detached promise — which runs
 * fine because the dev server process keeps running. Either way, `safe` is a
 * live promise that executes; errors are logged, never thrown to the caller.
 */
export function runInBackground(promise: Promise<unknown>, label = "task"): void {
  const safe = Promise.resolve(promise).catch((err) => {
    console.error(`[background] ${label} failed:`, err);
  });
  try {
    waitUntil(safe);
  } catch {
    // No Vercel context (e.g. local dev). `safe` still executes on its own.
  }
}
