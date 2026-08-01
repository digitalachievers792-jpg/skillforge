const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const makeFilter = (allowed) => (req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, `File type not allowed (${file.originalname}).`));
  }
  cb(null, true);
};

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: makeFilter(ALLOWED_IMAGE_TYPES),
});

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: makeFilter(ALLOWED_RESUME_TYPES),
});

module.exports = { uploadImage, uploadResume };
