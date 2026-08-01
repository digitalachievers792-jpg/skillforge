const mongoose = require('mongoose');

const getBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'sfiles' });

const saveFile = (file) =>
  new Promise((resolve, reject) => {
    if (!file || !file.buffer) return reject(new Error('No file data.'));
    const bucket = getBucket();
    const stream = bucket.openUploadStream(file.originalname || 'file', {
      contentType: file.mimetype || 'application/octet-stream',
    });
    stream.on('finish', () => resolve(`/api/uploads/${stream.id}`));
    stream.on('error', reject);
    stream.end(file.buffer);
  });

const deleteFile = async (url) => {
  if (!url || !url.startsWith('/api/uploads/')) return;
  const id = url.replace('/api/uploads/', '');
  if (!mongoose.Types.ObjectId.isValid(id)) return;
  try {
    await getBucket().delete(new mongoose.Types.ObjectId(id));
  } catch {
    /* file already gone */
  }
};

const streamFile = async (res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const bucket = getBucket();
  const [meta] = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).limit(1).toArray();
  if (!meta) return false;
  res.setHeader('Content-Type', meta.contentType || 'application/octet-stream');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${String(meta.filename || 'file').replace(/["\r\n]/g, '')}"`
  );
  bucket.openDownloadStream(meta._id).pipe(res);
  return true;
};

module.exports = { saveFile, deleteFile, streamFile };
