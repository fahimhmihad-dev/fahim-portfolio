"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { opacity, slideUp } from "./anim";
import { usePreloader } from ".";

export default function Loader() {
  const { loadingPercent } = usePreloader();
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setDimension({ width: window.innerWidth, height: window.innerHeight });
    const frame = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, []);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
    dimension.width / 2
  } ${dimension.height + 300} 0 ${dimension.height} L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
    dimension.width / 2
  } ${dimension.height} 0 ${dimension.height} L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.25 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="fixed left-0 top-0 h-dvh w-dvw flex items-end justify-end px-8 sm:px-14 pb-8 z-[1200] bg-background"
    >
      {dimension.width > 0 && (
        <>
          <motion.p
            variants={opacity}
            initial="initial"
            animate="enter"
            className="relative z-10 flex items-center text-foreground font-display font-bold text-5xl sm:text-7xl"
          >
            {(loadingPercent - (loadingPercent % 5)).toFixed(0)} %
          </motion.p>
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: "calc(100% + 300px)" }}
          >
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
              style={{ fill: "hsl(var(--background))" }}
            />
          </svg>
        </>
      )}
    </motion.div>
  );
}
