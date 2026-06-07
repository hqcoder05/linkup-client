import { LogOut, Menu, Settings, User } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/feed', label: 'Feed' },
  { to: '/connections', label: 'Connections' },
  { to: '/network', label: 'Network' },
  { to: '/chat', label: 'Messages' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-300/40 bg-[#f7f9fb]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 md:px-10">

        {/* Left Side: Logo & Links */}
        <div className="flex items-center gap-12">
          {/* Logo "LinkUp" màu đen nguyên bản */}
          <Link to={user ? '/feed' : '/'} className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-tight text-black">
            LinkUp
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'cursor-pointer text-base font-medium transition-all active:scale-95',
                    isActive
                      ? 'border-b-2 border-black pb-1 text-black'
                      : 'text-slate-500 hover:text-black'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right Side: Auth / User Menu */}
        <div
          className={clsx(
            'absolute left-0 right-0 top-[80px] border-b border-slate-200 bg-white px-6 pb-6 shadow-lg lg:static lg:flex lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
            open ? 'block' : 'hidden lg:flex'
          )}
        >
          {user ? (
            /* --- STATE: LOGGED IN --- */
            <>
              {/* Mobile Links (Only visible on small screens) */}
              <div className="flex flex-col gap-4 pt-4 lg:hidden">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'text-base font-medium transition-all active:scale-95',
                        isActive ? 'font-bold text-black' : 'text-slate-500'
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              {/* User Dropdown */}
              <div className="relative mt-4 border-t border-slate-100 pt-4 lg:mt-0 lg:border-0 lg:pt-0">
                <button
                  onClick={() => setUserOpen((value) => !value)}
                  className="flex w-full items-center gap-3 rounded-full border border-transparent transition-colors hover:opacity-80 lg:w-auto"
                >
                  <Avatar user={user} size="sm" />
                  <span className="max-w-[120px] truncate text-sm font-medium text-slate-700 lg:hidden xl:block">
                    {/* Thêm dấu ? để fix lỗi "user is possibly null" */}
                    {user?.fullName || 'User'}
                  </span>
                </button>

                {userOpen && (
                  <div className="mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl lg:absolute lg:right-0 lg:top-full lg:mt-4 lg:w-56 lg:transform">
                    <div className="flex flex-col p-1">
                      <Link
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-black"
                        to="/profile/me"
                        onClick={() => setUserOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-black"
                        to="/settings"
                        onClick={() => setUserOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <div className="my-1 h-px bg-slate-100"></div>
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        onClick={onLogout}
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* --- STATE: LOGGED OUT --- */
            <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:pt-0">
              <Link
                to="/login"
                className="text-base font-medium text-slate-600 transition-colors hover:text-black active:scale-95"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition-all hover:bg-black/90 active:scale-95"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}