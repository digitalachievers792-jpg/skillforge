const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const apiUrl = (url) => {
  if (!url || !API_ORIGIN) return url;
  return url.startsWith('/') ? API_ORIGIN + url : url;
};
