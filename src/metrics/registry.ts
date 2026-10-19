import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

// Optional: collect default nodejs metrics (CPU, memory, etc.)
collectDefaultMetrics({ register: registry });

// ── /api/webhooks metrics ────────────────────────────────────────────────────

export const webhookCounter = new Counter({
  name: 'webhook_requests_total',
  help: 'Total number of webhook requests received',
  labelNames: ['status', 'event_type'],
  registers: [registry],
});

export const webhookDuration = new Histogram({
  name: 'webhook_request_duration_seconds',
  help: 'Histogram of webhook request processing duration in seconds',
  labelNames: ['status', 'event_type'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

export const reconciliationCounter = new Counter({
  name: 'api_reconciliation_requests_total',
  help: 'Total number of /api/reconciliation requests received',
  labelNames: ['status'],
  registers: [registry],
});

export const reconciliationDuration = new Histogram({
  name: 'api_reconciliation_request_duration_seconds',
  help: 'Histogram of /api/reconciliation request processing duration in seconds',
  labelNames: ['status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

// ── /api/auth/wallet metrics ─────────────────────────────────────────────────

export const walletAuthCounter = new Counter({
  name: 'api_auth_wallet_requests_total',
  help: 'Total number of /api/auth/wallet requests',
  labelNames: ['method', 'operation', 'status'],
  registers: [registry],
});

export const walletAuthDuration = new Histogram({
  name: 'api_auth_wallet_request_duration_seconds',
  help: 'Histogram of /api/auth/wallet request duration in seconds',
  labelNames: ['method', 'operation', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

// ── /api/streams metrics ─────────────────────────────────────────────────────

export const streamsCounter = new Counter({
  name: 'api_streams_requests_total',
  help: 'Total number of /api/streams requests',
  labelNames: ['method', 'status'],
  registers: [registry],
});

export const streamsDuration = new Histogram({
  name: 'api_streams_request_duration_seconds',
  help: 'Histogram of /api/streams request duration in seconds',
  labelNames: ['method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

/** Record a /api/streams request; `start` is a `process.hrtime()` tuple. */
export function observeStreamsRequest(method: string, status: number, start: [number, number]): void {
  const labels = { method, status: String(status) };
  streamsCounter.inc(labels);
  const diff = process.hrtime(start);
  streamsDuration.observe(labels, diff[0] + diff[1] / 1e9);
}

// ── Rate-limit store health ──────────────────────────────────────────────────

/**
 * Incremented each time the shared Redis rate-limit store is unreachable
 * (timeout, 5xx, network error).  When this spikes, the app is falling back
 * to fail-open or the local shadow bucket.
 */
export const rateLimitStoreUnavailable = new Counter({
  name: 'rate_limit_store_unavailable_total',
  help: 'Total number of times the shared Redis rate-limit store was unavailable',
  registers: [registry],
});
