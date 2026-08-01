const cloudinary = require('cloudinary').v2;
const fs = require('fs');

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

const toForwardSlashPath = (filePath) => (filePath ? filePath.replace(/\\/g, '/') : filePath);

const uploadToCloudinary = async (filePath, folder = 'blogsphere') => {
  if (!isCloudinaryConfigured()) {
    return toForwardSlashPath(filePath);
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload failed: ${error.message}`);
    return toForwardSlashPath(filePath);
  }
};

module.exports = { configureCloudinary, uploadToCloudinary, isCloudinaryConfigured };