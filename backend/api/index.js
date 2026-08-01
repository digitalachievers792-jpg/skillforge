/* Vercel serverless entry — @vercel/node supports exporting an Express app
   directly, so no serverless-http adapter is needed (v4 dropped Vercel support).
   The same app runs locally via `node server.js` unchanged. */
const app = require('../src/app');

if (process.env.SEED_ON_START === 'true') {
  require('../src/seed/seed')
    .seedIfEmpty()
    .catch((e) => console.error('[seed] failed:', e.message));
}

module.exports = app;
