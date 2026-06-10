import { Bell, Heart, LogOut, Menu, MessageCircle, Moon, Search, Settings, Sun, User, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { notificationsApi } from '@/api/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { formatDateTime } from '@/utils/format';
import { wsManager } from '@/websocket/wsManager';
import { subscribeToNotifications } from '@/websocket/chatSocket';
import type { NotificationDto } from '@/types/api';

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsRef = useRef<HTMLDivElement>(null);

  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: Boolean(user),
    retry: false,
  });

  const unreadCount = notifications.data?.filter((item) => !item.read).length ?? 0;
  const setNotificationsRead = () => {
    queryClient.setQueryData<NotificationDto[]>(['notifications'], (old) =>
      old?.map((item) => ({ ...item, read: true })) ?? old,
    );
    queryClient.setQueryData(['notifications-unread'], { unreadCount: 0 });
  };

  const readNotification = useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
  const readAllNotifications = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: setNotificationsRead,
  });

  const markAllRead = () => {
    readAllNotifications.mutate();
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    wsManager.activate(() => {
      const client = wsManager.getClient();
      const sub = subscribeToNotifications(client, user.id, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });
      return () => sub.unsubscribe();
    });
  }, [queryClient, user?.id]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };
  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    if (keyword) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}&tab=posts`);
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl font-['Inter',_sans-serif] dark:border-white/10 dark:bg-black/80">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-8">
          <Link to={user ? '/feed' : '/'} className="font-['Plus_Jakarta_Sans',_sans-serif] text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
            LinkUp
          </Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 dark:text-slate-400 dark:hover:bg-white/10"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div
          className={clsx(
            'absolute left-0 right-0 top-16 border-b border-slate-100 bg-white px-6 pb-6 shadow-lg md:static md:flex md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:border-white/10 dark:bg-black md:dark:bg-transparent',
            open ? 'block' : 'hidden md:flex'
          )}
        >
          {user ? (
            <>
              <div className="hidden items-center gap-5 md:flex">
                <form onSubmit={onSearch} className="hidden h-10 w-[260px] items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-4 text-slate-500 xl:flex dark:border-white/10 dark:bg-neutral-900 dark:text-slate-400">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-600"
                    placeholder={t('navbar.search')}
                    type="search"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                  />
                </form>
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                    onClick={() => setNotificationsOpen((value) => !value)}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[380px] overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl dark:border-white/10 dark:bg-black dark:backdrop-blur-2xl">
                      <div className="flex items-center justify-between px-6 py-5">
                        <div>
                          <h2 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">{t('notifications.title')}</h2>
                          <p className="mt-0.5 text-[11px] font-bold text-slate-400">{t('notifications.unread', { count: unreadCount })}</p>
                        </div>
                        <button
                          type="button"
                          className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 disabled:opacity-50 dark:hover:text-white"
                          onClick={markAllRead}
                          disabled={!unreadCount || readAllNotifications.isPending}
                        >
                          {t('notifications.mark_all_read')}
                        </button>
                      </div>
                      <div className="max-h-[380px] overflow-y-auto px-2 pb-2">
                        {notifications.data?.slice(0, 7).map((notification) => {
                          const Icon = notificationIcon(notification.type);
                          return (
                          <Link
                            key={notification.id}
                            to={notificationRoute(notification)}
                            onClick={() => {
                              if (!notification.read) readNotification.mutate(notification.id);
                              setNotificationsOpen(false);
                            }}
                            className="group flex gap-3 rounded-2xl px-4 py-3 transition-all hover:bg-slate-50 dark:hover:bg-white/10"
                          >
                            <span className={clsx('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all group-hover:scale-110', notification.read ? 'bg-slate-100 text-slate-400 dark:bg-neutral-900 dark:text-slate-600' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400')}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                {!notification.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                                <span className="block truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {notification.title}
                                </span>
                              </span>
                              <span className="line-clamp-2 mt-0.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">{notification.content}</span>
                              <span className="mt-1.5 block text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                                {formatDateTime(notification.createdAt)}
                              </span>
                            </span>
                          </Link>
                          );
                        })}
                        {notifications.isLoading && (
                          <p className="px-3 py-10 text-center text-xs font-bold text-slate-400 italic">{t('notifications.loading')}</p>
                        )}
                        {notifications.data?.length === 0 && (
                          <p className="px-3 py-10 text-center text-xs font-bold text-slate-400 italic">{t('notifications.empty')}</p>
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        className="block border-t border-slate-50 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        {t('notifications.view_all')}
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}
                  title={theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  <Settings className="h-6 w-6" />
                </Link>
              </div>

              <div className="relative mt-4 border-t border-slate-100 pt-4 md:mt-0 md:border-0 md:pt-0 dark:border-white/10">
                <button
                  onClick={() => setUserOpen((value) => !value)}
                  className="flex w-full items-center gap-3 rounded-full border border-transparent transition-all hover:opacity-80 md:w-auto"
                >
                  <Avatar user={user} size="sm" />
                  <span className="max-w-[120px] truncate text-sm font-bold tracking-tight text-slate-800 md:hidden xl:block dark:text-slate-200">
                    {user?.fullName || 'User'}
                  </span>
                </button>

                {userOpen && (
                  <div className="mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl md:absolute md:right-0 md:top-full md:mt-4 md:w-60 md:transform dark:border-white/10 dark:bg-black dark:backdrop-blur-2xl">
                    <div className="flex flex-col p-2">
                      <Link className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10 transition-colors" to="/profile/me" onClick={() => setUserOpen(false)}>
                        <User className="h-4 w-4" /> {t('common.profile')}
                      </Link>
                      <Link className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10 transition-colors" to="/settings" onClick={() => setUserOpen(false)}>
                        <Settings className="h-4 w-4" /> {t('common.settings')}
                      </Link>
                      <div className="my-1 h-px bg-slate-100 dark:bg-white/10"></div>
                      <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" onClick={onLogout}>
                        <LogOut className="h-4 w-4" /> {t('common.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 md:mt-0 md:flex-row md:items-center md:gap-6 md:border-0 md:pt-0 dark:border-white/10">
              <Link to="/login" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>
                {t('common.login')}
              </Link>
              <Link to="/register" className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-slate-200" onClick={() => setOpen(false)}>
                {t('common.register')}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

function notificationIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('message')) return MessageCircle;
  if (normalized.includes('follow')) return UserPlus;
  if (normalized.includes('like')) return Heart;
  return Bell;
}

function notificationRoute(notification: NotificationDto) {
  const url = notification.url;
  if (!url) return '/notifications';
  if (url.startsWith('/conversations/')) return url.replace('/conversations/', '/chat/');
  if (url.startsWith('/users/')) return url.replace('/users/', '/profile/');
  if (url.startsWith('/posts/')) return url;
  if (url.startsWith('/post/')) return url.replace('/post/', '/posts/');
  return url.startsWith('/') ? url : '/notifications';
}
