export function initials(name?: string | null) {
  const value = name?.trim() || 'User';
  return value.charAt(0).toUpperCase();
}

export function displayName(user?: { fullName?: string | null; email?: string | null }) {
  return user?.fullName || user?.email || 'LinkUp member';
}

export function formatDate(value?: string | null) {
  if (!value) return '';
  const language = localStorage.getItem('linkup-language') || document.documentElement.lang || 'en';
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return '';
  const language = localStorage.getItem('linkup-language') || document.documentElement.lang || 'en';
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
