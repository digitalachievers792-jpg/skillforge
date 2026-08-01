const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const paginate = (page = 1, limit = 12) => {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  return { page: p, limit: l, skip: (p - 1) * l };
};

const makeSlug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const randomToken = (bytes = 32) => require('crypto').randomBytes(bytes).toString('hex');

const sha256 = (value) => require('crypto').createHash('sha256').update(String(value)).digest('hex');

const formatMoney = (amount, currency = '$') => (amount ? `${currency}${Number(amount).toLocaleString()}` : 'Free');

module.exports = { escapeRegex, paginate, makeSlug, randomToken, sha256, formatMoney };
