import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none',
        className
      )}
    >
      {children}
    </section>
  );
}
