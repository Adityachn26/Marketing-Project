import { ReactNode } from "react";
import { clsx } from "clsx";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  style?: React.CSSProperties;
  depth3d?: boolean;
};

export function Card({ children, className, padding = "md", hover = false, style, depth3d = true }: CardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={clsx(
        "glass-card-solid transition-all duration-300 holo-shimmer",
        paddings[padding],
        hover && "hover:shadow-glow hover:-translate-y-0.5 cursor-pointer",
        depth3d && "card-3d shadow-3d",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4" style={{ transformStyle: "preserve-3d" }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-3d"
            style={{
              transform: "translateZ(8px)",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 0 rgba(79, 70, 229, 0.4)",
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 className="section-title text-3d">{title}</h2>
          {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
