import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ReactNode } from 'react';

type Variant = 'default' | 'academic' | 'financial' | 'household' | 'personal';

const borders: Record<Variant, string> = {
  default: '',
  academic: 'border-l-4 border-l-[#6366F1]',
  financial: 'border-l-4 border-l-[#10B981]',
  household: 'border-l-4 border-l-[#A855F7]',
  personal: 'border-l-4 border-l-[#7C5CFC]',
};

export function Card({
  children,
  variant = 'default',
  className,
  onClick,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={onClick ? { y: -2, transition: { duration: 0.18 } } : undefined}
      onClick={onClick}
      className={clsx(
        'bg-[#161924] border border-[#222634] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)] transition-all duration-200',
        borders[variant],
        onClick && 'cursor-pointer hover:border-[#32384C] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export default Card;
