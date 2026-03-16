import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Layers,
  Filter,
  GitBranch,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Calculator,
  Trophy,
  LogOut,
  Share2,
  MapPin,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { useTheme } from "../themeContext";
import { useAuth } from "../authContext";

const navItems = [
  { to: "/", label: "Executive Overview", icon: BarChart3, end: true },
  { to: "/channels", label: "Channel Analytics", icon: Layers },
  { to: "/funnel", label: "Funnel View", icon: Filter },
  { to: "/attribution", label: "Attribution Studio", icon: GitBranch },
  { to: "/simulator", label: "Budget Simulator", icon: Calculator },
  { to: "/rankings", label: "Campaign Rankings", icon: Trophy },
  // Advanced features section
  { to: "/multi-attribution", label: "Multi-Touch Attribution", icon: Share2 },
  { to: "/journeys", label: "Customer Journeys", icon: MapPin },
  { to: "/budget-engine", label: "Budget Engine", icon: Zap },
  { to: "/cohorts", label: "Cohort Analysis", icon: Users },
  { to: "/forecast", label: "Forecasting", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full z-30 flex flex-col sidebar-3d",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
        "border-r border-slate-200/80 dark:border-slate-700/50",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200/80 dark:border-slate-700/50">
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20 animate-depth-pulse"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Sparkles className="w-5 h-5 text-white" style={{ transform: "translateZ(4px)" }} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <div className="text-sm font-bold gradient-text-animated whitespace-nowrap">
              Marketing Analytics
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Dashboard v2.0
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={clsx("mb-3", collapsed ? "px-0" : "px-2")}>
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Main Dashboard
            </span>
          )}
        </div>

        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "sidebar-link group relative",
                  isActive && "active",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in whitespace-nowrap">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Advanced Features Section */}
        <div className={clsx("mt-6 mb-3", collapsed ? "px-0" : "px-2")}>
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Advanced Analytics
            </span>
          )}
        </div>

        {navItems.slice(6, 11).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "sidebar-link group relative",
                  isActive && "active",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in whitespace-nowrap">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Settings */}
        <div className={clsx("mt-6 mb-3", collapsed ? "px-0" : "px-2")}>
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              System
            </span>
          )}
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "sidebar-link group relative",
              isActive && "active",
              collapsed && "justify-center px-0"
            )
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="animate-fade-in whitespace-nowrap">Settings</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
              Settings
            </div>
          )}
        </NavLink>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-200/80 dark:border-slate-700/50 space-y-1">
        <button
          onClick={toggleTheme}
          className={clsx(
            "sidebar-link w-full",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="animate-fade-in whitespace-nowrap">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "sidebar-link w-full",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Help & Docs" : undefined}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="animate-fade-in whitespace-nowrap">Help & Docs</span>}
        </a>

        <button
          onClick={logout}
          className={clsx(
            "sidebar-link w-full text-red-500 hover:text-red-400 hover:bg-red-950/30",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="animate-fade-in whitespace-nowrap">Logout</span>}
        </button>

        <button
          onClick={onToggle}
          className={clsx(
            "sidebar-link w-full",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="animate-fade-in whitespace-nowrap">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
