"use client";

import { cn } from "@/lib/utils";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

export function FloatingDock({
  items,
  desktopClassName,
}: {
  items: { title: string; icon: React.ReactNode }[];
  desktopClassName?: string;
}) {
  const { reducedMotion } = usePerfProfile();
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="relative h-fit flex items-center justify-center pointer-events-auto">
      <motion.div
        onMouseMove={(e) => mouseX.set(reducedMotion ? Infinity : e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "flex flex-wrap gap-2 md:gap-3 h-16 items-end rounded-2xl bg-secondary/40 dark:bg-black/50 border border-border/50 px-4 pb-3",
          desktopClassName
        )}
      >
        {items.map((item) => (
          <IconContainer mouseX={mouseX} key={item.title} {...item} />
        ))}
      </motion.div>
    </div>
  );
}

function IconContainer({
  mouseX,
  title,
  icon,
}: {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
}) {
  const { reducedMotion } = usePerfProfile();
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-140, 0, 140], [40, 70, 40]);
  const heightTransform = useTransform(distance, [-140, 0, 140], [40, 70, 40]);
  const widthTransformIcon = useTransform(distance, [-140, 0, 140], [20, 34, 20]);
  const heightTransformIcon = useTransform(distance, [-140, 0, 140], [20, 34, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      style={{ width: reducedMotion ? 40 : width, height: reducedMotion ? 40 : height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="aspect-square rounded-full bg-background/80 border border-border/60 flex items-center justify-center relative"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            className="px-2 py-0.5 whitespace-pre rounded-md bg-popover border border-border text-popover-foreground absolute left-1/2 -bottom-8 w-fit text-xs shadow-sm z-20"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: reducedMotion ? 20 : widthIcon, height: reducedMotion ? 20 : heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </motion.div>
  );
}
