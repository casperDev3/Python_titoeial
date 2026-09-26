"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Плавна поява блоку при прокрутці (spring, один раз). */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ type: "spring", stiffness: 140, damping: 22, delay }}
    >
      {children}
    </motion.div>
  );
}
