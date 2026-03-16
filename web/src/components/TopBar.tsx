import { Bell, Search, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { UploadBar } from "./UploadBar";
import { clsx } from "clsx";

type TopBarProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function TopBar({ sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: "CSV upload processed successfully", time: "2 min ago", unread: true },
    { id: 2, text: "ROAS improved by 12% this week", time: "1 hour ago", unread: true },
    { id: 3, text: "New channel recommendation available", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={clsx(
        "sticky top-0 z-20 h-16 flex items-center gap-4 px-6 topbar-3d",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
        "border-b border-slate-200/60 dark:border-slate-700/50"
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden btn-ghost p-2"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 flex items-center">
        {searchOpen ? (
          <div className="relative w-full max-w-md animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search pages, channels, campaigns..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <UploadBar />

        {/* Export button */}
        <button
          className="btn-ghost p-2 relative"
          title="Export data"
          onClick={() => {
            // Simple CSV export of current page data
            const link = document.createElement("a");
            link.href = "/api/overview/trend";
            link.download = "marketing_report.json";
            link.click();
          }}
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="btn-ghost p-2 relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <span className="text-xs text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        "px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer",
                        n.unread && "bg-brand-50/30 dark:bg-brand-950/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {n.unread && (
                          <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                        )}
                        <div className={clsx(!n.unread && "ml-5")}>
                          <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer shadow-md shadow-brand-500/20">
          A
        </div>
      </div>
    </header>
  );
}
