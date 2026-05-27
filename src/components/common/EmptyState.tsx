import type { ReactNode } from 'react';

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-slate-500">
      <div className="mb-3 text-slate-300">{icon}</div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm">{text}</p>
    </div>
  );
}
