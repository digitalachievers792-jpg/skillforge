const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'ValidationError') {
    error = new ApiError(400, 'Validation failed', Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })));
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = new ApiError(409, `Duplicate value for ${field}.`);
  }

  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid id format.');
  }

  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Check the size limit.' : `Upload error: ${err.message}`;
    error = new ApiError(400, message);
  }

  if (err.type === 'entity.parse.failed') {
    error = new ApiError(400, 'Invalid JSON body.');
  }

  if (err.message === 'Not allowed by CORS') {
    error = new ApiError(403, 'Request origin not allowed.');
  }

  if (!error.isOperational) {
    console.error('[SkillForge] Unhandled error:', err);
    // Temporary: surface the real error while live-debugging the deployment.
    error = new ApiError(500, `Internal server error. (${err.message})`);
  }

  const status = error.status || 500;
  const payload = { success: false, message: error.message };
  if (error.details) payload.details = error.details;
  if (status >= 500 && (process.env.NODE_ENV !== 'production' || process.env.DEBUG_ERRORS === 'true')) payload.stack = error.stack;

  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
