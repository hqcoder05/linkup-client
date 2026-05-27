import { clsx } from 'clsx';
import { displayName, initials } from '@/utils/format';
import type { UserDto } from '@/types/api';

type AvatarProps = {
  user?: Pick<UserDto, 'fullName' | 'email' | 'avatarUrl'> | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-24 w-24 text-3xl',
  };

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={displayName(user)}
        className={clsx('rounded-full object-cover ring-1 ring-slate-200', sizes[size])}
      />
    );
  }

  return (
    <div
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white',
        sizes[size],
      )}
      aria-label={displayName(user ?? undefined)}
    >
      {initials(displayName(user ?? undefined))}
    </div>
  );
}
