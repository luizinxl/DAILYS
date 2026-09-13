import React from 'react';
import { motion, Variants } from 'framer-motion';

export type LogoProps = {
  size?: 'sm' | 'lg';
  className?: string;
  showWordmark?: boolean;
};

const sizeClasses = {
  sm: {
    container: 'h-8',
    icon: 'w-6 h-6',
    wordmark: 'h-4 ml-3',
  },
  lg: {
    container: 'h-24 flex-col gap-6',
    icon: 'w-16 h-16',
    wordmark: 'h-8 mt-2',
  },
};

const SplitRingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="-2 -2 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ minWidth: '1em', minHeight: '1em', overflow: 'visible' }}
  >
    <path
      d="M10.5 2.5 A9.5 9.5 0 0 0 10.5 21.5"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="butt"
    />
    <path
      d="M13.5 2.5 A9.5 9.5 0 0 1 13.5 21.5"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="butt"
    />
  </svg>
);

const WordmarkSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 114 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible' }}
  >
    {/* M */}
    <path 
      d="M 2 21 L 2 3 L 11 13 L 20 3 L 20 21" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
    />
    
    {/* O (Split Ring - idêntico ao ícone, cortes verticais) */}
    <path 
      d="M 34.5 3.5 A 8.5 8.5 0 0 0 34.5 20.5" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="butt" 
    />
    <path 
      d="M 37.5 3.5 A 8.5 8.5 0 0 1 37.5 20.5" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="butt" 
    />
    
    {/* D */}
    <path 
      d="M 52 21 L 52 3 L 60 3 A 9 9 0 0 1 60 21 L 52 21" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
    />
    
    {/* U */}
    <path 
      d="M 76 3 L 76 14 A 7 7 0 0 0 90 14 L 90 3" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
    />
    
    {/* S */}
    <path 
      d="M 111 3 L 103 3 A 4.5 4.5 0 0 0 103 12 L 105 12 A 4.5 4.5 0 0 1 105 21 L 97 21" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = 'sm', className, showWordmark = true }) => {
  const isLarge = size === 'lg';
  const classes = sizeClasses[size];

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.6 },
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
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${classes.container} ${className || ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Icon */}
      {(!showWordmark || isLarge || showWordmark) && (
        <motion.div variants={iconVariants} className="flex-shrink-0 text-white">
          <SplitRingIcon className={classes.icon} />
        </motion.div>
      )}

      {/* Wordmark Customizado em SVG */}
      {showWordmark && (
        <motion.div variants={textVariants} className="text-white flex-shrink-0 flex items-center">
          <WordmarkSVG className={classes.wordmark} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Logo;
