require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    if (process.env.SEED_ON_START === 'true') {
      const { seedIfEmpty } = require('./src/seed/seed');
      await seedIfEmpty();
    }
    app.listen(PORT, () => {
      console.log(`[SkillForge] API running → http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[SkillForge] Failed to start server:', err.message);
    process.exit(1);
  }
})();
