import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
};

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create particles
    const PARTICLE_COUNT = 90;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_REPEL_DISTANCE = 120;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    function animate() {
      time += 1;
      ctx!.clearRect(0, 0, width, height);

      // Update & draw particles
      for (const p of particles) {
        p.pulsePhase += p.pulseSpeed;

        // Mouse repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DISTANCE && dist > 0) {
          const force = (MOUSE_REPEL_DISTANCE - dist) / MOUSE_REPEL_DISTANCE;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = p.opacity * pulse;

        // Glow
        const gradient = ctx!.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 4
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${currentOpacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(165, 180, 252, ${currentOpacity})`;
        ctx!.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }

      // Gradient wave at bottom
      const waveHeight = 120;
      const waveY = height - waveHeight;
      ctx!.beginPath();
      ctx!.moveTo(0, height);
      for (let x = 0; x <= width; x += 2) {
        const y =
          waveY +
          Math.sin(x * 0.008 + time * 0.02) * 20 +
          Math.sin(x * 0.004 + time * 0.015) * 15 +
          Math.cos(x * 0.012 + time * 0.025) * 10;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(width, height);
      ctx!.closePath();

      const waveGradient = ctx!.createLinearGradient(0, waveY, 0, height);
      waveGradient.addColorStop(0, "rgba(99, 102, 241, 0.05)");
      waveGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
      waveGradient.addColorStop(1, "rgba(99, 102, 241, 0.12)");
      ctx!.fillStyle = waveGradient;
      ctx!.fill();

      // Second wave layer
      ctx!.beginPath();
      ctx!.moveTo(0, height);
      for (let x = 0; x <= width; x += 2) {
        const y =
          waveY +
          30 +
          Math.sin(x * 0.006 + time * 0.018 + 2) * 25 +
          Math.cos(x * 0.01 + time * 0.022) * 12;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(width, height);
      ctx!.closePath();

      const waveGradient2 = ctx!.createLinearGradient(0, waveY + 30, 0, height);
      waveGradient2.addColorStop(0, "rgba(139, 92, 246, 0.03)");
      waveGradient2.addColorStop(1, "rgba(79, 70, 229, 0.1)");
      ctx!.fillStyle = waveGradient2;
      ctx!.fill();

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
}
