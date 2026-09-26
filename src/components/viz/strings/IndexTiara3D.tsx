"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { ControlBar, Scene3D, useThemeColors } from "../kit";
import { chars, hex2, pyBytes, pyRepr, uplus, utf8 } from "./util";

const PRESETS = ["MOON🌙", "Місяць", "Sailor"] as const;
const MAX = 10;
const R = 3.0;

/** Позиції намистин по дузі-тіарі (центр дуги — нагорі). */
function layout(n: number) {
  const spread = Math.min(Math.PI * 0.82, Math.max(0.35, (n - 1) * 0.3));
  const angles = Array.from({ length: n }, (_, i) => (n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1)));
  return { spread, points: angles.map((a) => [R * Math.sin(a), R * Math.cos(a) - R + 0.35, 0] as [number, number, number]) };
}

function Bead({
  pos,
  ch,
  index,
  neg,
  selected,
  color,
  selColor,
  onSelect,
  phase,
}: {
  pos: [number, number, number];
  ch: string;
  index: number;
  neg: number;
  selected: boolean;
  color: string;
  selColor: string;
  onSelect: () => void;
  phase: number;
}) {
  const g = useRef<THREE.Group>(null);
  // стартова позиція — лише один раз; далі намистину веде useFrame
  const [start] = useState(pos);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const cols = useMemo(() => ({ base: new THREE.Color(color), sel: new THREE.Color(selColor) }), [color, selColor]);
  useFrame((state, dt) => {
    if (!g.current || !mat.current) return;
    const k = 1 - Math.exp(-dt * 8);
    const t = state.clock.elapsedTime;
    const targetY = pos[1] + (selected ? 0.45 : Math.sin(t * 1.6 + phase) * 0.06);
    g.current.position.y += (targetY - g.current.position.y) * k;
    g.current.position.x += (pos[0] - g.current.position.x) * k;
    const s = selected ? 1.25 : 1;
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
    g.current.rotation.y = t * 0.6 + phase;
    mat.current.color.lerp(selected ? cols.sel : cols.base, k);
    mat.current.emissive.lerp(selected ? cols.sel : cols.base, k);
    mat.current.emissiveIntensity += ((selected ? 0.55 : 0.12) - mat.current.emissiveIntensity) * k;
  });
  return (
    <group ref={g} position={start}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <icosahedronGeometry args={[0.36, 2]} />
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          roughness={0.08}
          transmission={0.35}
          thickness={0.5}
          clearcoat={1}
          ior={1.5}
          flatShading
        />
      </mesh>
      <Html center position={[0, 0, 0.42]} style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[17px] font-extrabold text-white" style={{ textShadow: "0 1px 6px rgb(0 0 0 / 0.6)" }}>
          {ch === " " ? "␣" : ch}
        </div>
      </Html>
      <Html center position={[0, 0.62, 0]} style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[10.5px] font-bold text-label">{index}</div>
      </Html>
      <Html center position={[0, -0.62, 0]} style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[10.5px] text-label-2">{neg}</div>
      </Html>
    </group>
  );
}

function Tiara({ cs, sel, setSel }: { cs: string[]; sel: number; setSel: (i: number) => void }) {
  const c = useThemeColors();
  const { spread, points } = layout(cs.length);
  const n = cs.length;
  return (
    <group position={[0, 0.2, 0]}>
      {/* золотий дріт тіари — дуга того ж радіуса */}
      <mesh position={[0, -R + 0.35, -0.05]} rotation={[0, 0, Math.PI / 2 - spread / 2]}>
        <torusGeometry args={[R, 0.028, 8, 96, spread]} />
        <meshStandardMaterial color={c.glow} emissive={c.glow} emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* місячний кристал над центром */}
      <mesh position={[0, 1.25, -0.4]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshPhysicalMaterial color={c.accent2} emissive={c.accent2} emissiveIntensity={0.5} roughness={0.1} clearcoat={1} />
      </mesh>
      {points.map((p, i) => (
        <Bead
          key={i}
          pos={p}
          ch={cs[i]}
          index={i}
          neg={i - n}
          selected={i === sel}
          color={c.accent2}
          selColor={c.accent}
          onSelect={() => setSel(i)}
          phase={i * 0.7}
        />
      ))}
    </group>
  );
}

/** Зменшує сцену на вузьких екранах (до 340px), щоб нічого не обрізалось. */
function Fit({ width, children }: { width: number; children: ReactNode }) {
  const vw = useThree((s) => s.viewport.width);
  const k = Math.min(1, vw / width);
  return <group scale={k}>{children}</group>;
}

export function IndexTiara3D() {
  const [text, setText] = useState<string>(PRESETS[0]);
  const [sel, setSel] = useState(0);
  const cs = chars(text).slice(0, MAX);
  const n = cs.length;
  const i = Math.min(sel, Math.max(0, n - 1));
  const ch = cs[i] ?? "";
  const bytes = ch ? utf8(ch) : [];
  const totalBytes = utf8(cs.join("")).length;

  return (
    <div>
      <Scene3D height={330} camera={[0, 0.5, 8.6]} shadows={false}>
        <Fit width={7.2}>{n > 0 && <Tiara cs={cs} sel={i} setSel={setSel} />}</Fit>
      </Scene3D>

      <div className="grid gap-2 px-5 sm:grid-cols-2">
        <div className="rounded-[16px] px-4 py-3" style={{ background: "color-mix(in oklab, var(--accent) 12%, transparent)" }}>
          {n > 0 ? (
            <div className="space-y-1 font-mono text-[13px]">
              <div>
                <span className="text-label-2">s[{i}]</span> == <span className="text-label-2">s[{i - n}]</span> =={" "}
                <b style={{ color: "var(--accent)" }}>{pyRepr(ch)}</b>
              </div>
              <div>
                <span className="text-label-2">ord →</span> {ch.codePointAt(0)} <span className="text-label-2">({uplus(ch)})</span>
              </div>
              <div className="break-all">
                <span className="text-label-2">UTF-8 →</span> {bytes.map(hex2).join(" ")}{" "}
                <span className="text-label-2">
                  ({bytes.length} {bytes.length === 1 ? "байт" : "байти"})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-label-2">Порожній рядок: жодного індексу, s[0] → IndexError</div>
          )}
        </div>
        <div className="rounded-[16px] border border-separator px-4 py-3 font-mono text-[13px]">
          <div>
            len(s) = <b>{n}</b> <span className="text-label-2"># символів</span>
          </div>
          <div>
            len(s.encode()) = <b>{totalBytes}</b> <span className="text-label-2"># байтів</span>
          </div>
          <div className="truncate text-label-2">
            {n > 0 ? (
              <>
                s[{i}].encode() → {pyBytes(bytes)}
              </>
            ) : (
              "b''"
            )}
          </div>
        </div>
      </div>

      <ControlBar>
        <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-full border border-separator px-3 py-1.5">
          <span className="font-mono text-[12px] font-bold text-label-2">s =</span>
          <input
            value={text}
            onChange={(e) => {
              setText(chars(e.target.value).slice(0, MAX).join(""));
              setSel(0);
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-[14px] outline-none"
            spellCheck={false}
            aria-label="Власний рядок (до 10 символів)"
          />
        </label>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setText(p);
              setSel(0);
            }}
            className="pill pill-glass !px-3 !py-1 font-mono !text-[12px]"
          >
            {p}
          </button>
        ))}
      </ControlBar>
    </div>
  );
}
