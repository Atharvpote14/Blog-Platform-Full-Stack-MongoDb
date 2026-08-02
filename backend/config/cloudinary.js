const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUDINARY_CLOUD_NAME' &&
    process.env.CLOUDINARY_API_KEY !== 'YOUR_CLOUDINARY_API_KEY' &&
    process.env.CLOUDINARY_API_SECRET !== 'YOUR_CLOUDINARY_API_SECRET'
  );
};

const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    console.log(
      'Cloudinary not configured. Files will be stored locally in /uploads.'
    );
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Cloudinary configured successfully');
};

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

const saveBufferLocally = (buffer, originalname) => {
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const ext = originalname ? path.extname(originalname) : '';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `uploads/${filename}`;
};

const uploadToCloudinary = async (buffer, options = {}) => {
  const folder = options.folder || 'blogsphere';

  if (!isCloudinaryConfigured()) {
    return saveBufferLocally(buffer, options.originalname);
  }

  try {
    return await uploadBufferToCloudinary(buffer, folder);
  } catch (error) {
    console.error(`Cloudinary upload failed: ${error.message}`);
    return saveBufferLocally(buffer, options.originalname);
  }
};

module.exports = { configureCloudinary, uploadToCloudinary, isCloudinaryConfigured };
