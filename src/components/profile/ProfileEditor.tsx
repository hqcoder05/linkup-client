import { useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ProfileDto, UpdateProfileRequest } from '@/types/api';

export function ProfileEditor({ profile, onClose }: { profile?: ProfileDto; onClose: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<UpdateProfileRequest>();
  const mutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      onClose();
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.user.fullName,
        nickname: profile.nickname ?? '',
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        websiteUrl: profile.websiteUrl ?? '',
      });
    }
  }, [form, profile]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Edit profile</h2>
        <button onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <input className="input-field" placeholder="Full name" {...form.register('fullName')} />
        <input className="input-field" placeholder="Nickname" {...form.register('nickname')} />
        <input className="input-field" placeholder="Headline" {...form.register('headline')} />
        <textarea className="input-field min-h-24 resize-none" placeholder="Bio" {...form.register('bio')} />
        <input className="input-field" placeholder="Location" {...form.register('location')} />
        <input className="input-field" placeholder="Website URL" {...form.register('websiteUrl')} />
        <Button disabled={mutation.isPending}>
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </form>
    </Card>
  );
}
