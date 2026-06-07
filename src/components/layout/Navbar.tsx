import { Bell, Home, LogOut, Menu, MessageSquare, Settings, User, Users } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/connections', label: 'Search', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/chat', label: 'Messages', icon: MessageSquare },
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white shadow-sm">
            in
          </span>
          <span>LinkUp</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Navigation Content */}
        <div
          className={clsx(
            'absolute left-0 right-0 top-[60px] border-b border-slate-200 bg-white px-6 pb-6 shadow-lg lg:static lg:flex lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
            open ? 'block' : 'hidden lg:flex'
          )}
        >
          {user ? (
            /* --- STATE: LOGGED IN --- */
            <>
              <div className="flex flex-col gap-2 pt-4 lg:flex-row lg:items-center lg:pt-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:scale-95',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        )
                      }
                      end={item.to === '/'}
                      onClick={() => setOpen(false)} // Tự đóng menu mobile khi click
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              {/* User Dropdown */}
              <div className="relative mt-4 border-t border-slate-100 pt-4 lg:mt-0 lg:border-0 lg:pt-0">
                <button
                  onClick={() => setUserOpen((value) => !value)}
                  className="flex w-full items-center gap-3 rounded-full border border-transparent p-1 transition-colors hover:bg-slate-100 lg:w-auto lg:pr-3"
                >
                  <Avatar user={user} size="sm" />
                  <span className="max-w-[120px] truncate text-sm font-medium text-slate-700 lg:hidden xl:block">
                    {user.fullName || 'User'}
                  </span>
                </button>

                {userOpen && (
                  <div className="mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl lg:absolute lg:right-0 lg:top-full lg:mt-3 lg:w-56 lg:transform">
                    <div className="flex flex-col p-1">
                      <Link
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                        to="/profile/me"
                        onClick={() => setUserOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
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
              <NavLink
                to="/"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 active:scale-95"
                onClick={() => setOpen(false)}
              >
                Home
              </NavLink>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 active:scale-95"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
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