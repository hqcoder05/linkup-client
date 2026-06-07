import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {children}
    </section>
  );
}