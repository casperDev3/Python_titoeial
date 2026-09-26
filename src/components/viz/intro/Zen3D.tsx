"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Btn, ControlBar, Scene3D, useThemeColors } from "../kit";

const ZEN: [string, string][] = [
  ["Beautiful is better than ugly.", "Красиве краще за потворне."],
  ["Explicit is better than implicit.", "Явне краще за неявне."],
  ["Simple is better than complex.", "Просте краще за складне."],
  ["Complex is better than complicated.", "Складне краще за заплутане."],
  ["Flat is better than nested.", "Пласке краще за вкладене."],
  ["Sparse is better than dense.", "Розріджене краще за щільне."],
  ["Readability counts.", "Читабельність має значення."],
  ["Special cases aren't special enough to break the rules.", "Особливі випадки не настільки особливі, щоб порушувати правила."],
  ["Although practicality beats purity.", "Хоча практичність важливіша за чистоту."],
  ["Errors should never pass silently.", "Помилки ніколи не мають замовчуватися."],
  ["Unless explicitly silenced.", "Хіба що їх явно заглушили."],
  ["In the face of ambiguity, refuse the temptation to guess.", "Зіткнувшись із неоднозначністю, не піддавайся спокусі вгадати."],
  ["There should be one-- and preferably only one --obvious way to do it.", "Має існувати один — і бажано лише один — очевидний спосіб зробити це."],
  ["Although that way may not be obvious at first unless you're Dutch.", "Хоча спершу він може бути неочевидним, якщо ти не голландець (жарт про Ґвідо)."],
  ["Now is better than never.", "Зараз краще, ніж ніколи."],
  ["Although never is often better than *right* now.", "Хоча ніколи часто краще, ніж *просто зараз* (не поспішай)."],
  ["If the implementation is hard to explain, it's a bad idea.", "Якщо реалізацію важко пояснити — це погана ідея."],
  ["If the implementation is easy to explain, it may be a good idea.", "Якщо реалізацію легко пояснити — можливо, це гарна ідея."],
  ["Namespaces are one honking great idea -- let's do more of those!", "Простори імен — чудова ідея, давайте робити їх більше!"],
];

const N = ZEN.length;
const R = 3.1;

function Scroll({ i, active, onPick }: { i: number; active: boolean; onPick: () => void }) {
  const c = useThemeColors();
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const a = (i / N) * Math.PI * 2;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = active ? 1.35 : hover ? 1.12 : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 9, dt));
    const lift = active ? 0.35 : 0;
    g.position.y = THREE.MathUtils.damp(g.position.y, lift + Math.sin(state.clock.elapsedTime + i * 0.7) * 0.05, 6, dt);
  });

  const color = i % 3 === 0 ? c.accent2 : c.accent;

  return (
    <group rotation={[0, -a + Math.PI / 2, 0]} position={[Math.cos(a) * R, 0, Math.sin(a) * R]}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        <RoundedBox args={[0.62, 1.15, 0.07]} radius={0.05} smoothness={3}>
          <meshPhysicalMaterial
            color={active ? c.accent : "#ffffff"}
            transmission={active ? 0.2 : 0.5}
            thickness={0.6}
            roughness={0.2}
            clearcoat={1}
            transparent
            opacity={active ? 0.95 : 0.85}
            emissive={color}
            emissiveIntensity={active ? 0.25 : 0}
          />
        </RoundedBox>
        {/* «Стрижні» сувою */}
        {[0.6, -0.6].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.76, 12]} />
            <meshStandardMaterial color={active ? c.accent : color} roughness={0.4} metalness={0.3} />
          </mesh>
        ))}
        <Html center occlude position={[0, 0, 0.06]} distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div className="text-[15px] font-bold tabular-nums" style={{ color: active ? "#fff" : "var(--label)" }}>
            {i + 1}
          </div>
        </Html>
      </group>
    </group>
  );
}

function Ring({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  const w = useThree((s) => s.viewport.width);
  const scale = Math.min(1, w / 8.2);

  // Повертаємо кільце так, щоб активний сувій опинився спереду (до камери, +z)
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const a = (active / N) * Math.PI * 2;
    let target = a - Math.PI / 2;
    // найкоротший шлях повороту
    const cur = g.rotation.y;
    target = cur + ((((target - cur) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    g.rotation.y = THREE.MathUtils.damp(cur, target, 4, dt);
  });

  return (
    <group scale={scale}>
      <group ref={ref}>
        {ZEN.map((_, i) => (
          <Scroll key={i} i={i} active={i === active} onPick={() => setActive(i)} />
        ))}
      </group>
      <Core />
    </group>
  );
}

/** Центральна «печатка» — символ Листя з простих фігур. */
function Core() {
  const c = useThemeColors();
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.6;
  });
  return (
    <group>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <torusGeometry args={[0.75, 0.06, 16, 80, Math.PI * 1.7]} />
        <meshStandardMaterial color={c.accent} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial color={c.accent2} transmission={0.6} roughness={0.1} thickness={1} />
      </mesh>
    </group>
  );
}

export function Zen3D() {
  const [active, setActive] = useState(6);
  const [en, ua] = ZEN[active];

  return (
    <div>
      <Scene3D height={320} camera={[0, 2.6, 7.2]} fov={46}>
        <Ring active={active} setActive={setActive} />
      </Scene3D>
      <ControlBar>
        <Btn onClick={() => setActive((a) => (a - 1 + N) % N)}>
          <span className="inline-flex items-center gap-1">
            <ChevronLeft className="size-4" strokeWidth={1.75} />
            Назад
          </span>
        </Btn>
        <Btn variant="accent" onClick={() => setActive((a) => (a + 1) % N)}>
          <span className="inline-flex items-center gap-1">
            Далі
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </span>
        </Btn>
        <span className="ml-auto font-mono text-[13px] text-label-2 tabular-nums">
          {active + 1} / {N}
        </span>
      </ControlBar>
      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="glass !rounded-[18px] px-4 py-3"
          >
            <div className="font-mono text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>
              {en}
            </div>
            <div className="mt-1 text-[15px] leading-snug">{ua}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
