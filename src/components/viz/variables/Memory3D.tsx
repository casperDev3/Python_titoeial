"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, useThemeColors } from "../kit";

type ObjId = "goku" | "vegeta" | "none";
type NameId = "hero" | "saiyan";

const OBJ: Record<ObjId, { label: string; type: string; addr: string; pos: [number, number, number]; r: number }> = {
  goku: { label: "'Goku'", type: "str", addr: "0x7f2c30", pos: [-1.7, 0, 0], r: 0.62 },
  vegeta: { label: "'Vegeta'", type: "str", addr: "0x7f2d70", pos: [1.7, 0, 0], r: 0.62 },
  none: { label: "None", type: "NoneType", addr: "0x10a8e0", pos: [0, -0.35, -1.6], r: 0.4 },
};

const TAG_POS: Record<NameId, [number, number, number]> = {
  hero: [-1.1, 1.9, 1.1],
  saiyan: [1.1, 1.9, 1.1],
};

const STEPS: { code: string; note: string }[] = [
  { code: 'hero = "Goku"', note: "Створено рядок 'Goku'. Ім'я hero посилається на нього — refcount 1." },
  { code: "saiyan = hero", note: "Друге посилання на той самий об'єкт — refcount 2. Копії немає." },
  { code: 'hero = "Vegeta"', note: "hero переклеєно на новий рядок. У 'Goku' лишилось одне посилання (saiyan)." },
  { code: "saiyan = None", note: "saiyan тепер вказує на None — єдиний у програмі. У 'Goku' 0 посилань → CPython одразу звільняє пам'ять." },
  { code: "del hero", note: "del видаляє ІМ'Я, не об'єкт. Але посилань на 'Vegeta' більше немає — і він теж зникає." },
];

type Mem = { exists: Record<ObjId, boolean>; names: Partial<Record<NameId, ObjId>> };

function memAt(step: number): Mem {
  const m: Mem = { exists: { goku: false, vegeta: false, none: true }, names: {} };
  if (step >= 1) {
    m.exists.goku = true;
    m.names.hero = "goku";
  }
  if (step >= 2) m.names.saiyan = "goku";
  if (step >= 3) {
    m.exists.vegeta = true;
    m.names.hero = "vegeta";
  }
  if (step >= 4) m.names.saiyan = "none";
  if (step >= 5) delete m.names.hero;
  return m;
}

const refs = (m: Mem, id: ObjId) => Object.values(m.names).filter((x) => x === id).length;

/* ───────── 3D ───────── */

const UP = new THREE.Vector3(0, 1, 0);

function ObjSphere({ id, alive, rc, selected, onPick }: { id: ObjId; alive: boolean; rc: number; selected: boolean; onPick: () => void }) {
  const c = useThemeColors();
  const ref = useRef<THREE.Group>(null);
  const o = OBJ[id];
  const color = id === "none" ? c.label2 : id === "goku" ? c.accent : c.accent2;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = alive ? (selected ? 1.15 : 1) : 0;
    const s = THREE.MathUtils.damp(g.scale.x, target, alive ? 7 : 4, dt);
    g.scale.setScalar(s);
    g.visible = s > 0.01;
    g.position.y = o.pos[1] + Math.sin(state.clock.elapsedTime * 1.4 + o.pos[0]) * 0.07;
    g.rotation.y += dt * 0.3;
  });

  return (
    <group ref={ref} position={o.pos} scale={0}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <sphereGeometry args={[o.r, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.5}
          thickness={1.4}
          roughness={0.1}
          clearcoat={1}
          emissive={color}
          emissiveIntensity={selected ? 0.55 : 0.18}
        />
      </mesh>
      {/* кільце-лічильник: товщає з кількістю посилань */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[o.r + 0.16, 0.02 + rc * 0.018, 12, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html center position={[0, -o.r - 0.35, 0]} distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold whitespace-nowrap backdrop-blur-md transition-opacity duration-300"
          style={{
            background: "var(--glass-bg-strong)",
            color: "var(--label)",
            border: "1px solid var(--glass-border)",
            opacity: alive ? 1 : 0,
          }}
        >
          {o.label}
          <span className="rounded-full px-1.5 text-[10.5px] text-white" style={{ background: rc ? "var(--accent)" : "#8e8e93" }}>
            {id === "none" ? "∞" : rc}
          </span>
        </div>
      </Html>
    </group>
  );
}

function Link({ from, to, visible }: { from: [number, number, number]; to: [number, number, number]; visible: boolean }) {
  const c = useThemeColors();
  const mesh = useRef<THREE.Mesh>(null);
  const cur = useRef(new THREE.Vector3(...to));
  const tmp = useRef({ a: new THREE.Vector3(...from), dir: new THREE.Vector3(), mid: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const vis = useRef(0);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = tmp.current;
    t.tgt.set(to[0], to[1] + 0.5, to[2]);
    cur.current.x = THREE.MathUtils.damp(cur.current.x, t.tgt.x, 6, dt);
    cur.current.y = THREE.MathUtils.damp(cur.current.y, t.tgt.y, 6, dt);
    cur.current.z = THREE.MathUtils.damp(cur.current.z, t.tgt.z, 6, dt);
    vis.current = THREE.MathUtils.damp(vis.current, visible ? 1 : 0, 6, dt);
    t.dir.subVectors(cur.current, t.a);
    const len = t.dir.length();
    t.mid.addVectors(t.a, cur.current).multiplyScalar(0.5);
    m.position.copy(t.mid);
    m.quaternion.setFromUnitVectors(UP, t.dir.normalize());
    m.scale.set(vis.current, len, vis.current);
    m.visible = vis.current > 0.02;
  });

  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[0.035, 0.035, 1, 10]} />
      <meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.7} transparent opacity={0.85} />
    </mesh>
  );
}

function Tag({ id, visible }: { id: NameId; visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, visible ? 1 : 0, 6, dt);
    g.scale.setScalar(s);
    g.visible = s > 0.01;
    g.rotation.z = Math.sin(state.clock.elapsedTime * 1.1 + (id === "hero" ? 0 : 2)) * 0.05;
  });
  return (
    <group ref={ref} position={TAG_POS[id]} scale={0}>
      <RoundedBox args={[1.25, 0.46, 0.12]} radius={0.1} smoothness={3}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.6} roughness={0.15} thickness={0.5} transparent opacity={0.9} />
      </RoundedBox>
      <Html center position={[0, 0, 0.08]} distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[14px] font-bold" style={{ color: "#1c1c1e", opacity: visible ? 1 : 0 }}>
          {id}
        </div>
      </Html>
    </group>
  );
}

function Fit({ children }: { children: ReactNode }) {
  const w = useThree((s) => s.viewport.width);
  return <group scale={Math.min(1, w / 6.4)}>{children}</group>;
}

/* ───────── UI ───────── */

export function Memory3D() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<ObjId | null>(null);
  const m = memAt(step);

  const alive = (id: ObjId) => id === "none" || (m.exists[id] && refs(m, id) > 0);
  const selInfo = sel ? OBJ[sel] : null;

  return (
    <div>
      <Scene3D height={340} camera={[0, 2, 6.6]} fov={48}>
        <Fit>
          {(Object.keys(OBJ) as ObjId[]).map((id) => (
            <ObjSphere key={id} id={id} alive={alive(id)} rc={refs(m, id)} selected={sel === id} onPick={() => setSel(id)} />
          ))}
          {(["hero", "saiyan"] as NameId[]).map((n) => {
            const target = m.names[n];
            return (
              <group key={n}>
                <Tag id={n} visible={!!target} />
                <Link from={[TAG_POS[n][0], TAG_POS[n][1] - 0.25, TAG_POS[n][2]]} to={target ? OBJ[target].pos : TAG_POS[n]} visible={!!target} />
              </group>
            );
          })}
        </Fit>
      </Scene3D>

      <ControlBar>
        <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ‹
        </Btn>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} disabled={step === STEPS.length}>
          Крок ▸
        </Btn>
        <Btn
          onClick={() => {
            setStep(0);
            setSel(null);
          }}
        >
          ↺
        </Btn>
        <span className="ml-auto truncate font-mono text-[12.5px]" style={{ color: "var(--accent)" }}>
          {step ? STEPS[step - 1].code : "# пам'ять порожня"}
        </span>
      </ControlBar>

      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-[1.3fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass glass-tint !rounded-[16px] px-4 py-3 text-[13.5px] leading-snug"
          >
            {step === 0 ? "Натисни «Крок». Порада: клацай по сферах, щоб оглянути об'єкти." : STEPS[step - 1].note}
          </motion.div>
        </AnimatePresence>
        <div className="rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
          {selInfo && sel ? (
            <>
              <div>
                <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>type(obj)
              </div>
              <div>&lt;class &apos;{selInfo.type}&apos;&gt;</div>
              <div>
                <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>hex(id(obj))
              </div>
              <div>&apos;{selInfo.addr}&apos;</div>
              <div className="mt-1 text-[#ffd60a]">
                {sel === "none"
                  ? "None — синглтон, живе весь час роботи програми"
                  : alive(sel)
                    ? `імен-посилань: ${refs(m, sel)}`
                    : m.exists[sel]
                      ? "звільнено збирачем (refcount 0)"
                      : "ще не створено"}
              </div>
            </>
          ) : (
            <div className="text-[#8e8e93]"># клацни по сфері в сцені</div>
          )}
        </div>
      </div>
    </div>
  );
}
