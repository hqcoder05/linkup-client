import { Bell, Home, LogOut, Menu, MessageSquare, Search, Settings, User, Users } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2 text-xl font-extrabold text-brand-600">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-500 text-white">in</span>
          <span>LinkUp</span>
        </Link>

        <button className="btn-ghost lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <div
          className={clsx(
            'absolute left-0 right-0 top-16 border-b border-slate-200 bg-white px-4 pb-4 lg:static lg:flex lg:items-center lg:gap-6 lg:border-0 lg:p-0',
            open ? 'block' : 'hidden lg:flex',
          )}
        >
          {user ? (
            <>
              <div className="flex flex-col gap-1 lg:flex-row lg:items-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-brand-600',
                          isActive && 'bg-brand-50 text-brand-700',
                        )
                      }
                      end={item.to === '/'}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
              <div className="relative mt-3 lg:mt-0">
                <button
                  onClick={() => setUserOpen((value) => !value)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 lg:w-auto"
                >
                  <Avatar user={user} size="sm" />
                  <span className="max-w-36 truncate text-sm font-semibold text-slate-700">{user.fullName}</span>
                </button>
                {userOpen && (
                  <div className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lift lg:absolute lg:right-0 lg:w-56">
                    <Link className="btn-ghost w-full justify-start" to="/profile/me">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link className="btn-ghost w-full justify-start" to="/settings">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button className="btn-ghost w-full justify-start text-red-600" onClick={onLogout}>
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-3 flex flex-col gap-2 lg:mt-0 lg:flex-row">
              <NavLink to="/" className="btn-ghost">
                <Search className="h-4 w-4" /> Home
              </NavLink>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
