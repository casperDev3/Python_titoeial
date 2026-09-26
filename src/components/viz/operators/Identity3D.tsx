"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Btn, Console, ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type Scenario = "alias" | "literal" | "copy";

const SCENARIOS: { value: Scenario; label: string; code: string }[] = [
  { value: "alias", label: "b = a", code: "b = a" },
  { value: "literal", label: "b = [1, 2, 3]", code: "b = [1, 2, 3]" },
  { value: "copy", label: "b = a.copy()", code: "b = a.copy()" },
];

const FAKE_ID = { A: "0x7f3a1c40", B: "0x7f3a2e88" } as const;

const TAG_A = new THREE.Vector3(-2.3, 0.95, 0);
const TAG_B = new THREE.Vector3(-2.3, -0.95, 0);
const OBJ_HALF_W = 0.95;

// тимчасові вектори без алокацій у кадрі
const tmpEnd = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const tmpMid = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const WHITE = new THREE.Color("#ffffff");

const repr = (xs: number[]) => `[${xs.join(", ")}]`;

/** Стрілка-посилання від ярлика до об'єкта; стежить за анімованою позицією цілі. */
function Arrow({ from, target, color }: { from: THREE.Vector3; target: RefObject<THREE.Group | null>; color: string }) {
  const shaft = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = target.current;
    if (!t || !shaft.current || !head.current) return;
    tmpEnd.copy(t.position);
    tmpEnd.x -= OBJ_HALF_W + 0.08;
    tmpDir.subVectors(tmpEnd, from);
    const len = tmpDir.length();
    tmpDir.normalize();
    const shaftLen = Math.max(0.01, len - 0.28);
    tmpMid.copy(from).addScaledVector(tmpDir, shaftLen / 2);
    shaft.current.position.copy(tmpMid);
    shaft.current.scale.set(1, shaftLen, 1);
    shaft.current.quaternion.setFromUnitVectors(UP, tmpDir);
    head.current.position.copy(from).addScaledVector(tmpDir, shaftLen + 0.14);
    head.current.quaternion.setFromUnitVectors(UP, tmpDir);
  });
  return (
    <group>
      <mesh ref={shaft}>
        <cylinderGeometry args={[0.035, 0.035, 1, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={head}>
        <coneGeometry args={[0.12, 0.28, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function NameTag({ pos, name, color }: { pos: THREE.Vector3; name: string; color: string }) {
  return (
    <group position={pos}>
      <RoundedBox args={[0.9, 0.62, 0.3]} radius={0.14} smoothness={4}>
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.2} metalness={0.05} />
      </RoundedBox>
      <Html center position={[0, 0, 0.2]} style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[18px] font-extrabold text-white drop-shadow">{name}</div>
      </Html>
    </group>
  );
}

function ListObject({
  groupRef,
  items,
  color,
  selected,
  onSelect,
  bumpRef,
  targetY,
  visible,
  idText,
}: {
  groupRef: RefObject<THREE.Group | null>;
  items: number[];
  color: string;
  selected: boolean;
  onSelect: () => void;
  bumpRef: RefObject<number>;
  targetY: number;
  visible: boolean;
  idText: string;
}) {
  const mesh = useRef<THREE.Group>(null);
  // стартові значення — лише для першого кадру, далі позицію плавно веде useFrame
  const [initial] = useState(() => ({ y: targetY, s: visible ? 1 : 0.001 }));
  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g || !mesh.current) return;
    const k = 1 - Math.exp(-dt * 7);
    g.position.y += (targetY - g.position.y) * k;
    const s = visible ? 1 : 0.001;
    const cur = g.scale.x + (s - g.scale.x) * k;
    g.scale.setScalar(cur);
    bumpRef.current *= Math.exp(-dt * 6);
    const pulse = 1 + bumpRef.current * 0.18 + (selected ? 0.04 : 0);
    mesh.current.scale.setScalar(pulse);
    mesh.current.rotation.y = Math.sin(performance.now() / 1400) * 0.12;
  });
  return (
    <group ref={groupRef} position={[1.5, initial.y, 0]} scale={initial.s}>
      <group ref={mesh}>
        <RoundedBox
          args={[OBJ_HALF_W * 2, 0.95, 0.7]}
          radius={0.2}
          smoothness={5}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <meshPhysicalMaterial
            color={color}
            transmission={0.55}
            thickness={0.6}
            roughness={0.12}
            clearcoat={1}
            ior={1.35}
            transparent
            opacity={0.95}
            emissive={color}
            emissiveIntensity={selected ? 0.18 : 0.03}
          />
        </RoundedBox>
      </group>
      {visible && (
        <Html center position={[0, 0, 0.45]} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center whitespace-nowrap">
            <div className="rounded-lg bg-white/92 px-2 py-0.5 font-mono text-[13px] font-bold text-[#1d1d1f] shadow-sm ring-1 ring-black/10">
              {repr(items)}
            </div>
            <div className="mt-1 rounded-md bg-white/85 px-1.5 font-mono text-[10px] text-[#3a3a3c]">list · id {idText}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({
  scenario,
  listA,
  listB,
  selected,
  setSelected,
  bumpARef,
  bumpBRef,
}: {
  scenario: Scenario;
  listA: number[];
  listB: number[];
  selected: "A" | "B" | null;
  setSelected: (s: "A" | "B") => void;
  bumpARef: RefObject<number>;
  bumpBRef: RefObject<number>;
}) {
  const c = useThemeColors();
  const objA = useRef<THREE.Group>(null);
  const objB = useRef<THREE.Group>(null);
  const alias = scenario === "alias";
  const tagColor = "#3a3a3c";
  const paleA = useMemo(() => "#" + new THREE.Color(c.accent).lerp(WHITE, 0.4).getHexString(), [c.accent]);
  const paleB = useMemo(() => "#" + new THREE.Color(c.accent2).lerp(WHITE, 0.4).getHexString(), [c.accent2]);
  return (
    <group position={[0.2, 0.1, 0]}>
      <NameTag pos={TAG_A} name="a" color={tagColor} />
      <NameTag pos={TAG_B} name="b" color={tagColor} />
      <ListObject
        groupRef={objA}
        items={listA}
        color={paleA}
        selected={selected === "A"}
        onSelect={() => setSelected("A")}
        bumpRef={bumpARef}
        targetY={alias ? 0 : 0.95}
        visible
        idText={FAKE_ID.A}
      />
      <ListObject
        groupRef={objB}
        items={listB}
        color={paleB}
        selected={selected === "B"}
        onSelect={() => setSelected("B")}
        bumpRef={bumpBRef}
        targetY={alias ? 0 : -0.95}
        visible={!alias}
        idText={FAKE_ID.B}
      />
      <Arrow from={TAG_A} target={objA} color={c.accent} />
      <Arrow from={TAG_B} target={alias ? objA : objB} color={alias ? c.accent : c.accent2} />
    </group>
  );
}

export function Identity3D() {
  const [scenario, setScenario] = useState<Scenario>("alias");
  const [listA, setListA] = useState<number[]>([1, 2, 3]);
  const [listB, setListB] = useState<number[]>([1, 2, 3]);
  const [appends, setAppends] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const bumpARef = useRef(0);
  const bumpBRef = useRef(0);

  const alias = scenario === "alias";
  const a = listA;
  const b = alias ? listA : listB;
  const eq = a.length === b.length && a.every((v, i) => v === b[i]);

  const choose = (s: Scenario) => {
    setScenario(s);
    setListA([1, 2, 3]);
    setListB([1, 2, 3]);
    setAppends(0);
    setSelected(null);
  };

  const append = () => {
    const next = Math.max(...b) + 1;
    if (alias) {
      setListA((xs) => [...xs, next]);
      bumpARef.current = 1;
    } else {
      setListB((xs) => [...xs, next]);
      bumpBRef.current = 1;
    }
    setAppends((n) => n + 1);
  };

  const scen = SCENARIOS.find((s) => s.value === scenario) ?? SCENARIOS[0];
  const pyBool = (v: boolean) => (v ? "True" : "False");

  return (
    <div>
      <Scene3D height={340} camera={[0, 0.9, 8.4]}>
        <Scene
          scenario={scenario}
          listA={listA}
          listB={listB}
          selected={selected}
          setSelected={setSelected}
          bumpARef={bumpARef}
          bumpBRef={bumpBRef}
        />
      </Scene3D>
      <ControlBar>
        <Segmented id="identity-scn" value={scenario} onChange={choose} options={SCENARIOS} />
        <Btn variant="accent" onClick={append} disabled={b.length >= 7}>
          b.append({Math.max(...b) + 1})
        </Btn>
        <Btn onClick={() => choose(scenario)}>Скинути</Btn>
      </ControlBar>
      <div className="grid grid-cols-2 gap-2 px-5 pb-3">
        <Verdict label="a == b" value={eq} hint="однакові значення?" />
        <Verdict label="a is b" value={alias} hint="той самий об'єкт?" />
      </div>
      <Console
        lines={[
          <span key="1">a = [1, 2, 3]</span>,
          <span key="2">{scen.code}</span>,
          ...(appends > 0 ? [<span key="3">b.append(…)  <span className="text-[#8e8e93]"># ×{appends}</span></span>] : []),
          <span key="4">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>print(a, b)
          </span>,
          <span key="5" className="text-[#ffd60a]">
            {repr(a)} {repr(b)}
          </span>,
          ...(selected
            ? [
                <span key="6" className="text-[#8e8e93]">
                  # клік: id({selected === "A" ? (alias ? "a) == id(b" : "a") : "b"}) → {FAKE_ID[selected]}
                </span>,
              ]
            : []),
          <span key="7" className="text-[#8e8e93]">
            # {alias
              ? "обидва імені — ярлики одного списку: зміна через b видна через a"
              : `${pyBool(eq)} для ==, але a is b → False: це різні об'єкти`}
          </span>,
        ]}
      />
    </div>
  );
}

function Verdict({ label, value, hint }: { label: string; value: boolean; hint: string }) {
  const color = value ? "#248a3d" : "#d70015";
  return (
    <div
      className="flex items-center justify-between rounded-[14px] px-3 py-2"
      style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, border: `1px solid color-mix(in oklab, ${color} 35%, transparent)` }}
    >
      <div>
        <div className="font-mono text-[14px] font-bold">{label}</div>
        <div className="text-[11px] text-label-2">{hint}</div>
      </div>
      <span className="font-mono text-[15px] font-extrabold" style={{ color }}>
        {value ? "True" : "False"}
      </span>
    </div>
  );
}
