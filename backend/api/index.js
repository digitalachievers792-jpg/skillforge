/* Vercel serverless entry — deploy the backend folder as a Vercel project.
   The Express app is exposed through serverless-http; the same code runs
   locally via `node server.js` unchanged. */
const serverless = require('serverless-http');
const app = require('../src/app');

if (process.env.SEED_ON_START === 'true') {
  require('../src/seed/seed')
    .seedIfEmpty()
    .catch((e) => console.error('[seed] failed:', e.message));
}

module.exports = serverless(app);
