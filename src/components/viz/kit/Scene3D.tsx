"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Hand } from "lucide-react";

type Props = {
  children: ReactNode;
  height?: number;
  camera?: [number, number, number];
  fov?: number;
  /** Дозволити обертання мишею/пальцем (за замовчуванням true) */
  controls?: boolean;
  autoRotate?: boolean;
  /** Тінь під об'єктами */
  shadows?: boolean;
  /** Показати підказку «потягни, щоб обертати» */
  hint?: boolean;
};

/**
 * Обгортка для 3D-сцен: монтує <Canvas> лише коли блок у полі зору
 * (IntersectionObserver) і зупиняє рендер, коли він зникає — це тримає
 * сторінку плавною навіть з кількома сценами. Має світло і
 * OrbitControls за замовчуванням.
 */
export function Scene3D({
  children,
  height = 380,
  camera = [0, 1.5, 7],
  fov = 45,
  controls = true,
  autoRotate = false,
  shadows = true,
  hint = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full touch-pan-y" style={{ height }}>
      {mounted && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ position: camera, fov }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          <hemisphereLight args={["#ffffff", "#444466", 0.7]} />
          {children}
          {shadows && <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={14} blur={2.6} far={4} />}
          {controls && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI / 1.8}
            />
          )}
        </Canvas>
      )}
      {controls && hint && (
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] text-white backdrop-blur-md">
          <Hand className="size-3" /> потягни, щоб обертати
        </div>
      )}
    </div>
  );
}
