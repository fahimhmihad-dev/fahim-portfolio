"use client";

import styles from "./style.module.scss";
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
    <motion.div variants={slideUp} initial="initial" exit="exit" className={styles.introduction}>
      {dimension.width > 0 && (
        <>
          <motion.p variants={opacity} initial="initial" animate="enter">
            {(loadingPercent - (loadingPercent % 5)).toFixed(0)} %
          </motion.p>
          <svg>
            <motion.path variants={curve} initial="initial" exit="exit" />
          </svg>
        </>
      )}
    </motion.div>
  );
}
