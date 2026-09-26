"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { ControlBar, Scene3D, useThemeColors } from "../kit";
import { bin8, chars, hex2, pyRepr, uplus, utf8 } from "./util";

const PRESETS = ["Aї€🌙", "Moon", "Місяць", "🌙⭐💖"] as const;
const MAX = 7;
const GAP = 1.05;
const CUBE = 0.7;
const STEP = 0.78;
const BASE_Y = -1.15;

/** Скільки старших бітів байта — «службові» (маркер довжини або продовження). */
function prefixLen(byte: number, lead: boolean, total: number): number {
  if (!lead) return 2; // 10xxxxxx
  return total === 1 ? 1 : total + 1; // 0xxxxxxx, 110xxxxx, 1110xxxx, 11110xxx
}

function ByteCube({
  y,
  delay,
  color,
  selected,
  onSelect,
}: {
  y: number;
  delay: number;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const born = useRef(-1);
  // стартові трансформації — лише для монтування, далі все веде useFrame
  const [init] = useState(() => ({ y: y + 0.8 }));
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g || !mat.current) return;
    const t = state.clock.elapsedTime;
    if (born.current < 0) born.current = t;
    const k = 1 - Math.exp(-dt * 10);
    const target = t - born.current > delay ? 1 : 0.001;
    const s = g.scale.x + (target - g.scale.x) * k;
    g.scale.setScalar(s);
    g.position.y = y + (1 - s) * 0.8;
    mat.current.emissiveIntensity += ((selected ? 0.5 : 0.12) - mat.current.emissiveIntensity) * k;
  });
  return (
    <group ref={ref} position-y={init.y} scale={0.001}>
      <RoundedBox
        args={[CUBE, CUBE, CUBE]}
        radius={0.1}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.15}
          transmission={0.3}
          thickness={0.4}
          clearcoat={1}
        />
      </RoundedBox>
    </group>
  );
}

function Towers({ cs, sel, setSel }: { cs: string[]; sel: number; setSel: (i: number) => void }) {
  const c = useThemeColors();
  const n = cs.length;
  const scale = Math.min(1, 5.4 / Math.max(1, n * GAP));
  const disc = useRef<THREE.Mesh>(null);
  const discX = (sel - (n - 1) / 2) * GAP;
  const leadColor = c.accent;
  const contColor = c.accent2;
  useFrame((_, dt) => {
    if (!disc.current) return;
    disc.current.position.x += (discX - disc.current.position.x) * (1 - Math.exp(-dt * 10));
  });
  return (
    <group scale={scale} position={[0, 0, 0]}>
      {/* підсвічена «підставка» під вибраною колоною */}
      <mesh ref={disc} position={[0, BASE_Y - CUBE / 2 - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 48]} />
        <meshBasicMaterial color={c.accent} transparent opacity={0.35} />
      </mesh>
      {cs.map((ch, j) => {
        const bytes = utf8(ch);
        const x = (j - (n - 1) / 2) * GAP;
        return (
          <group key={`${j}-${ch}`} position={[x, 0, 0]}>
            {bytes.map((_, k) => (
              <ByteCube
                key={k}
                y={BASE_Y + k * STEP}
                delay={j * 0.06 + k * 0.1}
                color={k === 0 ? leadColor : contColor}
                selected={j === sel}
                onSelect={() => setSel(j)}
              />
            ))}
            <Html center position={[0, BASE_Y + bytes.length * STEP + 0.15, 0]} style={{ pointerEvents: "none" }}>
              <div
                className="font-mono text-[18px] font-extrabold text-label"
                style={{ opacity: j === sel ? 1 : 0.75 }}
              >
                {ch === " " ? "␣" : ch}
              </div>
            </Html>
            <Html center position={[0, BASE_Y - CUBE / 2 - 0.4, 0]} style={{ pointerEvents: "none" }}>
              <div className="font-mono text-[10.5px] whitespace-nowrap text-label-2">
                {bytes.length} Б
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function Utf8Towers3D() {
  const [text, setText] = useState<string>(PRESETS[0]);
  const [sel, setSel] = useState(3);
  const cs = chars(text).slice(0, MAX);
  const n = cs.length;
  const i = Math.min(sel, Math.max(0, n - 1));
  const ch = cs[i] ?? "";
  const bytes = ch ? utf8(ch) : [];
  const total = utf8(cs.join("")).length;

  return (
    <div>
      <div className="relative">
        <Scene3D height={340} camera={[0, 1.4, 8.2]}>
          {n > 0 && <Towers cs={cs} sel={i} setSel={setSel} />}
        </Scene3D>
        <div className="pointer-events-none absolute top-2 right-3 flex flex-col items-end gap-1 text-[11px]">
          <span className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <span className="size-2.5 rounded-[3px]" style={{ background: "var(--accent)" }} /> провідний байт
          </span>
          <span className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <span className="size-2.5 rounded-[3px]" style={{ background: "var(--accent-2)" }} /> байт продовження
          </span>
        </div>
      </div>

      <div className="grid gap-2 px-5 sm:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[16px] px-4 py-3" style={{ background: "color-mix(in oklab, var(--accent) 11%, transparent)" }}>
          {n > 0 ? (
            <>
              <div className="font-mono text-[13px]">
                <b style={{ color: "var(--accent)" }}>{pyRepr(ch)}</b> <span className="text-label-2">{uplus(ch)} →</span>{" "}
                {bytes.map((b) => "\\x" + hex2(b)).join("")}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bytes.map((b, k) => {
                  const bits = bin8(b);
                  const p = prefixLen(b, k === 0, bytes.length);
                  return (
                    <span key={k} className="rounded-lg bg-black/75 px-2 py-1 font-mono text-[12.5px] tracking-wider text-white">
                      <span style={{ color: k === 0 ? "var(--accent)" : "var(--accent-2)" }} className="font-bold">
                        {bits.slice(0, p)}
                      </span>
                      <span className="opacity-90">{bits.slice(p)}</span>
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 text-[12px] text-label-2">
                Кольорові біти — службові: вони кажуть декодеру, скільки байтів займає символ. Решта бітів разом складають кодову точку.
              </div>
            </>
          ) : (
            <div className="text-[13px] text-label-2">Порожній рядок — нуль байтів.</div>
          )}
        </div>
        <div className="rounded-[16px] border border-separator px-4 py-3 font-mono text-[13px]">
          <div>
            len(s) = <b>{n}</b>
          </div>
          <div>
            len(s.encode(&quot;utf-8&quot;)) = <b style={{ color: "var(--accent)" }}>{total}</b>
          </div>
          <div className="mt-1 text-[11.5px] text-label-2">
            ASCII — 1 байт, кирилиця — 2, € — 3, більшість емодзі — 4.
          </div>
        </div>
      </div>

      <ControlBar>
        <label className="flex min-w-[170px] flex-1 items-center gap-2 rounded-full border border-separator px-3 py-1.5">
          <span className="font-mono text-[12px] font-bold text-label-2">s =</span>
          <input
            value={text}
            onChange={(e) => {
              setText(chars(e.target.value).slice(0, MAX).join(""));
              setSel(0);
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-[14px] outline-none"
            spellCheck={false}
            aria-label="Власний рядок (до 7 символів)"
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
