/* Vercel serverless entry — diagnostic wrapper.
   @vercel/node 5.x calls a function export as (req, res) with a real
   http.IncomingMessage, so an Express app can be invoked directly.
   This wrapper surfaces any module-load or invocation error in the
   response body so the exact failure is visible without dashboard access. */
let app = null;
let loadError = null;
try {
  app = require('../src/app');
} catch (e) {
  loadError = (e && e.stack) || String(e);
}

if (process.env.SEED_ON_START === 'true') {
  require('../src/seed/seed')
    .seedIfEmpty()
    .catch((e) => console.error('[seed] failed:', e.message));
}

module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
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
