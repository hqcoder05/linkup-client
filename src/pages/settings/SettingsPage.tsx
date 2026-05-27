import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/format';

type SettingsValues = { fullName: string };

export function SettingsPage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine });
  const form = useForm<SettingsValues>({ values: { fullName: profile.data?.user.fullName ?? '' } });
  const mutation = useMutation({
    mutationFn: (values: SettingsValues) => profileApi.update(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="p-4">
        <h1 className="text-xl font-bold text-slate-950">Account settings</h1>
        <p className="text-sm text-slate-500">Manage basic account information used across LinkUp.</p>
      </Card>
      <Card className="p-4">
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Full name</span>
            <input className="input-field" {...form.register('fullName', { minLength: 2 })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input className="input-field" value={profile.data?.user.email ?? ''} disabled />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Joined</span>
            <input className="input-field" value={formatDate(profile.data?.user.createdAt)} disabled />
          </label>
          <div className="flex items-center justify-between">
            <p className={mutation.isSuccess ? 'text-sm text-emerald-700' : 'text-sm text-slate-500'}>
              {mutation.isSuccess ? 'Saved successfully.' : 'Email cannot be changed.'}
            </p>
            <Button disabled={mutation.isPending}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
