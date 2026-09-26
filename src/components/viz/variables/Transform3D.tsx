"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type PyVal =
  | { t: "int"; v: number }
  | { t: "float"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "None" };

type Kind = "int" | "float" | "str" | "bool" | "None" | "error";
type Fn = "int" | "float" | "str" | "bool";

const VALUES: { id: string; val: PyVal }[] = [
  { id: "42", val: { t: "int", v: 42 } },
  { id: "3.99", val: { t: "float", v: 3.99 } },
  { id: "s42", val: { t: "str", v: "42" } },
  { id: "s314", val: { t: "str", v: "3.14" } },
  { id: "sempty", val: { t: "str", v: "" } },
  { id: "goku", val: { t: "str", v: "Goku" } },
  { id: "true", val: { t: "bool", v: true } },
  { id: "none", val: { t: "None" } },
];

const pyFloat = (n: number) => (Number.isInteger(n) ? `${n}.0` : String(n));

function repr(v: PyVal): string {
  switch (v.t) {
    case "int":
      return String(v.v);
    case "float":
      return pyFloat(v.v);
    case "str":
      return `'${v.v}'`;
    case "bool":
      return v.v ? "True" : "False";
    case "None":
      return "None";
  }
}

const typeName = (v: PyVal) => (v.t === "None" ? "NoneType" : v.t);

type Result = { ok: true; val: PyVal } | { ok: false; err: string };

/** Точна (для цих значень) імітація int()/float()/str()/bool() з CPython. */
function convert(fn: Fn, v: PyVal): Result {
  const INT_RE = /^\s*[+-]?\d+(_\d+)*\s*$/;
  const FLOAT_RE = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/;
  switch (fn) {
    case "int":
      if (v.t === "int") return { ok: true, val: v };
      if (v.t === "float") return { ok: true, val: { t: "int", v: Math.trunc(v.v) } };
      if (v.t === "bool") return { ok: true, val: { t: "int", v: v.v ? 1 : 0 } };
      if (v.t === "None")
        return { ok: false, err: "TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'" };
      return INT_RE.test(v.v)
        ? { ok: true, val: { t: "int", v: parseInt(v.v.replace(/_/g, ""), 10) } }
        : { ok: false, err: `ValueError: invalid literal for int() with base 10: '${v.v}'` };
    case "float":
      if (v.t === "int" || v.t === "float") return { ok: true, val: { t: "float", v: v.v } };
      if (v.t === "bool") return { ok: true, val: { t: "float", v: v.v ? 1 : 0 } };
      if (v.t === "None") return { ok: false, err: "TypeError: float() argument must be a string or a real number, not 'NoneType'" };
      return FLOAT_RE.test(v.v)
        ? { ok: true, val: { t: "float", v: parseFloat(v.v) } }
        : { ok: false, err: `ValueError: could not convert string to float: '${v.v}'` };
    case "str":
      return { ok: true, val: { t: "str", v: v.t === "str" ? v.v : repr(v) } };
    case "bool": {
      const falsy = v.t === "None" || (v.t === "bool" && !v.v) || ((v.t === "int" || v.t === "float") && v.v === 0) || (v.t === "str" && v.v === "");
      return { ok: true, val: { t: "bool", v: !falsy } };
    }
  }
}

const KINDS: Kind[] = ["int", "float", "str", "bool", "None", "error"];
const FORM: Record<Kind, string> = {
  int: "Куб — ціле, «цеглинка»",
  float: "Сфера — плавне, дробове",
  str: "Тор — ланцюжок символів",
  bool: "Октаедр — лише два стани",
  None: "Порожнє кільце — «нічого»",
  error: "Трансформація зірвалась!",
};

/* ───────────────────────── 3D ───────────────────────── */

function Morph({ kind, burstRef }: { kind: Kind; burstRef: RefObject<number> }) {
  const c = useThemeColors();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const sim = useRef(KINDS.map((k) => ({ s: k === kind ? 1 : 0, v: 0 })));
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 30);
    const idx = KINDS.indexOf(kind);
    for (let i = 0; i < KINDS.length; i++) {
      const m = refs.current[i];
      const p = sim.current[i];
      const target = i === idx ? 1 : 0;
      // пружина з легким «перелітом» — як спалах трансформації
      const k = i === idx ? 120 : 200;
      p.v += (target - p.s) * k * d;
      p.v *= Math.exp(-14 * d);
      p.s += p.v * d;
      if (m) {
        const s = Math.max(0, p.s);
        m.scale.setScalar(s);
        m.visible = s > 0.01;
        m.rotation.y += d * (0.6 + i * 0.05);
        m.rotation.x += d * 0.25;
      }
    }
    const g = group.current;
    if (g) {
      const shake = kind === "error" ? Math.sin(state.clock.elapsedTime * 40) * 0.04 : 0;
      g.position.x = shake;
      g.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.08;
    }
    burstRef.current = Math.max(0, burstRef.current - d * 0.9);
  });

  const glass = (color: string, extra: object = {}) => (
    <meshPhysicalMaterial
      color={color}
      transmission={0.45}
      thickness={1.5}
      roughness={0.12}
      clearcoat={1}
      emissive={color}
      emissiveIntensity={0.25}
      {...extra}
    />
  );

  return (
    <group ref={group}>
      <mesh ref={(m) => { refs.current[0] = m; }}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        {glass(c.accent)}
      </mesh>
      <mesh ref={(m) => { refs.current[1] = m; }}>
        <sphereGeometry args={[1, 48, 48]} />
        {glass(c.accent2)}
      </mesh>
      <mesh ref={(m) => { refs.current[2] = m; }}>
        <torusKnotGeometry args={[0.7, 0.24, 140, 20]} />
        {glass(c.accent)}
      </mesh>
      <mesh ref={(m) => { refs.current[3] = m; }}>
        <octahedronGeometry args={[1.1]} />
        {glass(c.accent2)}
      </mesh>
      <mesh ref={(m) => { refs.current[4] = m; }}>
        <torusGeometry args={[1, 0.05, 16, 80]} />
        <meshStandardMaterial color={c.label2} transparent opacity={0.7} />
      </mesh>
      <mesh ref={(m) => { refs.current[5] = m; }}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ff453a" emissive="#ff453a" emissiveIntensity={0.5} wireframe />
      </mesh>
    </group>
  );
}

/** Аура Супер Сайяна: частинки, що піднімаються навколо об'єкта. */
function Aura({ burstRef, kind }: { burstRef: RefObject<number>; kind: Kind }) {
  const c = useThemeColors();
  const COUNT = 260;
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const rise = useRef(0);

  // детерміновані «випадкові» параметри частинок
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const h = (n: number) => {
        const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
        return x - Math.floor(x);
      };
      seeds[i * 3] = h(1) * Math.PI * 2; // кут
      seeds[i * 3 + 1] = 1.25 + h(2) * 0.55; // радіус
      seeds[i * 3 + 2] = h(3); // фаза висоти
    }
    return { positions, seeds };
  }, []);

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;
    const b = burstRef.current;
    rise.current += Math.min(dt, 1 / 30) * (0.25 + b * 0.9);
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const a = seeds[i * 3] + t * 0.5;
      const phase = (seeds[i * 3 + 2] + rise.current) % 1;
      const r = seeds[i * 3 + 1] * (1 - phase * 0.45) * (1 + b * 0.35);
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = -1.4 + phase * 3.2;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    attr.needsUpdate = true;
    if (mat.current) {
      mat.current.opacity = kind === "error" ? 0.15 : 0.35 + b * 0.6;
      mat.current.size = 0.05 + b * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={mat} color={c.dark ? "#ffd23f" : c.accent} size={0.06} transparent depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── UI ───────────────────────── */

export function Transform3D() {
  const [valId, setValId] = useState("s314");
  const [fn, setFn] = useState<Fn>("float");
  const [applied, setApplied] = useState(false);
  const burstRef = useRef(0);

  const src = VALUES.find((v) => v.id === valId)!.val;
  const res = convert(fn, src);
  const kind: Kind = !applied ? (src.t as Kind) : res.ok ? (res.val.t as Kind) : "error";
  const label = !applied ? repr(src) : res.ok ? repr(res.val) : "💥";
  const tname = !applied ? typeName(src) : res.ok ? typeName(res.val) : "Exception";

  const transform = () => {
    setApplied(true);
    burstRef.current = 1;
  };

  return (
    <div>
      <div className="relative">
        <Scene3D height={320} camera={[0, 1.2, 6.2]} fov={45}>
          <Morph kind={kind} burstRef={burstRef} />
          <Aura burstRef={burstRef} kind={kind} />
          <Html center position={[0, 1.95, 0]} style={{ pointerEvents: "none" }}>
            <div
              className="rounded-full px-3 py-1 font-mono text-[13px] font-semibold whitespace-nowrap backdrop-blur-md"
              style={{
                background: kind === "error" ? "rgb(255 69 58 / 0.85)" : "var(--glass-bg-strong)",
                color: kind === "error" ? "#fff" : "var(--label)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {label} <span className="opacity-60">· {tname}</span>
            </div>
          </Html>
        </Scene3D>
        <div className="pointer-events-none absolute top-2 right-3 rounded-full bg-black/25 px-2.5 py-1 text-[11px] text-white backdrop-blur-md">
          {FORM[kind]}
        </div>
      </div>

      <div className="px-5 pt-1">
        <div className="mb-2 text-[12px] font-semibold tracking-wider text-label-3 uppercase">Вихідне значення</div>
        <div className="flex flex-wrap gap-1.5">
          {VALUES.map(({ id, val }) => {
            const on = id === valId;
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setValId(id);
                  setApplied(false);
                }}
                className="rounded-full border px-2.5 py-1 font-mono text-[12.5px] font-semibold"
                style={{
                  background: on ? "color-mix(in oklab, var(--accent) 22%, var(--glass-bg))" : "var(--glass-bg)",
                  borderColor: on ? "var(--accent)" : "var(--glass-border)",
                }}
              >
                {repr(val)}
              </motion.button>
            );
          })}
        </div>
      </div>

      <ControlBar>
        <Segmented
          id="vars-fn"
          value={fn}
          onChange={(f) => {
            setFn(f);
            setApplied(false);
          }}
          options={(["int", "float", "str", "bool"] as Fn[]).map((f) => ({ value: f, label: `${f}()` }))}
        />
        <Btn variant="accent" onClick={transform} disabled={applied}>
          ⚡ Трансформація!
        </Btn>
      </ControlBar>

      <div className="mx-5 mb-4 rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12.5px] leading-relaxed text-[#e5e5ea]">
        <div>
          <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
          {fn}({repr(src)})
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${valId}-${fn}-${applied}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="break-words"
            style={{ color: applied && !res.ok ? "#ff6961" : undefined }}
          >
            {!applied ? <span className="text-[#8e8e93]">… натисни «Трансформація!»</span> : res.ok ? repr(res.val) : res.err}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
