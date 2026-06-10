import { Bell, Heart, LogOut, Menu, MessageCircle, Search, Settings, User, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { notificationsApi } from '@/api/notifications';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime } from '@/utils/format';
import { createChatClient, subscribeToNotifications } from '@/websocket/chatSocket';
import type { NotificationDto } from '@/types/api';

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { user, logout } = useAuthStore();
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
    const client = createChatClient(() => {
      subscribeToNotifications(client, user.id, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md font-['Inter',_sans-serif]">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-8">
          <Link to={user ? '/feed' : '/'} className="font-['Plus_Jakarta_Sans',_sans-serif] text-[22px] font-bold tracking-tight text-slate-900">
            LinkUp
          </Link>
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
              <div className="hidden items-center gap-5 md:flex">
                <form onSubmit={onSearch} className="hidden h-10 w-[260px] items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 text-slate-500 xl:flex">
                  <Search className="h-5 w-5 text-slate-900" />
                  <input
                    className="w-full bg-transparent text-[15px] font-medium text-slate-700 outline-none placeholder:text-slate-500"
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
                    className="relative rounded-full p-2 text-slate-800 transition-colors hover:bg-slate-100"
                    onClick={() => setNotificationsOpen((value) => !value)}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                          <h2 className="text-sm font-bold text-slate-950">{t('notifications.title')}</h2>
                          <p className="text-xs text-slate-500">{t('notifications.unread', { count: unreadCount })}</p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-semibold text-slate-600 hover:text-slate-950 disabled:opacity-50"
                          onClick={markAllRead}
                          disabled={!unreadCount || readAllNotifications.isPending}
                        >
                          {t('notifications.mark_all_read')}
                        </button>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto p-2">
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
                            className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <span className={clsx('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', notification.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600')}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                                <span className="block truncate text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </span>
                              </span>
                              <span className="line-clamp-2 text-xs leading-5 text-slate-500">{notification.content}</span>
                              <span className="mt-1 block text-[11px] text-slate-400">
                                {formatDateTime(notification.createdAt)}
                              </span>
                            </span>
                          </Link>
                          );
                        })}
                        {notifications.isLoading && (
                          <p className="px-3 py-6 text-center text-sm text-slate-500">{t('notifications.loading')}</p>
                        )}
                        {notifications.data?.length === 0 && (
                          <p className="px-3 py-6 text-center text-sm text-slate-500">{t('notifications.empty')}</p>
                        )}
                        {notifications.isError && (
                          <p className="px-3 py-6 text-center text-sm text-slate-500">{t('notifications.unavailable')}</p>
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        {t('notifications.view_all')}
                      </Link>
                    </div>
                  )}
                </div>
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
