import { Check, Search, UserMinus, UserPlus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { connectionsApi } from '@/api/connections';
import { profileApi } from '@/api/profile';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { displayName } from '@/utils/format';

export function ConnectionsPage() {
  const [keyword, setKeyword] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ['user-search', keyword],
    queryFn: () => profileApi.searchUsers(keyword),
    enabled: keyword.trim().length > 0,
  });
  const incoming = useQuery({ queryKey: ['incoming-connections'], queryFn: connectionsApi.incoming });
  const outgoing = useQuery({ queryKey: ['outgoing-connections'], queryFn: connectionsApi.outgoing });
  const connected = useQuery({
    queryKey: ['my-connections', currentUser?.id],
    queryFn: () => connectionsApi.list(currentUser!.id),
    enabled: Boolean(currentUser),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['incoming-connections'] });
    void queryClient.invalidateQueries({ queryKey: ['outgoing-connections'] });
    void queryClient.invalidateQueries({ queryKey: ['my-connections'] });
    void queryClient.invalidateQueries({ queryKey: ['user-search'] });
  };
  const request = useMutation({ mutationFn: connectionsApi.request, onSuccess: refresh });
  const accept = useMutation({ mutationFn: connectionsApi.accept, onSuccess: refresh });
  const decline = useMutation({ mutationFn: connectionsApi.decline, onSuccess: refresh });
  const remove = useMutation({ mutationFn: connectionsApi.remove, onSuccess: refresh });

  const relation = (id: number) => {
    if (id === currentUser?.id) return 'me';
    if (connected.data?.some((user) => user.id === id)) return 'connected';
    if (outgoing.data?.some((item) => item.addressee.id === id)) return 'pending';
    if (incoming.data?.some((item) => item.requester.id === id)) return 'incoming';
    return 'none';
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold text-slate-950">Find people</h1>
        <p className="text-sm text-slate-500">Search by name or email, then connect using the backend request flow.</p>
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input-field pl-9" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Name or email" />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-slate-900">Search results</h2>
          <div className="grid gap-3">
            {(users.data ?? []).map((user) => {
              const state = relation(user.id);
              return (
                <div key={user.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar user={user} size="lg" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{displayName(user)}</div>
                      <div className="truncate text-sm text-slate-500">{user.email}</div>
                    </div>
                  </Link>
                  {state === 'connected' && (
                    <Button variant="secondary" onClick={() => remove.mutate(user.id)}>
                      <UserMinus className="h-4 w-4" /> Connected
                    </Button>
                  )}
                  {state === 'pending' && <Button variant="secondary">Pending</Button>}
                  {state === 'incoming' && (
                    <Button onClick={() => accept.mutate(user.id)}>
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                  )}
                  {state === 'none' && (
                    <Button onClick={() => request.mutate(user.id)}>
                      <UserPlus className="h-4 w-4" /> Connect
                    </Button>
                  )}
                </div>
              );
            })}
            {keyword && users.data?.length === 0 && <p className="text-sm text-slate-500">No matching users.</p>}
            {!keyword && <p className="text-sm text-slate-500">Enter a keyword to start searching.</p>}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold text-slate-900">Incoming requests</h2>
            <div className="mt-3 space-y-2">
              {(incoming.data ?? []).map((item) => (
                <div key={item.requester.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{displayName(item.requester)}</span>
                  <div className="flex gap-1">
                    <button className="btn-ghost text-brand-600" onClick={() => accept.mutate(item.requester.id)}>
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="btn-ghost text-red-600" onClick={() => decline.mutate(item.requester.id)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {incoming.data?.length === 0 && <p className="text-sm text-slate-500">No incoming requests.</p>}
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="font-semibold text-slate-900">Connections</h2>
            <p className="mt-1 text-sm text-slate-500">{connected.data?.length ?? 0} people in your network.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
