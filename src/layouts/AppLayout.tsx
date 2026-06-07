import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 pb-0 pt-28 sm:px-6 lg:pt-36">
        <Outlet />
      </main>
    </div>
  );
}
