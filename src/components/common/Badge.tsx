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
        'inline-block px-3 py-1 rounded-full text-xs font-semibold border',
        'bg-[#1A2244] text-[#B8BFCC] border-[#2A3355]',
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
