import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { apiMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      setError(apiMessage(err, 'Registration failed'));
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-lift">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join LinkUp and start professional conversations.</p>
        </div>
        <Card className="p-5">
          {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <input className="input-field" placeholder="Full name" autoComplete="name" {...form.register('fullName')} />
            <input className="input-field" placeholder="Email" type="email" autoComplete="email" {...form.register('email')} />
            <div className="grid gap-3 sm:grid-cols-2">
              {(['password', 'confirmPassword'] as const).map((field) => (
                <div className="relative" key={field}>
                  <input
                    className="input-field pr-10"
                    placeholder={field === 'password' ? 'Password' : 'Confirm password'}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...form.register(field)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-slate-500"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
            <label className="flex items-start gap-2 text-sm text-slate-500">
              <input type="checkbox" required className="mt-1 rounded border-slate-300" /> I agree to the terms and policy.
            </label>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={form.formState.isSubmitting}>
              <UserPlus className="h-4 w-4" /> Register
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-700">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
