import React from 'react';
import { motion, Variants } from 'framer-motion';

// Font import (add to global CSS or index.html):
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');

export type LogoProps = {
  size?: 'sm' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'text-xl', // sidebar compact
  lg: 'text-4xl', // splash / loading screen
};

// 1️⃣ Bounce letters – each letter appears with a slight bounce, staggered.
export const LogoBounce: React.FC<LogoProps> = ({ size = 'sm', className }) => {
  const letters = ['d', 'a', 'i', 'l', 'y', 'S'];
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };
  const child: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          variants={child}
          className={`${sizeClasses[size]} font-extrabold tracking-tight mr-0.5 ${
            ch === 'S' ? 'text-[#7C5CFC]' : 'text-white'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.div>
  );
};

// 2️⃣ Typewriter – simulates a hand‑typing effect using a clipping mask.
export const LogoTypewriter: React.FC<LogoProps> = ({ size = 'sm', className }) => {
  const text = 'dailyS';
  const variants: Variants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: 'auto',
      opacity: 1,
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      <span
        className={`${sizeClasses[size]} font-extrabold tracking-tight`}
        style={{ fontFamily: 'Inter, sans-serif', color: '#fff' }}
      >
        {text.split('').map((c, i) => (
          <span key={i} style={{ color: c === 'S' ? '#7C5CFC' : undefined }}>
            {c}
          </span>
        ))}
      </span>
    </motion.div>
  );
};

// 3️⃣ Fade + slide with a violet glowing "S".
export const LogoFadeGlow: React.FC<LogoProps> = ({ size = 'sm', className }) => {
  const variants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <span
        className={`${sizeClasses[size]} font-extrabold tracking-tight`}
        style={{ fontFamily: 'Inter, sans-serif', color: '#fff' }}
      >
        daily
        <span style={{ color: '#7C5CFC', textShadow: '0 0 8px #7C5CFC' }}>S</span>
      </span>
    </motion.div>
  );
};

// Default export – currently maps to the bounce variant. Change if you prefer another.
// New neon drawing variant – simulates hand‑drawn stroke with neon glow.
const LogoDraw: React.FC<LogoProps> = ({ size = 'sm', className }) => {
  // Size mapping to SVG viewBox scale
  const fontSize = size === 'lg' ? 120 : 80;
  // Adjust viewBox with extra margin for neon glow and prevent clipping
  const viewBoxWidth = size === 'lg' ? 340 : 140; // extra width for large logo
  const viewBoxHeight = viewBoxWidth / 2; // maintain 2:1 ratio
  const viewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;
  const strokeColor = '#7C5CFC'; // violet neon
  const filterId = 'neonGlow';

  return (
    <div className={className} style={{ display: 'inline-block', padding: '0.5rem', backgroundColor: 'transparent' }}>
      <motion.svg className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        initial="hidden"
        animate="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={strokeColor} floodOpacity="0.6" />
          </filter>
        </defs>
        <motion.text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: `${fontSize}px` }}
          filter={`url(#${filterId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        >
          dailyS
        </motion.text>
      </motion.svg>
    </div>
  );
};

// Default export – now uses the neon drawing variant.
const Logo: React.FC<LogoProps> = (props) => <LogoDraw {...props} />;
export default Logo;
