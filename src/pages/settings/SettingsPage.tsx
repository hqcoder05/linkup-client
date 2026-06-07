import { Save, Globe, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { profileApi } from '@/api/profile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/format';

type SettingsValues = { fullName: string };

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.mine });
  
  const form = useForm<SettingsValues>({ 
    values: { fullName: profile.data?.user.fullName ?? '' } 
  });
  
  const mutation = useMutation({
    mutationFn: (values: SettingsValues) => profileApi.update(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  // Class chuẩn Tailwind cho các ô input (Thay thế cho "input-field" cũ)
  const inputStyles = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[15px] font-medium text-slate-900 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-['Inter',_sans-serif]">
      
      {/* --- Tiêu đề trang --- */}
      <div className="mb-8">
        <h1 className="font-['Plus_Jakarta_Sans',_sans-serif] text-3xl font-bold text-slate-900">
          {t('settings.title', 'Account settings')}
        </h1>
        <p className="mt-2 text-[15px] text-slate-500">
          {t('settings.subtitle', 'Manage basic account information used across LinkUp.')}
        </p>
      </div>

      {/* --- KHỐI 1: NGÔN NGỮ --- */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe className="h-5 w-5 text-slate-500" />
          <h2 className="font-['Plus_Jakarta_Sans',_sans-serif] text-lg font-bold text-slate-900">
            {t('settings.language_region', 'Language & Region')}
          </h2>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="language-select" className="text-[14px] font-medium text-slate-600">
            {t('settings.select_language', 'Select your preferred language')}
          </label>
          <select
            id="language-select"
            value={i18n.language}
            onChange={handleLanguageChange}
            className="mt-1 w-full max-w-sm cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[15px] font-medium text-slate-900 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="en">English (US)</option>
            <option value="vi">Tiếng Việt (Việt Nam)</option>
          </select>
        </div>
      </Card>

      {/* --- KHỐI 2: THÔNG TIN CÁ NHÂN --- */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-slate-500" />
          <h2 className="font-['Plus_Jakarta_Sans',_sans-serif] text-lg font-bold text-slate-900">
            {t('settings.profile_info', 'Profile Information')}
          </h2>
        </div>

        <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <label className="block">
            <span className="mb-1 block text-[14px] font-medium text-slate-700">
              {t('settings.full_name', 'Full name')}
            </span>
            <input className={inputStyles} {...form.register('fullName', { minLength: 2 })} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[14px] font-medium text-slate-700">
              {t('settings.email', 'Email')}
            </span>
            <input className={inputStyles} value={profile.data?.user.email ?? ''} disabled />
          </label>

          <label className="block">
            <span className="mb-1 block text-[14px] font-medium text-slate-700">
              {t('settings.joined', 'Joined')}
            </span>
            <input className={inputStyles} value={formatDate(profile.data?.user.createdAt)} disabled />
          </label>

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className={mutation.isSuccess ? 'text-[14px] font-medium text-emerald-600' : 'text-[14px] text-slate-500'}>
              {mutation.isSuccess 
                ? t('settings.saved_success', 'Saved successfully.') 
                : t('settings.email_readonly', 'Email cannot be changed.')}
            </p>
            <Button disabled={mutation.isPending || !form.formState.isDirty}>
              <Save className="h-4 w-4" /> {t('settings.save_btn', 'Save')}
            </Button>
          </div>
        </form>
      </Card>
      
    </div>
  );
}