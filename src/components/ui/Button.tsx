import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary:
      'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-400',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow active:scale-95',
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
