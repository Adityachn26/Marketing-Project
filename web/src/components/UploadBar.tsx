import { useRef, useState } from "react";
import { useReport } from "../reportContext";
import { Upload, X, FileSpreadsheet, Loader2 } from "lucide-react";
import { clsx } from "clsx";

type UploadResponse = {
  reportId: string;
  filename: string;
  rowCount: number;
  warnings: string[];
};

export function UploadBar() {
  const { reportId, setReportId } = useReport();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    setError(null);
    setInfo(null);
    if (!file) return;

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/report/upload", { method: "POST", body: fd });
      const data = (await res.json()) as Partial<UploadResponse> & { error?: string; warnings?: string[] };
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (!data.reportId) throw new Error("Upload succeeded but no reportId returned.");
      setReportId(data.reportId);
      setInfo(`${data.filename ?? file.name} · ${data.rowCount ?? "?"} rows`);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      setReportId(null);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          busy
            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 cursor-wait"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        )}
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{busy ? "Uploading..." : "Upload CSV"}</span>
      </button>

      {reportId && !busy && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">{info || "CSV active"}</span>
          <button
            onClick={() => {
              setReportId(null);
              setInfo(null);
            }}
            className="ml-1 p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium max-w-[200px] truncate">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-1 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

