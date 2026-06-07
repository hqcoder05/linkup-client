import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { connectionsApi } from '@/api/connections';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { displayName } from '@/utils/format';

export function ConnectionListPage() {
  const user = useAuthStore((state) => state.user);
  const connections = useQuery({
    queryKey: ['my-connections', user?.id],
    queryFn: () => connectionsApi.list(user!.id),
    enabled: Boolean(user),
  });

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <Card className="p-6">
        <h1 className="text-xl font-bold text-slate-900">Your network</h1>
        <div className="mt-6 grid gap-4">
          {(connections.data ?? []).map((item) => (
            <Link key={item.id} to={`/profile/${item.id}`} className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 hover:bg-slate-50 transition">
              <Avatar user={item} size="md" />
              <div>
                <div className="font-medium text-slate-900">{displayName(item)}</div>
                <div className="text-sm text-slate-500">{item.email}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}