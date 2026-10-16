"use client";

// Adapted from Eldora UI "Blur In Text" (shadcn registry @eldoraui/blur-in-text):
// sized as our page title, merges classes with cn, and skips the animation for reduced motion.
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const variants = {
  hidden: { filter: "blur(8px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

export function BlurInText({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.h1
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={variants}
      className={cn("text-2xl font-semibold tracking-tight", className)}
    >
      {text}
    </motion.h1>
  );
}
