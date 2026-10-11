import type { Transition, Variants } from 'framer-motion';

// Shared motion language: one easing curve, three durations.
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.15, base: 0.25, slow: 0.4 } as const;

export const spring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const stagger = (delay = 0.06): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
});
