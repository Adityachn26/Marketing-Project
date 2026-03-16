import { useRef, useState, ReactNode, useCallback } from "react";
import { clsx } from "clsx";

type Tilt3DCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number; // degrees of max tilt
  glare?: boolean;
  perspective?: number;
  scale?: number;
  style?: React.CSSProperties;
};

export function Tilt3DCard({
  children,
  className,
  intensity = 8,
  glare = true,
  perspective = 1000,
  scale = 1.02,
  style,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale(1)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * intensity * 2;
      const rotateY = (x - 0.5) * intensity * 2;

      setTransform(
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
      );
      setGlarePos({ x: x * 100, y: y * 100 });
    },
    [intensity, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("rotateX(0deg) rotateY(0deg) scale(1)");
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div
      ref={cardRef}
      className={clsx("tilt-3d-card", className)}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className="tilt-3d-inner relative w-full h-full"
        style={{
          transform,
          transition: isHovering
            ? "transform 0.1s ease-out"
            : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}

        {/* 3D Glare overlay */}
        {glare && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden"
            style={{
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              }}
            />
          </div>
        )}

        {/* Depth shadow */}
        <div
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{
            transform: "translateZ(-20px)",
            background: "rgba(99, 102, 241, 0.05)",
            filter: "blur(20px)",
            opacity: isHovering ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

/* Floating 3D element for decorative use */
export function Float3D({
  children,
  delay = 0,
  amplitude = 10,
  className,
}: {
  children: ReactNode;
  delay?: number;
  amplitude?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx("inline-block", className)}
      style={{
        animation: `float-3d 4s ease-in-out ${delay}s infinite`,
        transformStyle: "preserve-3d",
        "--float-amplitude": `${amplitude}px`,
      } as any}
    >
      {children}
    </div>
  );
}

/* 3D depth layer wrapper */
export function DepthLayer({
  children,
  depth = 0,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
