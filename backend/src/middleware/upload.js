const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const storage = multer.memoryStorage();

const makeFilter = (allowed) => (req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, `File type not allowed (${file.originalname}).`));
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: makeFilter(ALLOWED_IMAGE_TYPES),
});

const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: makeFilter(ALLOWED_RESUME_TYPES),
});

const saveUploadedFile = (file, folder) => {
  if (!file) throw new ApiError(400, 'No file uploaded.');
  const dir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXTENSIONS[file.mimetype] || ''}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/${folder}/${filename}`;
};

const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const filePath = path.join(UPLOAD_ROOT, fileUrl.replace('/uploads/', ''));
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    /* ignore delete errors */
  }
};

module.exports = { uploadImage, uploadResume, saveUploadedFile, deleteUploadedFile, UPLOAD_ROOT };
