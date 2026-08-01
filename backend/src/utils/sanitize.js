const sanitizeHtml = require('sanitize-html');

const RICH_HTML_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'h4', 'span']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    span: ['class', 'style'],
    '*': ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowedStyles: { '*': { color: [/^#(0x)?[0-9a-f]+$/i], 'text-align': [/^left$/, /^right$/, /^center$/] } },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
};

const sanitizeRichText = (value) => {
  if (!value) return '';
  return sanitizeHtml(String(value), RICH_HTML_OPTIONS).trim();
};

const sanitizePlainText = (value, maxLength = 5000) => {
  if (value === undefined || value === null) return '';
  return String(value).replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
};

module.exports = { sanitizeRichText, sanitizePlainText };
