import { Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto py-6 px-6 relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Gradient divider with 3D glow */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.3), transparent)",
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.15)",
          transform: "translateZ(2px)",
        }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5" style={{ transform: "translateZ(4px)" }}>
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" />
          <span>by</span>
          <span className="font-semibold gradient-text">
            Aditya Singh Chauhan
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">React + TypeScript + Tailwind</span>
          <span className="text-brand-400">•</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Fastify + Prisma</span>
          <span className="text-brand-400">•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
