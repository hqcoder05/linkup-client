import {
  Bell,
  Camera,
  ChevronDown,
  HelpCircle,
  Info,
  Lock,
  Mail,
  Save,
  Shield,
  UserCircle,
} from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiMessage } from '@/api/client';
import { profileApi } from '@/api/profile';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/format';
import type { UpdateProfileRequest } from '@/types/api';

type SettingsValues = Required<Pick<UpdateProfileRequest, 'fullName'>> &
  Omit<UpdateProfileRequest, 'fullName'>;

type SectionId = 'account' | 'notifications' | 'privacy' | 'security' | 'support';

const sections: Array<{ id: SectionId; labelKey: string; icon: typeof UserCircle }> = [
  { id: 'account', labelKey: 'common.account', icon: UserCircle },
  { id: 'notifications', labelKey: 'common.notifications', icon: Bell },
  { id: 'privacy', labelKey: 'common.privacy', icon: Lock },
  { id: 'security', labelKey: 'common.security', icon: Shield },
  { id: 'support', labelKey: 'common.support', icon: HelpCircle },
];

const inputStyles =
  'w-full rounded-lg border-0 bg-slate-100 px-4 py-3 text-[15px] text-slate-950 outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:text-slate-500';

const cardTitle = 'text-lg font-semibold text-slate-950';
const mockSettings = {
  phoneNumber: '+84 901 234 567',
  birthMonth: 'June',
  birthDay: '15',
  birthYear: '1998',
};

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionId>('account');
  const [contentVisibility, setContentVisibility] = useState(true);
  const [autoplayVideos, setAutoplayVideos] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const queryClient = useQueryClient();
  const sessionUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const profile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine, retry: false });
  const user = profile.data?.user ?? sessionUser;

  const form = useForm<SettingsValues>({
    defaultValues: {
      fullName: '',
      nickname: '',
      headline: '',
      bio: '',
      location: '',
      websiteUrl: '',
      privateAccount: false,
    },
  });

  const resetForm = () => {
    form.reset({
      fullName: user?.fullName ?? '',
      nickname: profile.data?.nickname ?? '',
      headline: profile.data?.headline ?? '',
      bio: profile.data?.bio ?? '',
      location: profile.data?.location ?? '',
      websiteUrl: profile.data?.websiteUrl ?? '',
      privateAccount: user?.privateAccount ?? false,
    });
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data, user]);

  const updateProfile = useMutation({
    mutationFn: (values: SettingsValues) =>
      profileApi.update({
        fullName: values.fullName.trim(),
        nickname: values.nickname?.trim() || undefined,
        headline: values.headline?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        location: values.location?.trim() || undefined,
        websiteUrl: values.websiteUrl?.trim() || undefined,
        privateAccount: values.privateAccount,
      }),
    onSuccess: (updatedProfile) => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      setUser(updatedProfile.user);
      form.reset({
        fullName: updatedProfile.user.fullName ?? '',
        nickname: updatedProfile.nickname ?? '',
        headline: updatedProfile.headline ?? '',
        bio: updatedProfile.bio ?? '',
        location: updatedProfile.location ?? '',
        websiteUrl: updatedProfile.websiteUrl ?? '',
        privateAccount: updatedProfile.user.privateAccount ?? false,
      });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value);
  };

  const watchedBio = form.watch('bio') ?? '';
  const watchedPrivateAccount = form.watch('privateAccount');

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 font-['Inter',_sans-serif] sm:-mx-6 sm:px-6">
      <div className="mx-auto grid max-w-[1080px] gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card className="sticky top-24 rounded-xl p-2">
            <nav className="space-y-1">
              {sections.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={
                      active
                        ? 'flex w-full items-center gap-3 rounded-lg bg-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-950'
                        : 'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950'
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card className="hidden rounded-xl bg-black p-4 text-white shadow-sm lg:block">
            <h2 className="text-sm font-bold">{t('settings.personalize')}</h2>
            <p className="mt-3 text-xs leading-5 text-slate-300">{t('settings.personalize_text')}</p>
            <button
              type="button"
              className="mt-4 h-9 w-full rounded-full bg-white text-xs font-semibold text-black transition-colors hover:bg-slate-100"
            >
              {t('settings.go_premium')}
            </button>
          </Card>
        </aside>

        <main className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {activeSection === 'account'
                ? t('settings.title')
                : t('settings.section_title', {
                    section: t(sections.find((item) => item.id === activeSection)?.labelKey ?? 'common.account'),
                  })}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              {activeSection === 'account' ? t('settings.subtitle') : t('settings.section_pending')}
            </p>
          </div>

          {profile.isError && (
            <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {apiMessage(profile.error, t('settings.profile_load_error'))}
            </Card>
          )}

          {activeSection === 'account' ? (
            <form className="space-y-6" onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}>
              <Card className="rounded-xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className={cardTitle}>{t('settings.profile_information')}</h2>
                  <Info className="h-5 w-5 text-slate-400" />
                </div>

                <div className="grid gap-6 sm:grid-cols-[92px_minmax(0,1fr)]">
                  <div className="relative h-24 w-24">
                    <Avatar user={user} size="xl" />
                    <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm">
                      <Camera className="h-4 w-4" />
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) uploadAvatar.mutate(file);
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-5">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.display_name')}</span>
                      <input className={inputStyles} autoComplete="name" {...form.register('fullName', { minLength: 2 })} />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.bio')}</span>
                      <textarea
                        className={`${inputStyles} min-h-24 resize-y leading-6`}
                        maxLength={1000}
                        placeholder={t('settings.bio_placeholder')}
                        {...form.register('bio')}
                      />
                      <span className="mt-1 block text-right text-xs text-slate-400">
                        {t('settings.characters', { count: watchedBio.length, max: 1000 })}
                      </span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="rounded-xl p-6">
                <h2 className={cardTitle}>{t('settings.personal_details')}</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.email_address')}</span>
                    <div className="relative">
                      <input className={`${inputStyles} pr-11`} value={user?.email ?? ''} disabled />
                      <Mail className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.nickname')}</span>
                    <input className={inputStyles} autoComplete="nickname" {...form.register('nickname')} />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.phone_number')}</span>
                    <input className={inputStyles} defaultValue={mockSettings.phoneNumber} />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.headline')}</span>
                    <input className={inputStyles} {...form.register('headline')} />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.location')}</span>
                    <input className={inputStyles} autoComplete="address-level2" {...form.register('location')} />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('common.website')}</span>
                    <input className={inputStyles} type="url" autoComplete="url" {...form.register('websiteUrl')} />
                  </label>

                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.date_of_birth')}</span>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[mockSettings.birthMonth, mockSettings.birthDay, mockSettings.birthYear].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className="flex h-12 items-center justify-between rounded-lg bg-slate-100 px-4 text-left text-[15px] text-slate-950"
                        >
                          {value}
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-xl p-6">
                <h2 className={cardTitle}>{t('settings.account_preferences')}</h2>
                <div className="mt-6 divide-y divide-slate-100">
                  <div className="flex items-center justify-between gap-6 py-4 first:pt-0">
                    <div>
                      <h3 className="font-medium text-slate-950">{t('common.language')}</h3>
                      <p className="mt-1 text-sm text-slate-600">{t('settings.language_body')}</p>
                    </div>
                    <select
                      value={i18n.language}
                      onChange={handleLanguageChange}
                      className="rounded-lg border-0 bg-slate-100 px-4 py-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="en">English (US)</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between gap-6 py-4">
                    <span>
                      <span className="block font-medium text-slate-950">{t('settings.content_visibility')}</span>
                      <span className="mt-1 block text-sm text-slate-600">{t('settings.content_visibility_body')}</span>
                    </span>
                    <input className="sr-only" type="checkbox" checked={contentVisibility} onChange={(event) => setContentVisibility(event.target.checked)} />
                    <MockToggle checked={contentVisibility} />
                  </label>

                  <label className="flex items-center justify-between gap-6 py-4">
                    <span>
                      <span className="block font-medium text-slate-950">{t('settings.autoplay_videos')}</span>
                      <span className="mt-1 block text-sm text-slate-600">{t('settings.autoplay_videos_body')}</span>
                    </span>
                    <input className="sr-only" type="checkbox" checked={autoplayVideos} onChange={(event) => setAutoplayVideos(event.target.checked)} />
                    <MockToggle checked={autoplayVideos} />
                  </label>

                  <label className="flex items-center justify-between gap-6 py-4">
                    <span>
                      <span className="block font-medium text-slate-950">{t('settings.private_account')}</span>
                      <span className="mt-1 block text-sm text-slate-600">{t('settings.private_account_body')}</span>
                    </span>
                    <input className="sr-only" type="checkbox" {...form.register('privateAccount')} />
                    <MockToggle checked={Boolean(watchedPrivateAccount)} />
                  </label>

                  <div className="flex items-center justify-between gap-6 py-4">
                    <div>
                      <h3 className="font-medium text-slate-950">{t('common.joined')}</h3>
                      <p className="mt-1 text-sm text-slate-600">{formatDate(user?.createdAt) || t('common.unavailable')}</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                      {user?.role ?? 'USER'}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-xl border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-red-700">{t('settings.danger_zone')}</h2>
                    <p className="mt-2 text-sm text-slate-700">{t('settings.danger_body')}</p>
                  </div>
                  <Button type="button" variant="danger" disabled className="rounded-full border border-red-300 bg-transparent px-7 text-red-600 hover:bg-transparent">
                    {t('settings.manage_account')}
                  </Button>
                </div>
              </Card>

              <div className="flex justify-end gap-3 pb-10">
                <Button type="button" variant="secondary" className="rounded-full px-8" onClick={resetForm}>
                  {t('common.cancel_changes')}
                </Button>
                <Button
                  className="rounded-full bg-black px-9 text-white hover:bg-slate-800"
                  disabled={updateProfile.isPending || !form.formState.isDirty}
                >
                  <Save className="h-4 w-4" />
                  {updateProfile.isPending ? t('common.saving') : t('common.save_changes')}
                </Button>
              </div>

              {updateProfile.isError && (
                <p className="text-sm text-red-600">{apiMessage(updateProfile.error, t('settings.could_not_save'))}</p>
              )}
            </form>
          ) : (
            <MockSection
              section={activeSection}
              emailNotifications={emailNotifications}
              pushNotifications={pushNotifications}
              onEmailNotificationsChange={setEmailNotifications}
              onPushNotificationsChange={setPushNotifications}
            />
          )}
        </main>
      </div>

      <footer className="mx-auto mt-12 flex max-w-[1080px] flex-col gap-4 border-t border-slate-200 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-950">{t('settings.footer_brand')}</span>
          <span>{t('settings.footer_rights')}</span>
        </div>
        <div className="flex gap-6">
          {[t('common.privacy'), t('common.terms'), 'Cookies', t('common.accessibility')].map((item) => (
            <a key={item} href="#" className="hover:text-slate-950">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function MockToggle({ checked }: { checked: boolean }) {
  return (
    <span className={checked ? 'relative h-7 w-12 rounded-full bg-black transition' : 'relative h-7 w-12 rounded-full bg-slate-300 transition'}>
      <span className={checked ? 'absolute right-1 top-1 h-5 w-5 rounded-full bg-white transition' : 'absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition'} />
    </span>
  );
}

function MockSection({
  section,
  emailNotifications,
  pushNotifications,
  onEmailNotificationsChange,
  onPushNotificationsChange,
}: {
  section: SectionId;
  emailNotifications: boolean;
  pushNotifications: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onPushNotificationsChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();

  if (section === 'notifications') {
    return (
      <Card className="rounded-xl p-6">
        <h2 className={cardTitle}>{t('settings.mock_notifications_title')}</h2>
        <div className="mt-6 divide-y divide-slate-100">
          <label className="flex items-center justify-between gap-6 py-4 first:pt-0">
            <span>
              <span className="block font-medium text-slate-950">{t('settings.email_notifications')}</span>
              <span className="mt-1 block text-sm text-slate-600">{t('settings.email_notifications_body')}</span>
            </span>
            <input className="sr-only" type="checkbox" checked={emailNotifications} onChange={(event) => onEmailNotificationsChange(event.target.checked)} />
            <MockToggle checked={emailNotifications} />
          </label>
          <label className="flex items-center justify-between gap-6 py-4">
            <span>
              <span className="block font-medium text-slate-950">{t('settings.push_notifications')}</span>
              <span className="mt-1 block text-sm text-slate-600">{t('settings.push_notifications_body')}</span>
            </span>
            <input className="sr-only" type="checkbox" checked={pushNotifications} onChange={(event) => onPushNotificationsChange(event.target.checked)} />
            <MockToggle checked={pushNotifications} />
          </label>
        </div>
      </Card>
    );
  }

  const content = {
    privacy: {
      title: t('settings.privacy_controls'),
      rows: ['Profile discoverability', 'Follower approval', 'Search engine indexing'],
    },
    security: {
      title: t('settings.security_title'),
      rows: ['Password change', 'Two-factor authentication', 'Active sessions'],
    },
    support: {
      title: t('settings.support_title'),
      rows: ['Help center', 'Report a problem', 'Contact support'],
    },
    account: {
      title: t('common.account'),
      rows: [],
    },
    notifications: {
      title: t('common.notifications'),
      rows: [],
    },
  }[section];

  return (
    <Card className="rounded-xl p-6">
      <h2 className={cardTitle}>{content.title}</h2>
      <div className="mt-6 divide-y divide-slate-100">
        {content.rows.map((row) => (
          <div key={row} className="flex items-center justify-between gap-6 py-4 first:pt-0">
            <span className="font-medium text-slate-950">{row}</span>
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              {t('common.configure')}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
