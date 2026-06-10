import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Network } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { apiMessage } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

const schema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(120),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = form.handleSubmit(async (formValues) => {
    const values = {
      fullName: formValues.fullName,
      email: formValues.email,
      password: formValues.password,
    };
    setError('');
    try {
      const session = await authApi.register(values);
      setSession(session);
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(apiMessage(err, t('register.error_failed')));
    }
  });

  const inputStyles = "w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-black focus:outline-none focus:ring-0";

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 font-['Inter',_sans-serif]">
      <div className="w-full max-w-[520px] rounded-2xl border border-slate-200/60 bg-white p-10 shadow-sm sm:p-14">

        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center text-black">
            <Network className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans',_sans-serif] text-[28px] font-bold leading-[1.2] text-black sm:text-[32px]">
            {t('register.title')}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            {t('register.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">

          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-medium text-slate-900">{t('register.full_name')}</label>    
            <input
              className={inputStyles}
              placeholder="Eleanor Vance"
              autoComplete="name"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && <span className="mt-1 text-xs text-red-500">{form.formState.errors.fullName.message}</span>}
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-medium text-slate-900">{t('register.email')}</label>        
            <input
              className={inputStyles}
              placeholder="eleanor@consultancy.com"
              type="email"
              autoComplete="email"
              {...form.register('email')}
            />
            {form.formState.errors.email && <span className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</span>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {(['password', 'confirmPassword'] as const).map((field) => (
              <div className="flex flex-col" key={field}>
                <label className="mb-1 text-[13px] font-medium text-slate-900">
                  {field === 'password' ? t('register.password') : t('register.confirm_password')}
                </label>
                <div className="relative">
                  <input
                    className={`${inputStyles} pr-10`}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...form.register(field)}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"   
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors[field] && (
                  <span className="mt-1 text-xs text-red-500">{form.formState.errors[field]?.message}</span>    
                )}
              </div>
            ))}
          </div>

          <label className="mt-6 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
            />
            <span className="text-[13.5px] leading-relaxed text-slate-500">
              {t('register.terms')}
            </span>
          </label>

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-black px-4 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-70"
            disabled={form.formState.isSubmitting}
          >
            {t('register.submit')}
          </button>
        </form>

        <p className="mt-8 text-center text-[14.5px] text-slate-500">
          {t('register.already')}{' '}
          <Link to="/login" className="font-bold text-black transition-opacity hover:opacity-80">
            {t('register.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
