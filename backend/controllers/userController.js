const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { uploadToCloudinary } = require('../config/cloudinary');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (req.file) updateData.avatar = await uploadToCloudinary(req.file.path, 'blogsphere/avatars');

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const blogs = await Blog.find({ author: userId });
    const blogIds = blogs.map((blog) => blog._id);
    await Comment.deleteMany({ blog: { $in: blogIds } });
    await Blog.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, deleteProfile };