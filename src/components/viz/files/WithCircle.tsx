"use client";

import { Html, Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Btn, Console, ControlBar, Scene3D, Segmented, useThemeColors, type ThemeColors } from "../kit";

type Mode = "with" | "manual";
/** outside — ще не відкрито; open — всередині блоку; closed — коректно закрито; leak — відкрито і забуто */
type FileState = "outside" | "open" | "closed" | "leak";

/** Вершини трансмутаційного кола: дві трикутні «зірки» + внутрішній шестикутник. */
function useGlyphs() {
  return useMemo(() => {
    const tri = (r: number, rot: number) =>
      [0, 1, 2, 3].map((i) => {
        const a = rot + (i * Math.PI * 2) / 3;
        return [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number];
      });
    const hex = Array.from({ length: 7 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return [Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9] as [number, number, number];
    });
    return { t1: tri(1.75, Math.PI / 2), t2: tri(1.75, -Math.PI / 2), hex };
  }, []);
}

function Circle({ active, leak, colors }: { active: boolean; leak: boolean; colors: ThemeColors }) {
  const spin = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const glyphs = useGlyphs();
  const glow = active ? colors.accent : leak ? colors.accent2 : colors.dark ? "#636366" : "#b0b0b8";
  const target = useMemo(() => new THREE.Color(glow), [glow]);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * (active ? 0.9 : 0.12);
    if (ring.current) {
      const k = 1 - Math.exp(-dt * 4);
      ring.current.emissive.lerp(target, k);
      ring.current.color.lerp(target, k);
      ring.current.emissiveIntensity += ((active ? 1.3 : leak ? 0.8 : 0.15) - ring.current.emissiveIntensity) * k;
    }
  });

  return (
    <group position={[0, -1.35, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.05, 16, 128]} />
        <meshStandardMaterial ref={ring} color={glow} emissive={glow} emissiveIntensity={0.15} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 12, 128]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={active ? 1 : 0.2} />
      </mesh>
      <group ref={spin}>
        <Line points={glyphs.t1} color={glow} lineWidth={2} transparent opacity={active ? 1 : 0.5} />
        <Line points={glyphs.t2} color={glow} lineWidth={2} transparent opacity={active ? 1 : 0.5} />
        <Line points={glyphs.hex} color={glow} lineWidth={1.5} transparent opacity={active ? 0.9 : 0.4} />
      </group>
    </group>
  );
}

function Scroll({ state, runes, colors }: { state: FileState; runes: number; colors: ThemeColors }) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const isOpen = state === "open" || state === "leak";
  const tint = useMemo(
    () => new THREE.Color(state === "leak" ? colors.accent2 : state === "open" ? colors.accent : colors.dark ? "#8e8e93" : "#d1d1d6"),
    [state, colors],
  );

  useFrame((st, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = 1 - Math.exp(-dt * 5);
    const t = st.clock.elapsedTime;
    const ty = isOpen ? 0.25 + Math.sin(t * 2) * 0.08 : -0.55;
    grp.position.y += (ty - grp.position.y) * k;
    grp.rotation.y += ((isOpen ? Math.sin(t * 0.6) * 0.35 : 0) - grp.rotation.y) * k;
    const s = state === "outside" ? 0.8 : 1;
    grp.scale.setScalar(grp.scale.x + (s - grp.scale.x) * k);
    if (mat.current) {
      mat.current.color.lerp(tint, k);
      mat.current.emissive.lerp(tint, k);
      const pulse = state === "leak" ? 0.5 + Math.abs(Math.sin(t * 4)) * 0.8 : isOpen ? 0.45 : 0.02;
      mat.current.emissiveIntensity += (pulse - mat.current.emissiveIntensity) * k;
    }
  });

  return (
    <group ref={g} position={[0, -0.55, 0]}>
      <RoundedBox args={[1.2, 1.55, 0.14]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          ref={mat}
          color="#d1d1d6"
          emissive="#000000"
          roughness={0.2}
          clearcoat={1}
          transmission={0.35}
          thickness={0.5}
        />
      </RoundedBox>
      {/* «Руни» — записані рядки */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.08 + (i % 2) * 0.1, 0.5 - i * 0.2, 0.08]} scale={i < runes ? 1 : 0.0001}>
          <boxGeometry args={[i % 2 ? 0.7 : 0.85, 0.05, 0.02]} />
          <meshStandardMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.9} />
        </mesh>
      ))}
      <Html center position={[0, 1.05, 0]} zIndexRange={[20, 0]}>
        <div
          className="rounded-full px-2.5 py-1 font-mono text-[11px] whitespace-nowrap backdrop-blur-md select-none"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--glass-border)",
            color: state === "leak" ? "var(--accent-2)" : "var(--label)",
          }}
        >
          log.txt · {state === "outside" ? "не відкрито" : state === "closed" ? "closed=True" : state === "leak" ? "⚠ відкрито й забуто" : "closed=False"}
        </div>
      </Html>
    </group>
  );
}

export function WithCircle() {
  const colors = useThemeColors();
  const [mode, setMode] = useState<Mode>("with");
  const [state, setState] = useState<FileState>("outside");
  const [runes, setRunes] = useState(0);
  const [leaks, setLeaks] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const say = (...lines: string[]) => setLog((l) => [...l, ...lines].slice(-5));

  const enter = () => {
    setState("open");
    setRunes(0);
    setLog([]);
    say(mode === "with" ? '>>> with open("log.txt", "w") as f:   # __enter__()' : '>>> f = open("log.txt", "w")');
  };
  const write = () => {
    setRunes((r) => Math.min(r + 1, 6));
    say(`...     f.write("руна ${runes + 1}\\n")`);
  };
  const exitOk = () => {
    setState("closed");
    say(mode === "with" ? "# кінець блоку → __exit__(None, None, None) → f.close() ✓" : ">>> f.close()   # не забув — молодець ✓");
  };
  const boom = () => {
    if (mode === "with") {
      setState("closed");
      say("💥 ValueError у блоці", "# __exit__(ValueError, ...) → f.close() ✓, виняток летить далі");
    } else {
      setState("leak");
      setLeaks((n) => n + 1);
      say("💥 ValueError до f.close()", "# close() не викликано — файл лишився відкритим!");
    }
  };

  const reset = (m: Mode = mode) => {
    setMode(m);
    setState("outside");
    setRunes(0);
    setLog([]);
    if (m === "with") setLeaks(0);
  };

  const inside = state === "open";

  return (
    <div>
      <ControlBar>
        <Segmented
          id="with-mode"
          value={mode}
          onChange={(m) => reset(m)}
          options={[
            { value: "with", label: "with" },
            { value: "manual", label: "без with" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Btn variant="accent" onClick={enter} disabled={inside}>
            Відкрити
          </Btn>
          <Btn onClick={write} disabled={!inside}>
            write()
          </Btn>
          <Btn onClick={exitOk} disabled={!inside}>
            {mode === "with" ? "Вийти з блоку" : "f.close()"}
          </Btn>
          <Btn onClick={boom} disabled={!inside}>
            💥 Виняток
          </Btn>
        </div>
      </ControlBar>
      <div className="relative">
        <Scene3D height={340} camera={[0, 2.2, 6.2]} fov={42}>
          <Circle active={inside && mode === "with"} leak={state === "leak"} colors={colors} />
          <Scroll state={state} runes={runes} colors={colors} />
        </Scene3D>
        {mode === "manual" && leaks > 0 && (
          <div
            className="absolute top-2 right-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold backdrop-blur-md"
            style={{ background: "color-mix(in oklab, var(--accent-2) 20%, transparent)", color: "var(--accent-2)" }}
          >
            «протекло» дескрипторів: {leaks}
          </div>
        )}
      </div>
      <Console lines={log.length ? log : ["# Натисни «Відкрити», щоб почати трансмутацію"]} />
    </div>
  );
}
