import React from 'react';
import { motion, Variants } from 'framer-motion';

// Font import in index.html should use a geometric sans-serif like 'Outfit', 'Space Grotesk' or 'Syncopate',
// but we'll use Inter/system defaults with some styling to make it look futuristic.

export type LogoProps = {
  size?: 'sm' | 'lg';
  className?: string;
  showWordmark?: boolean; // Controls if "MODUS" text is shown
};

const sizeClasses = {
  sm: {
    container: 'h-8',
    icon: 'w-6 h-6',
    text: 'text-xl',
  },
  lg: {
    container: 'h-16 flex-col gap-4',
    icon: 'w-16 h-16',
    text: 'text-5xl mt-2',
  },
};

// SVG component for the split ring (used both as standalone icon and the 'O' in MODUS)
const SplitRingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ minWidth: '1em', minHeight: '1em' }}
  >
    {/* Left half of the ring */}
    <path
      d="M10 2.5 A9.5 9.5 0 0 0 10 21.5"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="square"
    />
    {/* Right half of the ring */}
    <path
      d="M14 2.5 A9.5 9.5 0 0 1 14 21.5"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="square"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = 'sm', className, showWordmark = true }) => {
  const isLarge = size === 'lg';
  const classes = sizeClasses[size];

  // For the large (splash) version, we animate the icon first, then fade in the text.
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.8 },
    },
  };

  const iconVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -45 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { type: 'spring', damping: 15, stiffness: 100 } 
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${classes.container} ${className || ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* If it's small, the icon is left of the wordmark. If large, it's above. */}
      {(!showWordmark || isLarge) && (
        <motion.div variants={iconVariants}>
          <SplitRingIcon className={classes.icon} />
        </motion.div>
      )}

      {showWordmark && (
        <motion.div
          variants={textVariants}
          className={`flex items-center font-bold tracking-[0.2em] text-white ${classes.text}`}
          style={{ fontFamily: "'Space Grotesk', 'Syncopate', sans-serif" }}
        >
          {/* Custom M */}
          <span style={{ letterSpacing: '0.15em' }}>M</span>
          {/* The O is replaced by the icon */}
          <SplitRingIcon className="mx-1.5 h-[0.8em] w-[0.8em] mb-[0.05em]" />
          <span>DUS</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Logo;
