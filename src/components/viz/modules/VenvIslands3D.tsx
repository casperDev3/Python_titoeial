"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, type Group, type Mesh } from "three";
import { Download, Globe, LogOut, Radio, Rocket, Smartphone, Trash2, type LucideIcon } from "lucide-react";
import { Btn, ControlBar, Segmented, Scene3D, useThemeColors } from "../kit";
import { CONSOLE_BG, GREEN, INK, RED, tint } from "./palette";

type EnvId = "global" | "radio" | "phone" | "rocket";
type PkgName = "requests" | "rich" | "numpy";
type Pkg = { name: PkgName; ver: string };
type Choice = "requests==2.31.0" | "requests==2.32.3" | "rich" | "numpy";

const ENVS: { id: EnvId; label: string; icon: LucideIcon; pos: [number, number, number] }[] = [
  { id: "global", label: "системний Python", icon: Globe, pos: [0, -1.05, -1.5] },
  { id: "radio", label: "radio/.venv", icon: Radio, pos: [-2.35, -1.05, 0.25] },
  { id: "phone", label: "phone/.venv", icon: Smartphone, pos: [0, -1.05, 1.45] },
  { id: "rocket", label: "rocket/.venv", icon: Rocket, pos: [2.35, -1.05, 0.25] },
];

const PARSE: Record<Choice, Pkg> = {
  "requests==2.31.0": { name: "requests", ver: "2.31.0" },
  "requests==2.32.3": { name: "requests", ver: "2.32.3" },
  rich: { name: "rich", ver: "14.1.0" },
  numpy: { name: "numpy", ver: "2.3.3" },
};

const INITIAL: Record<EnvId, Pkg[]> = {
  global: [],
  radio: [{ name: "requests", ver: "2.31.0" }],
  phone: [
    { name: "requests", ver: "2.32.3" },
    { name: "rich", ver: "14.1.0" },
  ],
  rocket: [],
};

function PkgCube({
  y, color, label, showLabel,
}: {
  y: number; color: string; label: string; showLabel: boolean;
}) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = Math.min(1, dt * 6);
    grp.position.y += (y - grp.position.y) * k;
    const s = grp.scale.x + (1 - grp.scale.x) * k;
    grp.scale.set(s, s, s);
    grp.rotation.y += dt * 0.35;
  });
  return (
    <group ref={g} position={[0, y + 2.6, 0]} scale={0.3}>
      <RoundedBox args={[0.46, 0.3, 0.46]} radius={0.06} smoothness={3}>
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.22} roughness={0.2} clearcoat={1} transmission={0.2} thickness={0.4} />
      </RoundedBox>
      {showLabel && (
        <Html position={[0.36, 0, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="rounded-md border border-separator bg-white/95 px-1.5 py-px font-mono text-[10px] whitespace-nowrap text-label shadow-sm">{label}</div>
        </Html>
      )}
    </group>
  );
}

function Island({
  id, label, icon: Icon, pos, active, pkgs, onPick, colors, shake, compact,
}: {
  id: EnvId; label: string; icon: LucideIcon; pos: [number, number, number]; active: boolean; pkgs: Pkg[];
  onPick: (id: EnvId) => void; colors: Record<PkgName, string>; shake: number; compact: boolean;
}) {
  const root = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const shakeRef = useRef({ seen: shake, t: 0 });
  useFrame((st, dt) => {
    const r = root.current;
    if (!r) return;
    const k = Math.min(1, dt * 6);
    const goalY = pos[1] + (active ? 0.22 : 0);
    r.position.y += (goalY - r.position.y) * k;
    // тряска при забороненій операції
    const sh = shakeRef.current;
    if (sh.seen !== shake) {
      sh.seen = shake;
      sh.t = 0.5;
    }
    sh.t = Math.max(0, sh.t - dt);
    r.position.x = pos[0] + Math.sin(st.clock.elapsedTime * 60) * 0.06 * sh.t * 2;
    if (ring.current) {
      ring.current.rotation.z += dt * 0.8;
      const s = ring.current.scale.x + ((active ? 1 : 0.001) - ring.current.scale.x) * k;
      ring.current.scale.set(s, s, s);
    }
  });
  const isGlobal = id === "global";
  return (
    <group ref={root} position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick(id);
        }}
      >
        <cylinderGeometry args={[0.82, 0.62, 0.26, 48]} />
        <meshPhysicalMaterial
          color={isGlobal ? "#e5e5ea" : active ? colors.requests : "#ffffff"}
          emissive={isGlobal ? "#000000" : colors.requests}
          emissiveIntensity={active ? 0.18 : 0.06}
          transmission={0.5}
          thickness={0.6}
          roughness={0.2}
          clearcoat={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={0.001}>
        <torusGeometry args={[0.95, 0.025, 12, 64]} />
        <meshStandardMaterial color={colors.rich} emissive={colors.rich} emissiveIntensity={0.9} />
      </mesh>
      {pkgs.map((p, i) => (
        <PkgCube
          key={`${p.name}-${p.ver}`}
          y={0.3 + i * 0.34}
          color={colors[p.name]}
          label={`${p.name} ${p.ver}`}
          showLabel={active && !compact}
        />
      ))}
      <Html position={[0, -0.3, 0.8]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap shadow-sm"
          style={{
            background: active ? INK : "rgba(255,255,255,.95)",
            borderColor: active ? INK : "var(--separator)",
            color: active ? "white" : "var(--label)",
          }}
        >
          <Icon className="size-3" strokeWidth={1.75} />
          {compact ? (isGlobal ? "system" : id) : label}
        </div>
      </Html>
    </group>
  );
}

function World({
  active, envs, onPick, shake,
}: {
  active: EnvId; envs: Record<EnvId, Pkg[]>; onPick: (id: EnvId) => void; shake: number;
}) {
  const c = useThemeColors();
  const { size } = useThree();
  const k = Math.min(1, size.width / size.height / 1.5);
  const colors = useMemo<Record<PkgName, string>>(
    () => ({
      requests: c.accent,
      rich: c.accent2,
      numpy: "#" + new Color(c.accent).lerp(new Color(c.accent2), 0.5).offsetHSL(0.08, 0, 0.05).getHexString(),
    }),
    [c.accent, c.accent2],
  );
  return (
    <group scale={k}>
      {ENVS.map((e) => (
        <Island
          key={e.id}
          {...e}
          active={active === e.id}
          pkgs={envs[e.id]}
          onPick={onPick}
          colors={colors}
          shake={e.id === "global" ? shake : 0}
          compact={size.width < 520}
        />
      ))}
    </group>
  );
}

export function VenvIslands3D() {
  const [active, setActive] = useState<EnvId>("radio");
  const [envs, setEnvs] = useState<Record<EnvId, Pkg[]>>(INITIAL);
  const [choice, setChoice] = useState<Choice>("requests==2.32.3");
  const [log, setLog] = useState<{ t: string; tone?: "err" | "ok" | "cmd" }[]>([
    { t: "$ source radio/.venv/bin/activate", tone: "cmd" },
  ]);
  const [shake, setShake] = useState(0);

  const prompt = active === "global" ? "$" : `(${active}) $`;
  const push = (lines: { t: string; tone?: "err" | "ok" | "cmd" }[]) => setLog((l) => [...l, ...lines].slice(-6));

  const pick = (id: EnvId) => {
    if (id === active) return;
    setActive(id);
    push([{ t: id === "global" ? `${prompt} deactivate` : `$ source ${id}/.venv/bin/activate`, tone: "cmd" }]);
  };

  const install = () => {
    const pkg = PARSE[choice];
    const cmd = { t: `${prompt} python -m pip install ${choice}`, tone: "cmd" as const };
    if (active === "global") {
      setShake((v) => v + 1);
      push([cmd, { t: "error: externally-managed-environment", tone: "err" }, { t: "→ створи venv: python3 -m venv .venv", tone: "err" }]);
      return;
    }
    const list = envs[active];
    const same = list.find((p) => p.name === pkg.name);
    if (same && same.ver === pkg.ver) {
      push([cmd, { t: `Requirement already satisfied: ${pkg.name}==${pkg.ver}` }]);
      return;
    }
    const next = same ? list.map((p) => (p.name === pkg.name ? pkg : p)) : [...list, pkg];
    setEnvs({ ...envs, [active]: next });
    push([
      cmd,
      ...(same ? [{ t: `Successfully uninstalled ${same.name}-${same.ver}` }] : []),
      { t: `Successfully installed ${pkg.name}-${pkg.ver}`, tone: "ok" as const },
    ]);
  };

  const uninstall = () => {
    const pkg = PARSE[choice];
    const cmd = { t: `${prompt} python -m pip uninstall -y ${pkg.name}`, tone: "cmd" as const };
    const list = envs[active];
    if (!list.some((p) => p.name === pkg.name)) {
      push([cmd, { t: `WARNING: Skipping ${pkg.name} as it is not installed.` }]);
      return;
    }
    setEnvs({ ...envs, [active]: list.filter((p) => p.name !== pkg.name) });
    push([cmd, { t: `Successfully uninstalled ${pkg.name}`, tone: "ok" }]);
  };

  const freeze = envs[active];

  return (
    <div>
      <Scene3D height={340} camera={[0, 2.6, 6.6]} fov={44} shadows>
        <World active={active} envs={envs} onPick={pick} shake={shake} />
      </Scene3D>

      <ControlBar>
        <Segmented
          id="mod-venv-pkg"
          value={choice}
          onChange={setChoice}
          options={[
            { value: "requests==2.31.0", label: "requests 2.31" },
            { value: "requests==2.32.3", label: "requests 2.32" },
            { value: "rich", label: "rich" },
            { value: "numpy", label: "numpy" },
          ]}
        />
        <Btn variant="accent" onClick={install}>
          <Download className="size-4" strokeWidth={1.75} /> install
        </Btn>
        <Btn onClick={uninstall}>
          <Trash2 className="size-4" strokeWidth={1.75} /> uninstall
        </Btn>
        <Btn onClick={() => pick("global")} disabled={active === "global"}>
          <LogOut className="size-4" strokeWidth={1.75} /> deactivate
        </Btn>
      </ControlBar>

      <div className="grid gap-2 px-5 pb-4 sm:grid-cols-[1.5fr_1fr]">
        <div className="min-h-[118px] rounded-2xl border border-separator px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-label" style={{ background: CONSOLE_BG }}>
          {log.map((l, i) => (
            <div
              key={`${log.length}-${i}`}
              className="truncate"
              style={{ color: l.tone === "err" ? RED : l.tone === "ok" ? GREEN : l.tone === "cmd" ? "var(--label)" : "var(--label-2)" }}
            >
              {l.t}
            </div>
          ))}
        </div>
        <div className="rounded-2xl px-3.5 py-2.5" style={{ background: tint(9) }}>
          <div className="mb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase">
            pip freeze · {active === "global" ? "system" : `${active}/.venv`}
          </div>
          <div className="font-mono text-[12px]">
            {freeze.length === 0 ? (
              <span className="text-label-3"># порожньо — чиста лабораторія</span>
            ) : (
              freeze.map((p) => (
                <div key={p.name}>
                  {p.name}==<span className="font-semibold" style={{ color: INK }}>{p.ver}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
