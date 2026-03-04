import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ReportContextValue = {
  reportId: string | null;
  setReportId: (id: string | null) => void;
};

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

const STORAGE_KEY = "mproject.reportId";

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [reportId, setReportIdState] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setReportIdState(saved);
  }, []);

  const setReportId = (id: string | null) => {
    setReportIdState(id);
    if (!id) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo(() => ({ reportId, setReportId }), [reportId]);

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used inside ReportProvider");
  return ctx;
}

