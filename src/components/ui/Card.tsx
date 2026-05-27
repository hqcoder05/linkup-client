import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx('surface-card', className)}>{children}</section>;
}
