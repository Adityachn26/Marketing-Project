import { randomUUID } from "crypto";
import type { ReportRecord } from "./reportTypes";

const REPORT_TTL_MS = 1000 * 60 * 60; // 1 hour

const reports = new Map<string, ReportRecord>();

function cleanupExpired() {
  const now = Date.now();
  for (const [id, r] of reports.entries()) {
    if (now - r.uploadedAtMs > REPORT_TTL_MS) reports.delete(id);
  }
}

export function createReport(input: Omit<ReportRecord, "reportId" | "uploadedAtMs">) {
  cleanupExpired();
  const reportId = randomUUID();
  const record: ReportRecord = {
    reportId,
    uploadedAtMs: Date.now(),
    filename: input.filename,
    rows: input.rows,
    warnings: input.warnings,
  };
  reports.set(reportId, record);
  return record;
}

export function getReport(reportId: string) {
  cleanupExpired();
  return reports.get(reportId);
}

