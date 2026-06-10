import { Bell, CheckCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '@/api/notifications';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/utils/format';

export function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list });
  const read = useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const readAll = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => {
      queryClient.setQueryData(
        ['notifications'],
        (old: typeof notifications.data) => old?.map((item) => ({ ...item, read: true })) ?? old,
      );
      queryClient.setQueryData(['notifications-unread'], { unreadCount: 0 });
    },
  });
  const unread = (notifications.data ?? []).filter((item) => !item.read);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{t('notifications.title')}</h1>
          <p className="text-sm text-slate-500">{t('notifications.unread', { count: unread.length })}</p>
        </div>
        <Button variant="secondary" disabled={!unread.length || readAll.isPending} onClick={() => readAll.mutate()}>
          <CheckCircle className="h-4 w-4" /> Mark read
        </Button>
      </Card>
      <Card className="overflow-hidden">
        {(notifications.data ?? []).map((item) => (
          <button
            key={item.id}
            onClick={() => read.mutate(item.id)}
            className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${!item.read ? 'border-l-4 border-l-brand-500 bg-brand-50/40' : ''}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{item.title}</div>
              <p className="text-sm text-slate-600">{item.content}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
            </div>
          </button>
        ))}
        {notifications.data?.length === 0 && <EmptyState icon={<Bell className="h-10 w-10" />} title={t('notifications.empty')} text="" />}
      </Card>
    </div>
  );
}
