import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ParticleCanvas } from "../components/ParticleCanvas";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 800));

    const result = login(email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 600);
    } else {
      setLoading(false);
      setError(result.error || "Login failed");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Particle Background */}
      <ParticleCanvas />

      {/* Radial gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          success ? "scale-95 opacity-0 translate-y-[-20px]" : "animate-login-appear"
        } ${shaking ? "animate-shake" : ""}`}
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        {/* 3D Glow behind card */}
        <div
          className="absolute -inset-1 bg-gradient-to-r from-brand-600/20 via-purple-500/20 to-brand-600/20 rounded-3xl blur-xl animate-pulse-slow"
          style={{ transform: "translateZ(-30px)" }}
        />

        {/* 3D depth shadow */}
        <div
          className="absolute inset-2 rounded-3xl bg-brand-500/5"
          style={{ transform: "translateZ(-15px)", filter: "blur(20px)" }}
        />

        <div
          className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-brand-500/10 holo-shimmer"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 40px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Logo with 3D depth */}
          <div className="flex flex-col items-center mb-8" style={{ transformStyle: "preserve-3d" }}>
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4 animate-float"
              style={{
                transform: "translateZ(20px)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.4), 0 4px 0 rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <Sparkles className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
            </div>
            <h1
              className="text-2xl font-bold text-white mb-1 text-3d"
              style={{ transform: "translateZ(10px)" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to your Marketing Analytics dashboard
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@marketing.io"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group btn-3d"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <span>Welcome!</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-center text-xs text-slate-500">
              Demo credentials:{" "}
              <span className="text-slate-400 font-mono">admin@marketing.io</span>{" "}
              / <span className="text-slate-400 font-mono">admin123</span>
            </p>
          </div>

          {/* Bottom decorative gradient line */}
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        </div>
      </div>

      {/* Copyright */}
      <div className="fixed bottom-6 text-center text-xs text-slate-600 z-10">
        <p>© 2026 Marketing Analytics · Made by Aditya Singh Chauhan</p>
      </div>
    </div>
  );
}
