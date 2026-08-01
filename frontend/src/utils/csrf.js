const CSRF_COOKIE = 'csrfToken';

export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const getCsrfToken = () => getCookie(CSRF_COOKIE) || '';

export const setCookie = (name, value, days = 1) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}; SameSite=Lax`;
};
