import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/feed', labelKey: 'navbar.feed' },
  { to: '/connections', labelKey: 'navbar.connections' },
];

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md font-['Inter',_sans-serif]">
      <nav className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-4 sm:px-6 xl:px-0">
        
        <div className="flex items-center gap-8">
          <Link to={user ? '/feed' : '/'} className="font-['Plus_Jakarta_Sans',_sans-serif] text-[22px] font-bold tracking-tight text-slate-900">
            LinkUp
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'cursor-pointer text-[14px] font-medium transition-all hover:text-slate-900',
                    isActive
                      ? 'border-b-2 border-slate-900 pb-1 text-slate-900'
                      : 'text-slate-500'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div
          className={clsx(
            'absolute left-0 right-0 top-16 border-b border-slate-200 bg-white px-6 pb-6 shadow-lg md:static md:flex md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none',
            open ? 'block' : 'hidden md:flex'
          )}
        >
          {user ? (
            <>
              <div className="flex flex-col gap-4 pt-4 md:hidden">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'text-[15px] font-medium transition-all active:scale-95',
                        isActive ? 'font-bold text-slate-900' : 'text-slate-500'
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}
              </div>

              <div className="hidden items-center gap-5 md:flex">
                <label className="hidden h-10 w-[260px] items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 text-slate-500 xl:flex">
                  <Search className="h-5 w-5 text-slate-900" />
                  <input
                    className="w-full bg-transparent text-[15px] font-medium text-slate-700 outline-none placeholder:text-slate-500"
                    placeholder={t('navbar.search')}
                    type="search"
                  />
                </label>
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="rounded-full p-2 text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <Bell className="h-6 w-6" />
                </Link>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="rounded-full p-2 text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <Settings className="h-6 w-6" />
                </Link>
              </div>

              <div className="relative mt-4 border-t border-slate-100 pt-4 md:mt-0 md:border-0 md:pt-0">
                <button
                  onClick={() => setUserOpen((value) => !value)}
                  className="flex w-full items-center gap-3 rounded-full border border-transparent transition-opacity hover:opacity-80 md:w-auto"
                >
                  <Avatar user={user} size="sm" />
                  <span className="max-w-[120px] truncate text-[14px] font-medium text-slate-700 md:hidden xl:block">
                    {user?.fullName || 'User'}
                  </span>
                </button>

                {userOpen && (
                  <div className="mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl md:absolute md:right-0 md:top-full md:mt-4 md:w-56 md:transform">
                    <div className="flex flex-col p-1">
                      <Link className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900" to="/profile/me" onClick={() => setUserOpen(false)}>
                        <User className="h-4 w-4" /> {t('common.profile')}
                      </Link>
                      <Link className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900" to="/settings" onClick={() => setUserOpen(false)}>
                        <Settings className="h-4 w-4" /> {t('common.settings')}
                      </Link>
                      <div className="my-1 h-px bg-slate-100"></div>
                      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50" onClick={onLogout}>
                        <LogOut className="h-4 w-4" /> {t('common.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 md:mt-0 md:flex-row md:items-center md:gap-6 md:border-0 md:pt-0">
              <Link to="/login" className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900" onClick={() => setOpen(false)}>
                {t('common.login')}
              </Link>
              <Link to="/register" className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-slate-800 active:scale-95" onClick={() => setOpen(false)}>
                {t('common.register')}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
