/**
 * Variants d'animation pour les transitions entre étapes du workflow
 */
export const stepVariants = {
  initial: {
    opacity: 0,
    x: 50,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.98
  }
};

/**
 * Configuration de transition pour les étapes
 */
export const stepTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] // Cubic bezier pour un effet smooth
};

/**
 * Variants pour les éléments qui apparaissent en cascade (stagger)
 */
export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItemVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
    }
  }
};

/**
 * Variants pour les cards/sections
 */
export const cardVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
};


