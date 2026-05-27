import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <Outlet />
    </div>
  );
}
