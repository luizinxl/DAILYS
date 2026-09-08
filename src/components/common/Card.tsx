import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ReactNode } from 'react';

type Variant = 'default' | 'academic' | 'financial' | 'household' | 'personal';

const borders: Record<Variant, string> = {
  default: '',
  academic: 'border-l-4 border-l-[#1C64EF]',
  financial: 'border-l-4 border-l-[#2ECC71]',
  household: 'border-l-4 border-l-[#9B59B6]',
  personal: 'border-l-4 border-l-[#7080FE]',
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={clsx(
        'bg-[#161D3A] border border-[#2A3355] rounded-xl p-5',
        borders[variant],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export default Card;
