export type NormalizedRow = {
  date?: string; // YYYY-MM-DD
  channel: string;
  campaign?: string;
  spend: number;
  revenue: number;
  conversions: number;
};

export type ReportRecord = {
  reportId: string;
  filename: string;
  uploadedAtMs: number;
  rows: NormalizedRow[];
  warnings: string[];
};

