/* Vercel serverless entry — diagnostic wrapper.
   @vercel/node 5.x calls a function export as (req, res) with a real
   http.IncomingMessage, so an Express app can be invoked directly.
   The first request on each fresh instance awaits the seed (SEED_ON_START)
   so Vercel does not freeze the instance before seeding completes.
   GET /__diag returns deployment diagnostics (password masked). */
const mongoose = require('mongoose');

let app = null;
let loadError = null;
try {
  app = require('../src/app');
} catch (e) {
  loadError = (e && e.stack) || String(e);
}

let mongoError = null;
mongoose.connection.on('error', (e) => {
  mongoError = e && e.message;
});
mongoose.connection.on('connected', () => {
  mongoError = null;
});

let seedPromise = null;
let seedError = null;
if (process.env.SEED_ON_START === 'true') {
  seedPromise = require('../src/seed/seed')
    .seedIfEmpty()
    .catch((e) => {
      seedError = (e && e.stack) || String(e);
      console.error('[seed] failed:', e.message);
    });
}

module.exports = async (req, res) => {
  res.setHeader('content-type', 'application/json');  if (req.url && req.url.startsWith('/__diag')) {
    const uri = process.env.MONGODB_URI || '';
    const masked = uri.replace(/\/\/[^@/]+@/, '//***:***@');
    return res.end(
      JSON.stringify(
        {
          success: true,
          node: process.version,
          mongoReadyState: mongoose.connection.readyState,
          mongoUri: masked,
          mongoError,
          seedOnStart: process.env.SEED_ON_START === 'true',
          clientUrl: process.env.CLIENT_URL || null,
          seedError,
        },
        null,
        2
      )
    );
  }
  if (seedPromise) {
    await seedPromise;
    seedPromise = null;
  }
  if (!app) {
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ success: false, error: 'MODULE LOAD FAILED', detail: loadError })
    );
  }
  try {
    app(req, res);
  } catch (e) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        success: false,
        error: 'APP INVOCATION ERROR',
        detail: (e && e.stack) || String(e),
      })
    );
  }
};

module.exports.config = { maxDuration: 60 };
