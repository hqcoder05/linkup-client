import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      {/* Container linh hoạt tự động căn giữa form Auth theo cả 2 chiều */}
      <main className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
}