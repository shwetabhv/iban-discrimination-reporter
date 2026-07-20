import type { MapEntry, ReportInput, StatsResponse } from "./types";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function submitReport(
  input: Omit<ReportInput, "honeypot"> & { honeypot?: string }
): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function fetchMap(): Promise<MapEntry[]> {
  const res = await fetch(`${BASE}/reports/map`);
  return handle(res);
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/stats`);
  return handle(res);
}
