import clsx from 'clsx';
import { ReactNode } from 'react';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        'bg-[#1D212F]/80 text-[#D1D5DB] border-[#262B3B]',
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
