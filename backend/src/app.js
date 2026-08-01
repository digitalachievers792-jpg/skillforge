const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const { csrfProtection } = require('./middleware/csrf');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const reviewRoutes = require('./routes/reviews');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const forumRoutes = require('./routes/forum');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');
const instructorRoutes = require('./routes/instructor');

const app = express();

app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
          },
        }
      : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [process.env.CLIENT_URL || 'http://localhost:5173'];
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', apiLimiter);

app.use(csrfProtection);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'SkillForge API is healthy', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);

app.get('/', (req, res) => res.json({ success: true, name: 'SkillForge API', docs: '/api/health' }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
