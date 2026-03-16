import { useState } from "react";
import {
  Settings,
  Palette,
  Bell,
  Database,
  Globe,
  Shield,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { useTheme } from "../themeContext";
import { useReport } from "../reportContext";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { reportId, setReportId } = useReport();
  const [currency, setCurrency] = useState("INR");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Customize your dashboard experience"
      />

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader
            title="Appearance"
            subtitle="Manage your visual preferences"
            icon={<Palette className="w-5 h-5" />}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Dark Mode
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Currency & Locale */}
        <Card>
          <CardHeader
            title="Regional Settings"
            subtitle="Currency and locale preferences"
            icon={<Globe className="w-5 h-5" />}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Currency
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Display currency for financial data
                </p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader
            title="Notifications"
            subtitle="Control your notification preferences"
            icon={<Bell className="w-5 h-5" />}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Enable Notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive alerts for important updates
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Auto-Refresh Data
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically refresh dashboard data every 5 minutes
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader
            title="Data Management"
            subtitle="Manage your uploaded data and reports"
            icon={<Database className="w-5 h-5" />}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Current Report
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {reportId ? `Active: ${reportId.slice(0, 8)}...` : "No report uploaded"}
                </p>
              </div>
              <div className="flex gap-2">
                {reportId && (
                  <button
                    onClick={() => setReportId(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Export All Data
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download all dashboard data as JSON
                </p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <CardHeader
            title="About"
            subtitle="Application information"
            icon={<Shield className="w-5 h-5" />}
          />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Version</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">2.0.0</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Stack</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                React + Fastify + Prisma
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Author</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                Aditya Singh Chauhan
              </span>
            </div>
          </div>
        </Card>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
