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
    <Card className="mx-auto max-w-3xl p-4">
      <h1 className="text-xl font-bold text-slate-950">Your network</h1>
      <div className="mt-4 grid gap-3">
        {(connections.data ?? []).map((item) => (
          <Link key={item.id} to={`/profile/${item.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <Avatar user={item} size="lg" />
            <div>
              <div className="font-semibold text-slate-900">{displayName(item)}</div>
              <div className="text-sm text-slate-500">{item.email}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
