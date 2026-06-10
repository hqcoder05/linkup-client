import {
  Bell,
  Camera,
  HelpCircle,
  Image,
  Lock,
  LogOut,
  Mail,
  Save,
  Shield,
  UserCircle,
} from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiMessage } from '@/api/client';
import { profileApi } from '@/api/profile';
import { settingsApi } from '@/api/settings';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatDateTime } from '@/utils/format';
import type {
  AccountSettingsDto,
  ChangePasswordRequest,
  ProfileDto,
  UpdateAccountSettingsRequest,
  UpdateProfileRequest,
} from '@/types/api';
import { validateProfileImage } from '@/utils/mediaValidation';

type ProfileValues = Required<Pick<UpdateProfileRequest, 'fullName'>> &
  Omit<UpdateProfileRequest, 'fullName'>;

type AccountValues = {
  phoneNumber: string;
  dateOfBirth: string;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  autoplayVideoEnabled: boolean;
  contentVisibleToPublic: boolean;
  searchIndexingEnabled: boolean;
  twoFactorEnabled: boolean;
};

type PasswordValues = ChangePasswordRequest & { confirmPassword: string };
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

const accountDefaults: AccountValues = {
  phoneNumber: '',
  dateOfBirth: '',
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  autoplayVideoEnabled: false,
  contentVisibleToPublic: true,
  searchIndexingEnabled: true,
  twoFactorEnabled: false,
};

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionId>('account');
  const [uploadError, setUploadError] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const sessionUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const profile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine, retry: false });
  const settings = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, retry: false });
  const sessions = useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: settingsApi.sessions,
    enabled: activeSection === 'security',
    retry: false,
  });
  const user = profile.data?.user ?? sessionUser;

  const profileForm = useForm<ProfileValues>({
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
  const accountForm = useForm<AccountValues>({ defaultValues: accountDefaults });
  const passwordForm = useForm<PasswordValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const resetProfileForm = () => {
    profileForm.reset({
      fullName: user?.fullName ?? '',
      nickname: profile.data?.nickname ?? '',
      headline: profile.data?.headline ?? '',
      bio: profile.data?.bio ?? '',
      location: profile.data?.location ?? '',
      websiteUrl: profile.data?.websiteUrl ?? '',
      privateAccount: user?.privateAccount ?? false,
    });
  };

  const resetAccountForm = (data?: AccountSettingsDto) => {
    accountForm.reset({
      phoneNumber: data?.phoneNumber ?? '',
      dateOfBirth: data?.dateOfBirth ?? '',
      emailNotificationsEnabled: data?.emailNotificationsEnabled ?? accountDefaults.emailNotificationsEnabled,
      pushNotificationsEnabled: data?.pushNotificationsEnabled ?? accountDefaults.pushNotificationsEnabled,
      autoplayVideoEnabled: data?.autoplayVideoEnabled ?? accountDefaults.autoplayVideoEnabled,
      contentVisibleToPublic: data?.contentVisibleToPublic ?? accountDefaults.contentVisibleToPublic,
      searchIndexingEnabled: data?.searchIndexingEnabled ?? accountDefaults.searchIndexingEnabled,
      twoFactorEnabled: data?.twoFactorEnabled ?? accountDefaults.twoFactorEnabled,
    });
  };

  useEffect(() => {
    resetProfileForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data, user]);

  useEffect(() => {
    resetAccountForm(settings.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.data]);

  const updateProfile = useMutation({
    mutationFn: (values: ProfileValues) =>
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
      profileForm.reset({
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

  const updateSettings = useMutation({
    mutationFn: (values: Partial<AccountValues>) => {
      const input: UpdateAccountSettingsRequest = {
        ...values,
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: values.dateOfBirth || null,
      };
      return settingsApi.update(input);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      resetAccountForm(data);
    },
  });

  const changePassword = useMutation({
    mutationFn: (values: PasswordValues) =>
      settingsApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      passwordForm.reset();
      logout();
      navigate('/login', { replace: true });
    },
  });

  const revokeSession = useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] }),
  });

  const deactivateAccount = useMutation({
    mutationFn: settingsApi.deactivateAccount,
    onSuccess: () => {
      logout();
      navigate('/login', { replace: true });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (media) => {
      if (user) setUser({ ...user, avatarUrl: media.url });
      queryClient.setQueryData<ProfileDto>(['profile', 'me'], (old) =>
        old ? { ...old, user: { ...old.user, avatarUrl: media.url } } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const uploadCover = useMutation({
    mutationFn: profileApi.uploadCover,
    onSuccess: (media) => {
      if (user) setUser({ ...user, coverUrl: media.url });
      queryClient.setQueryData<ProfileDto>(['profile', 'me'], (old) =>
        old ? { ...old, user: { ...old.user, coverUrl: media.url } } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value);
  };

  const handleImageUpload = (file: File | undefined, upload: (file: File) => void) => {
    if (!file) return;
    const message = validateProfileImage(file);
    if (message) {
      setUploadError(message);
      return;
    }
    setUploadError('');
    upload(file);
  };

  const activeLabel = t(sections.find((item) => item.id === activeSection)?.labelKey ?? 'common.account');
  const watchedBio = profileForm.watch('bio') ?? '';
  const watchedPrivateAccount = profileForm.watch('privateAccount');
  const watchedAccount = accountForm.watch();

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 font-['Inter',_sans-serif] sm:-mx-6 sm:px-6">
      <div className="mx-auto grid max-w-[1080px] gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside>
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
        </aside>

        <main className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {activeSection === 'account' ? t('settings.title') : t('settings.section_title', { section: activeLabel })}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              {activeSection === 'account' ? t('settings.subtitle') : sectionSubtitle(activeSection, t)}
            </p>
          </div>

          {(profile.isError || settings.isError) && (
            <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {apiMessage(profile.error ?? settings.error, t('settings.profile_load_error'))}
            </Card>
          )}

          {activeSection === 'account' && (
            <form className="space-y-6" onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}>
              <Card className="overflow-hidden rounded-xl">
                <div className="relative h-44 bg-slate-200">
                  {user?.coverUrl ? (
                    <img src={user.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Image className="h-10 w-10" />
                    </div>
                  )}
                  <label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100">
                    <Camera className="h-4 w-4" />
                    {t('settings.change_cover')}
                    <input
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => {
                        handleImageUpload(event.target.files?.[0], uploadCover.mutate);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h2 className={cardTitle}>{t('settings.profile_information')}</h2>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-[92px_minmax(0,1fr)]">
                    <div className="relative h-24 w-24">
                      <Avatar user={user} size="xl" />
                      <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm">
                        <Camera className="h-4 w-4" />
                        <input
                          className="hidden"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(event) => {
                            handleImageUpload(event.target.files?.[0], uploadAvatar.mutate);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div className="space-y-5">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.display_name')}</span>
                        <input className={inputStyles} autoComplete="name" {...profileForm.register('fullName', { minLength: 2 })} />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.headline')}</span>
                        <input className={inputStyles} {...profileForm.register('headline')} />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.bio')}</span>
                        <textarea
                          className={`${inputStyles} min-h-24 resize-y leading-6`}
                          maxLength={1000}
                          placeholder={t('settings.bio_placeholder')}
                          {...profileForm.register('bio')}
                        />
                        <span className="mt-1 block text-right text-xs text-slate-400">
                          {t('settings.characters', { count: watchedBio.length, max: 1000 })}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {(uploadError || uploadAvatar.isError || uploadCover.isError) && (
                <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {uploadError ||
                    apiMessage(uploadAvatar.error ?? uploadCover.error, t('settings.could_not_save'))}
                </Card>
              )}

              <Card className="rounded-xl p-6">
                <div>
                  <h2 className={cardTitle}>{t('settings.personal_details')}</h2>
                </div>
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
                    <input className={inputStyles} autoComplete="nickname" {...profileForm.register('nickname')} />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.location')}</span>
                    <input className={inputStyles} autoComplete="address-level2" {...profileForm.register('location')} />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('common.website')}</span>
                    <input className={inputStyles} type="url" autoComplete="url" {...profileForm.register('websiteUrl')} />
                  </label>
                </div>
              </Card>

              <Card className="rounded-xl p-6">
                <div>
                  <h2 className={cardTitle}>{t('settings.account_preferences')}</h2>
                </div>
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
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between gap-6 py-4">
                    <span>
                      <span className="block font-medium text-slate-950">{t('settings.private_account')}</span>
                      <span className="mt-1 block text-sm text-slate-600">{t('settings.private_account_body')}</span>
                    </span>
                    <input className="sr-only" type="checkbox" {...profileForm.register('privateAccount')} />
                    <Toggle checked={Boolean(watchedPrivateAccount)} />
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

              {updateProfile.isError && (
                <p className="text-sm text-red-600">{apiMessage(updateProfile.error, t('settings.could_not_save'))}</p>
              )}

              <div className="flex justify-end gap-3 pb-10">
                <Button type="button" variant="secondary" className="rounded-full px-8" onClick={resetProfileForm}>
                  {t('common.cancel_changes')}
                </Button>
                <Button
                  className="rounded-full bg-black px-9 text-white hover:bg-slate-800"
                  disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                >
                  <Save className="h-4 w-4" />
                  {updateProfile.isPending ? t('common.saving') : t('common.save_changes')}
                </Button>
              </div>
            </form>
          )}

          {activeSection === 'notifications' && (
            <SettingsCard
              title={t('settings.notification_preferences')}
              onSave={accountForm.handleSubmit((values) =>
                updateSettings.mutate({
                  emailNotificationsEnabled: values.emailNotificationsEnabled,
                  pushNotificationsEnabled: values.pushNotificationsEnabled,
                }),
              )}
              saving={updateSettings.isPending}
              error={updateSettings.error}
            >
              <SettingToggle
                title={t('settings.email_notifications')}
                body={t('settings.email_notifications_body')}
                checked={watchedAccount.emailNotificationsEnabled}
                registration={accountForm.register('emailNotificationsEnabled')}
              />
              <SettingToggle
                title={t('settings.push_notifications')}
                body={t('settings.push_notifications_body')}
                checked={watchedAccount.pushNotificationsEnabled}
                registration={accountForm.register('pushNotificationsEnabled')}
              />
            </SettingsCard>
          )}

          {activeSection === 'privacy' && (
            <SettingsCard
              title={t('settings.privacy_controls')}
              onSave={accountForm.handleSubmit((values) =>
                updateSettings.mutate({
                  phoneNumber: values.phoneNumber,
                  dateOfBirth: values.dateOfBirth,
                  contentVisibleToPublic: values.contentVisibleToPublic,
                  searchIndexingEnabled: values.searchIndexingEnabled,
                  autoplayVideoEnabled: values.autoplayVideoEnabled,
                }),
              )}
              saving={updateSettings.isPending}
              error={updateSettings.error}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.phone_number')}</span>
                  <input className={inputStyles} autoComplete="tel" {...accountForm.register('phoneNumber')} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.date_of_birth')}</span>
                  <input className={inputStyles} type="date" {...accountForm.register('dateOfBirth')} />
                </label>
              </div>
              <div className="mt-6 divide-y divide-slate-100">
                <SettingToggle
                  title={t('settings.content_visibility')}
                  body={t('settings.content_visibility_body')}
                  checked={watchedAccount.contentVisibleToPublic}
                  registration={accountForm.register('contentVisibleToPublic')}
                />
                <SettingToggle
                  title={t('settings.search_indexing')}
                  body={t('settings.search_indexing_body')}
                  checked={watchedAccount.searchIndexingEnabled}
                  registration={accountForm.register('searchIndexingEnabled')}
                />
                <SettingToggle
                  title={t('settings.autoplay_videos')}
                  body={t('settings.autoplay_videos_body')}
                  checked={watchedAccount.autoplayVideoEnabled}
                  registration={accountForm.register('autoplayVideoEnabled')}
                />
              </div>
            </SettingsCard>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <SettingsCard
                title={t('settings.password_title')}
                onSave={passwordForm.handleSubmit((values) => {
                  if (values.newPassword !== values.confirmPassword) {
                    passwordForm.setError('confirmPassword', { message: t('settings.password_mismatch') });
                    return;
                  }
                  changePassword.mutate(values);
                })}
                saving={changePassword.isPending}
                error={changePassword.error}
                saveLabel={t('settings.change_password')}
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.current_password')}</span>
                    <input className={inputStyles} type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.new_password')}</span>
                    <input className={inputStyles} type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-800">{t('settings.confirm_password')}</span>
                    <input className={inputStyles} type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
                  </label>
                </div>
                {passwordForm.formState.errors.confirmPassword?.message && (
                  <p className="mt-3 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </SettingsCard>

              <SettingsCard
                title={t('settings.security_title')}
                onSave={accountForm.handleSubmit((values) =>
                  updateSettings.mutate({ twoFactorEnabled: values.twoFactorEnabled }),
                )}
                saving={updateSettings.isPending}
                error={updateSettings.error}
              >
                <SettingToggle
                  title={t('settings.two_factor')}
                  body={t('settings.two_factor_body')}
                  checked={watchedAccount.twoFactorEnabled}
                  registration={accountForm.register('twoFactorEnabled')}
                />
              </SettingsCard>

              <Card className="rounded-xl p-6">
                <div>
                  <h2 className={cardTitle}>{t('settings.active_sessions')}</h2>
                </div>
                <div className="mt-5 divide-y divide-slate-100">
                  {sessions.data?.map((session) => (
                    <div key={session.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                      <div>
                        <p className="font-medium text-slate-950">
                          {session.current ? t('settings.current_session') : t('settings.session')}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {t('settings.session_dates', {
                            created: formatDateTime(session.createdAt),
                            expires: formatDateTime(session.expiresAt),
                          })}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={session.current || revokeSession.isPending}
                        onClick={() => revokeSession.mutate(session.id)}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('settings.revoke_session')}
                      </Button>
                    </div>
                  ))}
                  {sessions.isLoading && <p className="py-4 text-sm text-slate-500">{t('settings.loading_sessions')}</p>}
                  {sessions.data?.length === 0 && <p className="py-4 text-sm text-slate-500">{t('settings.no_sessions')}</p>}
                  {sessions.isError && (
                    <p className="py-4 text-sm text-red-600">{apiMessage(sessions.error, t('settings.sessions_unavailable'))}</p>
                  )}
                </div>
              </Card>

              <Card className="rounded-xl border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-red-700">{t('settings.danger_zone')}</h2>
                    <p className="mt-2 text-sm text-slate-700">{t('settings.danger_body')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deactivateAccount.isPending}
                    className="rounded-full px-7"
                    onClick={() => {
                      if (window.confirm(t('settings.deactivate_confirm'))) deactivateAccount.mutate();
                    }}
                  >
                    {t('settings.manage_account')}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'support' && (
            <Card className="rounded-xl p-6">
              <div>
                <h2 className={cardTitle}>{t('settings.support_title')}</h2>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
                {t('settings.support_pending_body')}
              </p>
            </Card>
          )}
        </main>
      </div>

      <footer className="mx-auto mt-12 flex max-w-[1080px] flex-col gap-4 border-t border-slate-200 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-950">{t('settings.footer_brand')}</span>
          <span>{t('settings.footer_rights')}</span>
        </div>
        <div className="flex gap-6">
          {[t('common.privacy'), t('common.terms'), t('common.accessibility')].map((item) => (
            <a key={item} href="#" className="hover:text-slate-950">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function SettingsCard({
  title,
  children,
  onSave,
  saving,
  error,
  saveLabel,
}: {
  title: string;
  children: ReactNode;
  onSave: () => void;
  saving: boolean;
  error: unknown;
  saveLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl p-6">
      <div>
        <h2 className={cardTitle}>{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
      {Boolean(error) && (
        <p className="mt-4 text-sm text-red-600">
          {String(apiMessage(error, String(t('settings.could_not_save'))))}
        </p>
      )}
      <div className="mt-6 flex justify-end">
        <Button type="button" className="rounded-full bg-black px-8 text-white hover:bg-slate-800" disabled={saving} onClick={onSave}>
          <Save className="h-4 w-4" />
          {saving ? t('common.saving') : saveLabel ?? t('common.save_changes')}
        </Button>
      </div>
    </Card>
  );
}

function SettingToggle({
  title,
  body,
  checked,
  registration,
}: {
  title: string;
  body: string;
  checked: boolean;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="flex items-center justify-between gap-6 py-4 first:pt-0">
      <span>
        <span className="block font-medium text-slate-950">{title}</span>
        <span className="mt-1 block text-sm text-slate-600">{body}</span>
      </span>
      <input className="sr-only" type="checkbox" {...registration} />
      <Toggle checked={Boolean(checked)} />
    </label>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <span className={checked ? 'relative h-7 w-12 rounded-full bg-black transition' : 'relative h-7 w-12 rounded-full bg-slate-300 transition'}>
      <span className={checked ? 'absolute right-1 top-1 h-5 w-5 rounded-full bg-white transition' : 'absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition'} />
    </span>
  );
}

function sectionSubtitle(section: SectionId, t: (key: string) => string) {
  if (section === 'notifications') return t('settings.notifications_subtitle');
  if (section === 'privacy') return t('settings.privacy_subtitle');
  if (section === 'security') return t('settings.security_subtitle');
  if (section === 'support') return t('settings.support_subtitle');
  return t('settings.subtitle');
}
