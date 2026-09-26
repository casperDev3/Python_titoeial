"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Плавний перехід між уроками. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 160, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
