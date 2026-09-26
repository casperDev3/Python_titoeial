"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Group, type Mesh, type MeshStandardMaterial } from "three";
import { Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Scene3D, useThemeColors } from "../kit";
import { damp, FitCamera, setCursor, SPRING } from "./shared";

type HeroDef = {
  cls: string;
  name: string;
  suit: string;
  mask: string;
  own: boolean; // чи перевизначив attack
  spider: boolean; // чи наслідує Spider
  out: string;
  duck?: boolean;
};

const HEROES: HeroDef[] = [
  { cls: "Peter", name: "Пітер", suit: "#dc2626", mask: "#1d4ed8", own: true, spider: true, out: "Пітер: 🕸️ павутиння в обличчя" },
  { cls: "Gwen", name: "Гвен", suit: "#f5f5f7", mask: "#ec4899", own: true, spider: true, out: "Гвен: 🩰 балетний удар ногою" },
  { cls: "Porker", name: "Пітер Порк", suit: "#f9a8d4", mask: "#dc2626", own: true, spider: true, out: "Пітер Порк: 🔨 велетенський молоток!" },
  { cls: "Noir", name: "Нуар", suit: "#27272a", mask: "#71717a", own: false, spider: true, out: "Нуар: базовий удар павутиною" },
  { cls: "Duck", name: "Качка", suit: "#facc15", mask: "#fb923c", own: true, spider: false, out: "Качка: кря! 🦆", duck: true },
];

function slot(i: number, n: number): [number, number, number] {
  const span = n > 1 ? (i / (n - 1)) * 2 - 1 : 0; // -1..1
  const a = span * 1.05;
  return [Math.sin(a) * 2.7, -0.55, Math.cos(a) * 1.4 - 0.4];
}

function HeroFigure({
  h, target, active, hit, selected, onPick,
}: {
  h: HeroDef; target: [number, number, number]; active: boolean; hit: number; selected: boolean; onPick: () => void;
}) {
  const g = useRef<Group>(null);
  const wave = useRef<Mesh>(null);
  const waveMat = useRef<MeshStandardMaterial>(null);
  const born = useRef(-1);
  useFrame((st, dt) => {
    const grp = g.current;
    if (!grp) return;
    const t = st.clock.elapsedTime;
    if (born.current < 0) born.current = t;
    const since = hit > 0 ? performance.now() / 1000 - hit : 99;
    const jump = since < 0.6 ? Math.sin((since / 0.6) * Math.PI) * 0.55 : 0;
    // «глітч» Павуковсесвіту під час атаки
    const glitch = active && since < 0.6 ? Math.sin(t * 90) * 0.05 : 0;
    grp.position.x = damp(grp.position.x, target[0], 5, dt) + glitch;
    grp.position.z = damp(grp.position.z, target[2], 5, dt);
    grp.position.y = target[1] + jump + (selected ? Math.sin(t * 2.4) * 0.04 : 0);
    grp.rotation.y = damp(grp.rotation.y, Math.atan2(-grp.position.x, 4 - grp.position.z) + (since < 0.6 ? since * 10.5 : 0), 10, dt);
    const s = damp(grp.scale.x, Math.min(1, (t - born.current) * 3) * (selected ? 1.1 : 1), 8, dt);
    grp.scale.setScalar(s);
    if (wave.current && waveMat.current) {
      const w = since < 0.9 ? since / 0.9 : 1;
      wave.current.visible = since < 0.9;
      wave.current.scale.setScalar(0.3 + w * 2.2);
      waveMat.current.opacity = (1 - w) * 0.8;
    }
  });
  return (
    <group
      ref={g}
      position={[target[0], target[1], target[2]]}
      scale={0.01}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
      onPointerOver={(e) => setCursor(e, "pointer")}
      onPointerOut={(e) => setCursor(e, "auto")}
    >
      {h.duck ? (
        <>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshStandardMaterial color={h.suit} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.78, 0.08]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color={h.suit} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.74, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <meshStandardMaterial color={h.mask} />
          </mesh>
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} position={[x, 0.84, 0.25]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh position={[0, 0.32, 0]}>
            <capsuleGeometry args={[0.2, 0.42, 8, 16]} />
            <meshStandardMaterial color={h.suit} roughness={0.45} metalness={0.1} />
          </mesh>
          {/* павук на грудях */}
          <mesh position={[0, 0.45, 0.19]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={h.cls === "Noir" ? "#d4d4d8" : "#111"} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color={h.mask} roughness={0.4} />
          </mesh>
          {/* очі маски */}
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, 0.87, 0.17]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]} scale={[1, 0.6, 0.4]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
            </mesh>
          ))}
          {h.cls === "Porker" && (
            <group position={[0.34, 0.45, 0.05]} rotation={[0, 0, -0.5]}>
              <mesh>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color="#a16207" />
              </mesh>
              <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.26, 16]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          )}
          {h.cls === "Noir" && (
            <mesh position={[0, 1.02, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.03, 32]} />
              <meshStandardMaterial color="#18181b" />
            </mesh>
          )}
        </>
      )}
      {/* кільце-хвиля атаки */}
      <mesh ref={wave} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[0.4, 0.025, 8, 48]} />
        <meshStandardMaterial ref={waveMat} color={h.mask} emissive={h.mask} emissiveIntensity={1.4} transparent opacity={0} />
      </mesh>
      {/* підставка */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.08, 40]} />
        <meshPhysicalMaterial
          color={h.spider ? "#ffffff" : "#fde68a"}
          transmission={0.5}
          roughness={0.15}
          thickness={0.3}
          emissive={selected || active ? h.mask : "#000000"}
          emissiveIntensity={selected || active ? 0.6 : 0}
        />
      </mesh>
    </group>
  );
}

function Portal({ a, b }: { a: string; b: string }) {
  const g = useRef<Group>(null);
  const inner = useRef<Mesh>(null);
  useFrame((st, dt) => {
    if (g.current) g.current.rotation.z += dt * 0.35;
    if (inner.current) {
      const s = 1 + Math.sin(st.clock.elapsedTime * 2) * 0.04;
      inner.current.scale.set(s, s, 1);
    }
  });
  return (
    <group position={[0, 0.75, -1.9]}>
      <group ref={g}>
        <mesh>
          <torusGeometry args={[1.35, 0.07, 16, 96]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, 0.6]}>
          <torusGeometry args={[1.18, 0.035, 12, 96, Math.PI * 1.3]} />
          <meshStandardMaterial color={b} emissive={b} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={inner}>
        <circleGeometry args={[1.28, 64]} />
        <meshStandardMaterial color={b} emissive={a} emissiveIntensity={0.35} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Html position={[0, 0, 0.05]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div className="rounded-xl bg-black/45 px-2.5 py-1 text-center font-mono text-[11px] leading-tight text-white backdrop-blur-md">
          <div className="font-bold">class Spider</div>
          <div className="opacity-75">def attack(self): …</div>
        </div>
      </Html>
    </group>
  );
}

export function MultiversePoly() {
  const c = useThemeColors();
  const [duck, setDuck] = useState(false);
  const [cursor, setCursorIdx] = useState(-1); // індекс поточного героя в циклі
  const [running, setRunning] = useState(false);
  const [hits, setHits] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<string | null>(null);

  const team = useMemo(() => HEROES.filter((h) => duck || !h.duck), [duck]);
  const doneLines = cursor >= 0 ? team.slice(0, cursor + 1).map((h) => h.out) : [];

  useEffect(() => {
    if (!running) return;
    if (cursor >= team.length - 1) {
      const t = setTimeout(() => setRunning(false), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        const next = cursor + 1;
        setCursorIdx(next);
        setHits((hs) => ({ ...hs, [team[next].cls]: performance.now() / 1000 }));
      },
      cursor < 0 ? 150 : 1000,
    );
    return () => clearTimeout(t);
  }, [running, cursor, team]);

  const run = () => {
    setCursorIdx(-1);
    setHits({});
    setRunning(true);
  };

  const selHero = team.find((h) => h.cls === sel) ?? null;
  const current = cursor >= 0 ? team[cursor] : null;

  return (
    <div>
      <Scene3D height={400} camera={[0, 1.4, 6.4]} fov={42}>
        <FitCamera width={6.6} height={3.8} min={5.8} />
        <Portal a={c.accent} b={c.accent2} />
        {team.map((h, i) => {
          const p = slot(i, team.length);
          return (
            <group key={h.cls}>
              <HeroFigure
                h={h}
                target={p}
                active={current?.cls === h.cls && running}
                hit={hits[h.cls] ?? 0}
                selected={sel === h.cls}
                onPick={() => setSel(sel === h.cls ? null : h.cls)}
              />
              <Html position={[p[0], p[1] - 0.42, p[2]]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div
                  className="rounded-full px-2 py-0.5 font-mono text-[10.5px] font-bold whitespace-nowrap text-white shadow"
                  style={{ background: h.spider ? "rgba(0,0,0,.5)" : "rgba(202,138,4,.85)", backdropFilter: "blur(6px)" }}
                >
                  {h.cls}
                  {h.spider ? "(Spider)" : ""}
                </div>
              </Html>
              <Html position={[p[0], p[1] + 1.35, p[2]]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
                <AnimatePresence>
                  {current?.cls === h.cls && (
                    <motion.div
                      key={hits[h.cls]}
                      initial={{ opacity: 0, y: 10, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={SPRING}
                      className="max-w-[170px] rounded-2xl px-2.5 py-1 text-center text-[11px] font-semibold text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }}
                    >
                      {h.out.split(": ")[1]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Html>
            </group>
          );
        })}
      </Scene3D>

      <ControlBar>
        <Btn variant="accent" onClick={run} disabled={running}>
          <Play className="size-4" /> <span className="font-mono text-[12px]">for hero in team: hero.attack()</span>
        </Btn>
        <Btn
          onClick={() => {
            setDuck((d) => !d);
            setCursorIdx(-1);
            setRunning(false);
            if (sel === "Duck") setSel(null);
          }}
        >
          {duck ? "Прибрати качку" : "🦆 Додати Качку"}
        </Btn>
        <Btn
          onClick={() => {
            setCursorIdx(-1);
            setRunning(false);
            setHits({});
            setSel(null);
          }}
        >
          <RotateCcw className="size-4" />
        </Btn>
      </ControlBar>

      <div className="mx-5 mb-4 grid gap-3 md:grid-cols-2">
        <div className="min-h-[132px] rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
          {doneLines.length === 0 && <div className="text-[#8e8e93]"># запусти цикл по команді</div>}
          <AnimatePresence initial={false}>
            {doneLines.map((l) => (
              <motion.div key={l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}>
                {l}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          {selHero || current ? (
            <LookupCard key={(selHero ?? current)!.cls} h={(selHero ?? current)!} />
          ) : (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-center text-[13px] text-label-2">
              Клацни по героєві, щоб побачити, де Python знаходить його <code className="inline-code">attack</code>.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LookupCard({ h }: { h: HeroDef }) {
  const steps = h.duck
    ? [{ k: "Duck", ok: true }]
    : h.own
      ? [{ k: h.cls, ok: true }]
      : [
          { k: h.cls, ok: false },
          { k: "Spider", ok: true },
        ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={SPRING}
      className="rounded-2xl border border-separator bg-elevated/70 p-3 text-[13px]"
    >
      <div className="font-mono text-[12px] text-label-2">
        type(hero) → <span className="font-semibold text-label">{h.cls}</span> · isinstance(hero, Spider) →{" "}
        <span className="font-semibold" style={{ color: h.spider ? "#30d158" : "#ff9f0a" }}>
          {String(h.spider ? "True" : "False")}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[12px]">
        <span className="text-label-2">hero.attack →</span>
        {steps.map((s, i) => (
          <motion.span
            key={s.k}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: i * 0.25 }}
            className="rounded-lg px-2 py-0.5"
            style={{
              background: s.ok ? "#30d158" : "color-mix(in oklab, var(--label-2) 14%, transparent)",
              color: s.ok ? "white" : undefined,
              textDecoration: s.ok ? undefined : "line-through",
            }}
          >
            {s.k}.attack {s.ok ? "✓" : "✗"}
          </motion.span>
        ))}
      </div>
      <p className="mt-2 leading-snug text-label-2">
        {h.duck
          ? "Качка не наслідує Spider, але має метод attack(). Циклу байдуже — duck typing: головне, щоб метод існував."
          : h.own
            ? `${h.cls} перевизначив attack() — Python знаходить його одразу в класі об'єкта.`
            : "Noir не перевизначав attack() — пошук піднімається до батьківського Spider."}
      </p>
    </motion.div>
  );
}
