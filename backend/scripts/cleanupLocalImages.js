const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Blog = require('../models/Blog');
const User = require('../models/User');

const cleanupLocalImages = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const blogResult = await Blog.updateMany(
      { coverImage: { $regex: '^uploads/' } },
      { $set: { coverImage: '' } }
    );
    console.log(`Cleared ${blogResult.modifiedCount} blog cover images pointing to local /uploads`);

    const userResult = await User.updateMany(
      { avatar: { $regex: '^uploads/' } },
      { $set: { avatar: '' } }
    );
    console.log(`Cleared ${userResult.modifiedCount} user avatars pointing to local /uploads`);

    console.log('Cleanup complete. New uploads should use Cloudinary URLs.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

cleanupLocalImages();
