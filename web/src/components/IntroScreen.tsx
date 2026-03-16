import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "logo" | "text" | "exit">("enter");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let animId = 0;
    let time = 0;

    const STAR_COUNT = 300;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000,
      size: Math.random() * 2 + 0.5,
    }));

    // Orbiting rings of data particles
    const RING_COUNT = 60;
    const rings = Array.from({ length: RING_COUNT }, (_, i) => ({
      angle: (i / RING_COUNT) * Math.PI * 2,
      radius: 120 + Math.random() * 80,
      speed: 0.005 + Math.random() * 0.008,
      size: Math.random() * 3 + 1,
      yOffset: (Math.random() - 0.5) * 60,
      color: Math.random() > 0.5 ? "#6366f1" : "#8b5cf6",
    }));

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    function draw() {
      time += 0.016;
      ctx!.clearRect(0, 0, w, h);

      // Warp-speed starfield (3D → 2D projection)
      const cx = w / 2;
      const cy = h / 2;
      const fov = 300;

      for (const star of stars) {
        star.z -= 3 + time * 0.5;
        if (star.z <= 0) star.z = 2000;

        const sx = (star.x / star.z) * fov + cx;
        const sy = (star.y / star.z) * fov + cy;
        const depth = 1 - star.z / 2000;
        const r = star.size * depth * 2;

        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

        ctx!.beginPath();
        ctx!.arc(sx, sy, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 210, 255, ${depth * 0.8})`;
        ctx!.fill();

        // Streak effect for fast stars
        if (depth > 0.5) {
          const streakLen = depth * 8;
          ctx!.beginPath();
          ctx!.moveTo(sx, sy);
          ctx!.lineTo(
            sx + (star.x / star.z) * streakLen,
            sy + (star.y / star.z) * streakLen
          );
          ctx!.strokeStyle = `rgba(99, 102, 241, ${depth * 0.3})`;
          ctx!.lineWidth = r * 0.5;
          ctx!.stroke();
        }
      }

      // 3D orbiting data ring
      for (const ring of rings) {
        ring.angle += ring.speed;
        const rx = Math.cos(ring.angle) * ring.radius;
        const rz = Math.sin(ring.angle) * ring.radius;
        const ry = ring.yOffset + Math.sin(time * 2 + ring.angle) * 15;

        // 3D → 2D
        const perspective = fov / (fov + rz + 200);
        const px = cx + rx * perspective;
        const py = cy + ry * perspective;
        const ps = ring.size * perspective;

        ctx!.beginPath();
        ctx!.arc(px, py, ps, 0, Math.PI * 2);
        ctx!.fillStyle = ring.color + (rz > 0 ? "99" : "44");
        ctx!.fill();

        // Glow
        ctx!.beginPath();
        ctx!.arc(px, py, ps * 3, 0, Math.PI * 2);
        const grad = ctx!.createRadialGradient(px, py, 0, px, py, ps * 3);
        grad.addColorStop(0, ring.color + "33");
        grad.addColorStop(1, "transparent");
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      // Central holographic circle
      const pulseSize = 80 + Math.sin(time * 2) * 10;
      for (let i = 3; i >= 0; i--) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, pulseSize + i * 20, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(99, 102, 241, ${0.08 - i * 0.015})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      }

      // Scanning line
      const scanAngle = time * 1.5;
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.lineTo(
        cx + Math.cos(scanAngle) * (pulseSize + 60),
        cy + Math.sin(scanAngle) * (pulseSize + 60)
      );
      const scanGrad = ctx!.createLinearGradient(
        cx, cy,
        cx + Math.cos(scanAngle) * (pulseSize + 60),
        cy + Math.sin(scanAngle) * (pulseSize + 60)
      );
      scanGrad.addColorStop(0, "rgba(99, 102, 241, 0.6)");
      scanGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx!.strokeStyle = scanGrad;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Phase sequencing
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("logo"), 300),
      setTimeout(() => setPhase("text"), 1200),
      setTimeout(() => setPhase("exit"), 3200),
      setTimeout(() => onComplete(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ perspective: "1200px" }}
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Radial gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), " +
            "radial-gradient(ellipse at 30% 30%, rgba(139,92,246,0.08) 0%, transparent 50%)",
        }}
      />

      {/* 3D Content */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transformStyle: "preserve-3d",
          transform:
            phase === "enter"
              ? "perspective(1000px) rotateX(30deg) translateZ(-200px) scale(0.5)"
              : phase === "exit"
              ? "perspective(1000px) rotateX(-10deg) translateZ(300px) scale(1.3)"
              : "perspective(1000px) rotateX(0deg) translateZ(0px) scale(1)",
          transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease",
          opacity: phase === "enter" ? 0 : 1,
        }}
      >
        {/* 3D Logo */}
        <div
          className="relative mb-8"
          style={{
            transformStyle: "preserve-3d",
            animation: "intro-float 3s ease-in-out infinite",
          }}
        >
          {/* Shadow layer */}
          <div
            className="absolute inset-0 rounded-3xl bg-brand-500/30 blur-2xl"
            style={{ transform: "translateZ(-40px) scale(1.3)" }}
          />
          {/* Back face */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-700 to-brand-800"
            style={{ transform: "translateZ(-8px)" }}
          />
          {/* Front face */}
          <div
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-500/40"
            style={{
              transform: "translateZ(8px)",
              boxShadow: "0 0 60px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          {/* Side glow */}
          <div
            className="absolute -inset-4 rounded-3xl"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgba(99,102,241,0.3), transparent, rgba(139,92,246,0.3), transparent)",
              animation: "intro-spin 4s linear infinite",
              transform: "translateZ(-4px)",
            }}
          />
        </div>

        {/* Title with 3D text effect */}
        <h1
          className="text-5xl md:text-6xl font-extrabold text-center mb-4"
          style={{
            transformStyle: "preserve-3d",
            opacity: phase === "text" || phase === "exit" ? 1 : 0,
            transform: phase === "text" || phase === "exit" ? "translateZ(20px) translateY(0)" : "translateZ(-30px) translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(135deg, #fff 0%, #c7d2fe 40%, #a78bfa 70%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            filter: "drop-shadow(0 2px 10px rgba(99, 102, 241, 0.3))",
          }}
        >
          Marketing Analytics
        </h1>

        <p
          className="text-lg text-slate-400 text-center tracking-widest uppercase"
          style={{
            opacity: phase === "text" || phase === "exit" ? 1 : 0,
            transform: phase === "text" || phase === "exit" ? "translateZ(10px) translateY(0)" : "translateZ(-20px) translateY(15px)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
          }}
        >
          Intelligence Dashboard
        </p>

        {/* Loading bar */}
        <div
          className="mt-10 w-64 h-1 rounded-full bg-slate-800 overflow-hidden"
          style={{
            opacity: phase === "text" || phase === "exit" ? 1 : 0,
            transition: "opacity 0.5s ease 0.5s",
            transform: "translateZ(5px)",
          }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 via-purple-500 to-brand-400"
            style={{
              width: phase === "text" ? "80%" : phase === "exit" ? "100%" : "0%",
              transition: "width 2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
