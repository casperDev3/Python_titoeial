"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Color, type Group, type MeshPhysicalMaterial } from "three";
import { ChevronRight, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Scene3D, useThemeColors } from "../kit";
import { damp, FitCamera, setCursor, SPRING } from "./shared";

/** Ієрархія: клас → батьки (у порядку оголошення). */
const BASES: Record<string, string[]> = {
  object: [],
  Spider: ["object"],
  Toon: ["object"],
  Miles: ["Spider"],
  Gwen: ["Spider"],
  SpiderHam: ["Toon", "Spider"],
  Hybrid: ["Miles", "Gwen"],
};

/** Методи, визначені безпосередньо в кожному класі. */
const METHODS: Record<string, string[]> = {
  object: ["__init__", "__repr__"],
  Spider: ["__init__", "web", "attack"],
  Toon: ["boing", "attack"],
  Miles: ["attack", "camo"],
  Gwen: ["attack", "dance"],
  SpiderHam: [],
  Hybrid: ["intro"],
};

const POS: Record<string, [number, number, number]> = {
  Hybrid: [0.8, 1.75, 0],
  SpiderHam: [-2.45, 0.6, 0.3],
  Miles: [-0.35, 0.6, 0.35],
  Gwen: [1.95, 0.6, -0.1],
  Toon: [-1.85, -0.6, -0.2],
  Spider: [0.8, -0.6, 0.2],
  object: [0, -1.75, 0],
};

const CLASSES = ["Hybrid", "SpiderHam", "Miles", "Gwen", "Spider", "Toon"];
const METHOD_OPTS = ["attack", "dance", "web", "boing", "__repr__", "fly"];

/** C3-лінеаризація — рівно так Python будує __mro__. */
function c3(cls: string): string[] {
  const bases = BASES[cls];
  const seqs = [...bases.map((b) => c3(b)), [...bases]];
  const out = [cls];
  for (;;) {
    const live = seqs.filter((s) => s.length);
    if (!live.length) return out;
    const head = live.map((s) => s[0]).find((h) => !live.some((t) => t.slice(1).includes(h)));
    if (!head) throw new Error("MRO conflict");
    out.push(head);
    for (const s of live) if (s[0] === head) s.shift();
  }
}

type NodeState = "idle" | "out" | "visited" | "current" | "found";

function ClassNode({
  name, state, onPick, c,
}: {
  name: string; state: NodeState; onPick: () => void; c: { accent: string; accent2: string };
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const colors = useMemo(
    () => ({
      idle: new Color("#f2f2f6"),
      out: new Color("#d6d6dc"),
      visited: new Color(c.accent2),
      current: new Color(c.accent),
      found: new Color("#16a34a"),
    }),
    [c.accent, c.accent2],
  );
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    if (g.current) {
      const target = state === "current" ? 1.25 + Math.sin(t * 8) * 0.05 : state === "found" ? 1.3 : state === "out" ? 0.8 : 1;
      g.current.scale.setScalar(damp(g.current.scale.x, target, 8, dt));
    }
    const m = mat.current;
    if (m) {
      m.color.lerp(colors[state], 1 - Math.exp(-8 * dt));
      m.emissive.copy(m.color);
      m.emissiveIntensity = damp(m.emissiveIntensity, state === "current" || state === "found" ? 0.9 : state === "visited" ? 0.35 : 0.08, 6, dt);
    }
  });
  const p = POS[name];
  return (
    <group position={p}>
      <group ref={g}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
          onPointerOver={(e) => setCursor(e, "pointer")}
          onPointerOut={(e) => setCursor(e, "auto")}
        >
          <sphereGeometry args={[0.28, 36, 36]} />
          <meshPhysicalMaterial ref={mat} transmission={0.35} thickness={0.5} roughness={0.12} clearcoat={1} emissiveIntensity={0.1} />
        </mesh>
      </group>
      <Html position={[0, -0.44, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="flex flex-col items-center rounded-xl border bg-white/90 px-2 py-0.5 text-center font-mono whitespace-nowrap text-[#1c1c1e] shadow-sm transition-all duration-300"
          style={{
            borderColor: state === "found" ? "#15803d" : state === "current" ? c.accent : "rgba(0,0,0,.12)",
            color: state === "found" ? "#15803d" : state === "current" ? c.accent : undefined,
            opacity: state === "out" ? 0.5 : 1,
          }}
        >
          <span className="text-[11.5px] font-bold">{name}</span>
          {METHODS[name].length > 0 && <span className="text-[9.5px] text-[#6e6e73]">{METHODS[name].join(" · ")}</span>}
        </div>
      </Html>
    </group>
  );
}

/** Маленький павучок, що бігає по MRO. */
function SpiderToken({ target, color }: { target: [number, number, number]; color: string }) {
  const g = useRef<Group>(null);
  const legs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ side: i < 4 ? -1 : 1, k: i % 4 })), []);
  useFrame((st, dt) => {
    const grp = g.current;
    if (!grp) return;
    grp.position.x = damp(grp.position.x, target[0], 6, dt);
    grp.position.y = damp(grp.position.y, target[1] + 0.42, 6, dt);
    grp.position.z = damp(grp.position.z, target[2] + 0.1, 6, dt);
    grp.rotation.y = Math.sin(st.clock.elapsedTime * 3) * 0.3;
    grp.children.forEach((ch, i) => {
      if (i > 1) ch.rotation.x = Math.sin(st.clock.elapsedTime * 16 + i) * 0.35;
    });
  });
  return (
    <group ref={g} position={[target[0], target[1] + 0.42, target[2]]}>
      <mesh>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color="#2c2c30" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.08]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {legs.map((l, i) => (
        <group key={i} rotation={[0, (l.k - 1.5) * 0.45, 0]}>
          <mesh position={[l.side * 0.13, -0.02, 0]} rotation={[0, 0, l.side * 0.6]}>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Декоративна павутина позаду графа. */
function WebBackdrop({ color }: { color: string }) {
  const lines = useMemo(() => {
    const out: [number, number, number][][] = [];
    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      out.push([[0, 0, -1.3], [Math.cos(a) * 3.6, Math.sin(a) * 2.6, -1.3]]);
    }
    for (let r = 1; r <= 4; r++) {
      const ring: [number, number, number][] = [];
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        const sag = 0.92;
        ring.push([Math.cos(a) * r * 0.9 * (i % 2 ? sag : 1), Math.sin(a) * r * 0.65 * (i % 2 ? sag : 1), -1.3]);
      }
      out.push(ring);
    }
    return out;
  }, []);
  return (
    <group position={[0.1, 0, 0]}>
      {lines.map((p, i) => (
        <Line key={i} points={p} color={color} lineWidth={0.7} transparent opacity={0.18} />
      ))}
    </group>
  );
}

export function MroWeb() {
  const c = useThemeColors();
  const [cls, setCls] = useState("Hybrid");
  const [method, setMethod] = useState("dance");
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);

  const mro = useMemo(() => c3(cls), [cls]);
  const foundAt = mro.findIndex((k) => METHODS[k].includes(method));
  const maxPos = foundAt >= 0 ? foundAt + 1 : mro.length;
  const done = pos >= maxPos;

  useEffect(() => {
    if (!playing) return;
    if (done) {
      const t = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPos((p) => p + 1), pos === 0 ? 350 : 850);
    return () => clearTimeout(t);
  }, [playing, done, pos]);

  const restart = (nextCls = cls, nextMethod = method) => {
    setCls(nextCls);
    setMethod(nextMethod);
    setPos(0);
    setPlaying(true);
  };

  const stateOf = (name: string): NodeState => {
    const i = mro.indexOf(name);
    if (i < 0) return "out";
    if (i >= pos) return "idle";
    if (i === foundAt) return "found";
    if (i === pos - 1 && !done) return "current";
    return "visited";
  };

  const tokenAt = POS[mro[Math.max(0, Math.min(pos, maxPos) - 1)] ?? mro[0]];
  const trail = mro.slice(0, Math.max(1, pos)).map((k) => POS[k]);

  const edges = useMemo(() => {
    const out: { key: string; pts: [number, number, number][] }[] = [];
    for (const [k, bases] of Object.entries(BASES)) for (const b of bases) out.push({ key: `${k}-${b}`, pts: [POS[k], POS[b]] });
    return out;
  }, []);

  return (
    <div>
      <Scene3D height={420} camera={[0.6, 0.6, 7]} fov={42}>
        <FitCamera width={6.4} height={4.6} min={6.2} />
        <WebBackdrop color={c.label} />
        {edges.map((e) => {
          const on = mro.includes(e.key.split("-")[0]) && mro.includes(e.key.split("-")[1]);
          return <Line key={e.key} points={e.pts} color={on ? c.accent2 : c.label2} lineWidth={on ? 2 : 1} transparent opacity={on ? 0.8 : 0.3} />;
        })}
        {trail.length > 1 && <Line points={trail} color={c.accent} lineWidth={3.2} dashed dashSize={0.12} gapSize={0.07} />}
        {Object.keys(POS).map((name) => (
          <ClassNode key={name} name={name} state={stateOf(name)} c={c} onPick={() => name !== "object" && restart(name)} />
        ))}
        <SpiderToken target={tokenAt} color={c.accent} />
      </Scene3D>

      <div className="px-5 pt-3">
        <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-label-2 uppercase">Клас об&apos;єкта</div>
        <div className="flex flex-wrap gap-1.5">
          {CLASSES.map((k) => (
            <Chip key={k} on={cls === k} onClick={() => restart(k)} layoutId="oopa-mro-cls">
              {k}()
            </Chip>
          ))}
        </div>
        <div className="mt-3 mb-1.5 text-[11px] font-semibold tracking-wider text-label-2 uppercase">Метод</div>
        <div className="flex flex-wrap gap-1.5">
          {METHOD_OPTS.map((m) => (
            <Chip key={m} on={method === m} onClick={() => restart(cls, m)} layoutId="oopa-mro-m">
              .{m}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-3 flex flex-wrap items-center gap-1 font-mono text-[12px]">
        <span className="mr-1 text-label-2">{cls}.__mro__:</span>
        {mro.map((k, i) => {
          const st = i < pos ? (i === foundAt ? "found" : "visited") : "idle";
          return (
            <span key={k} className="flex items-center gap-1">
              <motion.span
                animate={{ scale: i === pos - 1 ? 1.08 : 1 }}
                transition={SPRING}
                className="rounded-lg px-1.5 py-0.5"
                style={{
                  background:
                    st === "found" ? "color-mix(in oklab, #15803d 14%, white)" : st === "visited" ? "color-mix(in oklab, var(--accent-2) 18%, white)" : "transparent",
                  color: st === "found" ? "#15803d" : undefined,
                  fontWeight: st === "found" ? 700 : undefined,
                  border: "1px solid var(--separator)",
                }}
              >
                {k}
              </motion.span>
              {i < mro.length - 1 && <ChevronRight className="size-3 text-label-3" strokeWidth={1.75} />}
            </span>
          );
        })}
      </div>

      <div className="mx-5 mt-3 rounded-2xl border border-separator bg-[var(--code-bg)] px-4 py-3 font-mono text-[12px] leading-relaxed text-label">
        <div>
          <span className="text-label-3">&gt;&gt;&gt; </span>
          {cls}().{method}
        </div>
        {!done ? (
          <div className="text-label-3"># шукаю в {mro[Math.max(0, pos - 1)]}…</div>
        ) : foundAt >= 0 ? (
          <div className="text-[#15803d]">
            &lt;bound method {mro[foundAt]}.{method}&gt; <span className="text-label-3"># перевірено {foundAt + 1} з {mro.length}</span>
          </div>
        ) : (
          <div className="text-[#c42b1c]">
            AttributeError: &apos;{cls}&apos; object has no attribute &apos;{method}&apos;
          </div>
        )}
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setPos((p) => Math.min(maxPos, p + 1))} disabled={done}>
          Крок <ChevronRight className="size-4" strokeWidth={1.75} />
        </Btn>
        <Btn onClick={() => restart()}>
          <Play className="size-4" strokeWidth={1.75} /> Заново
        </Btn>
        <Btn
          onClick={() => {
            setPos(0);
            setPlaying(false);
          }}
        >
          <RotateCcw className="size-4" strokeWidth={1.75} />
        </Btn>
      </ControlBar>
    </div>
  );
}

function Chip({ on, onClick, children, layoutId }: { on: boolean; onClick: () => void; children: ReactNode; layoutId: string }) {
  return (
    <button onClick={onClick} className="relative rounded-xl border border-separator px-2.5 py-1 font-mono text-[12px] font-semibold">
      {on && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl"
          style={{ background: "color-mix(in oklab, var(--accent) 12%, white)", boxShadow: "inset 0 0 0 1.5px var(--accent)" }}
          transition={SPRING}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
