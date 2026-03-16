import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in relative"
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <div
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full bg-gradient-to-b from-brand-500 to-purple-500 shadow-glow"
        style={{
          transform: "translateZ(10px) translateY(-50%)",
          boxShadow: "0 0 15px rgba(99, 102, 241, 0.4), 2px 0 0 rgba(139, 92, 246, 0.3)",
        }}
      />

      <div style={{ transformStyle: "preserve-3d" }}>
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold gradient-text-animated text-3d"
            style={{ transform: "translateZ(6px)" }}
          >
            {title}
          </h1>
          {badge && (
            <span
              className="badge-info badge-3d animate-bounce-in"
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
            style={{ transform: "translateZ(2px)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}


