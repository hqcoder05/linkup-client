export function initials(name?: string | null) {
  const value = name?.trim() || 'User';
  return value.charAt(0).toUpperCase();
}

export function displayName(user?: { fullName?: string | null; email?: string | null }) {
  return user?.fullName || user?.email || 'LinkUp member';
}

export function formatDate(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
