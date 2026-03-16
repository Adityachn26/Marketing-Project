import { useEffect, useRef } from "react";

/**
 * Subtle ambient 3D floating dots/grid background for the dashboard.
 * Renders behind content with pointer-events: none.
 */
export function Scene3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let animId = 0;
    let time = 0;

    // Grid dots in 3D space
    const GRID_SIZE = 12;
    const SPACING = 120;
    const dots: { x: number; y: number; z: number }[] = [];

    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
      for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
        dots.push({
          x: i * SPACING,
          y: j * SPACING,
          z: 0,
        });
      }
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Check for dark mode
    const isDark = () => document.documentElement.classList.contains("dark");

    function draw() {
      time += 0.005;
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const fov = 600;
      const dark = isDark();

      // Gentle camera rotation
      const camRotX = Math.sin(time * 0.3) * 0.15;
      const camRotY = time * 0.1;

      const cosX = Math.cos(camRotX);
      const sinX = Math.sin(camRotX);
      const cosY = Math.cos(camRotY);
      const sinY = Math.sin(camRotY);

      for (const dot of dots) {
        // Rotate Y
        let x = dot.x * cosY - dot.z * sinY;
        let z = dot.x * sinY + dot.z * cosY;
        let y = dot.y;

        // Rotate X
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;

        // Add wave animation
        const wave = Math.sin(dot.x * 0.01 + time * 2) * 20 +
                     Math.cos(dot.y * 0.01 + time * 1.5) * 20;

        z = z2 + 800 + wave;

        if (z <= 10) continue;

        const perspective = fov / z;
        const sx = cx + x * perspective;
        const sy = cy + y2 * perspective;
        const depth = Math.max(0, 1 - z / 2400);

        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

        const radius = 1.5 * perspective;
        const alpha = depth * (dark ? 0.08 : 0.06);

        ctx!.beginPath();
        ctx!.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx!.fillStyle = dark
          ? `rgba(99, 102, 241, ${alpha})`
          : `rgba(99, 102, 241, ${alpha})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
