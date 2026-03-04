import { useRef, useState } from "react";
import { useReport } from "../reportContext";

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
      setInfo(`Loaded "${data.filename ?? file.name}" (${data.rowCount ?? "?"} rows)`);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      setReportId(null);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "Uploading..." : "Upload CSV"}
      </button>

      {reportId ? (
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm"
          onClick={() => setReportId(null)}
          disabled={busy}
        >
          Clear
        </button>
      ) : null}

      <div className="text-xs text-slate-200/80 max-w-[420px] truncate">
        {error ? <span className="text-red-200">{error}</span> : info ? info : reportId ? `Active report: ${reportId}` : "No CSV loaded"}
      </div>
    </div>
  );
}

