import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { connectionsApi } from '@/api/connections';
import { postsApi } from '@/api/posts';
import { profileApi } from '@/api/profile';
import { Card } from '@/components/ui/Card';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePostGrid } from '@/components/profile/ProfilePostGrid';
import { useAuthStore } from '@/stores/authStore';

export function ProfilePage({ me = false }: { me?: boolean }) {
  const [editing, setEditing] = useState(false);
  const params = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const userId = me ? currentUser?.id : Number(params.id);
  const queryClient = useQueryClient();

  const myProfile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine, enabled: me });
  const publicUser = useQuery({
    queryKey: ['users', userId],
    queryFn: () => profileApi.user(userId!),
    enabled: !me && Boolean(userId),
  });
  const posts = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: () => postsApi.byUser(userId!),
    enabled: Boolean(userId),
  });
  const connections = useQuery({
    queryKey: ['connections', userId],
    queryFn: () => connectionsApi.list(userId!),
    enabled: Boolean(userId),
  });
  const status = useQuery({
    queryKey: ['connection-status', userId],
    queryFn: () => connectionsApi.status(userId!),
    enabled: !me && Boolean(userId),
  });
  const connect = useMutation({
    mutationFn: () => connectionsApi.request(userId!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['connection-status', userId] }),
  });

  const user = useMemo(() => (me ? myProfile.data?.user : publicUser.data), [me, myProfile.data, publicUser.data]);
  if (!user) return <Card className="p-4 text-sm text-slate-500">Loading profile...</Card>;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <ProfileHeader
        profile={myProfile.data}
        user={user}
        postsCount={posts.data?.length ?? 0}
        connectionsCount={connections.data?.length ?? 0}
        isMe={me}
        onEdit={() => setEditing(true)}
        onConnect={() => connect.mutate()}
        connectionStatus={status.data?.status}
      />
      {editing && <ProfileEditor profile={myProfile.data} onClose={() => setEditing(false)} />}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Posts</div>
        <ProfilePostGrid posts={posts.data ?? []} />
      </Card>
    </div>
  );
}
