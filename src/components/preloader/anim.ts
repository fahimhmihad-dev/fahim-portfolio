export const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.85,
    transition: { duration: 0.9, delay: 0.15 },
  },
};

export const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100dvh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.15 },
  },
};
