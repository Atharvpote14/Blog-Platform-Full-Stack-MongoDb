const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { uploadToCloudinary } = require('../config/cloudinary');

const LIMITS = {
  title: { min: 3, max: 200 },
  category: { min: 1, max: 50 },
  content: { min: 10, maxChars: 50000, maxWords: 10000 },
};

const countWords = (value) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const validateBlogInput = ({ title, content, category }) => {
  const errors = [];

  if (!title || title.trim().length < LIMITS.title.min || title.trim().length > LIMITS.title.max) {
    errors.push(`Title must be between ${LIMITS.title.min} and ${LIMITS.title.max} characters`);
  }

  if (!category || category.trim().length < LIMITS.category.min || category.trim().length > LIMITS.category.max) {
    errors.push(`Category must be between ${LIMITS.category.min} and ${LIMITS.category.max} characters`);
  }

  if (!content || content.trim().length < LIMITS.content.min || content.trim().length > LIMITS.content.maxChars) {
    errors.push(`Content must be between ${LIMITS.content.min} and ${LIMITS.content.maxChars.toLocaleString('en-US')} characters`);
  } else if (countWords(content) > LIMITS.content.maxWords) {
    errors.push(`Content must not exceed ${LIMITS.content.maxWords.toLocaleString('en-US')} words`);
  }

  return errors;
};

const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, visibility = 'public' } = req.body;

    const validationErrors = validateBlogInput({ title, content, category });
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join('. '),
      });
    }

    const coverImage = req.file
      ? await uploadToCloudinary(req.file.path, 'blogsphere/covers')
      : '';

    const blog = await Blog.create({
      title,
      content,
      category,
      visibility,
      coverImage,
      author: req.user._id,
    });

    await blog.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sort,
      page = 1,
      limit = 10,
      author,
      visibility,
    } = req.query;

    const query = {};

    const isOwnAuthor =
      author &&
      req.user &&
      author.toString() === req.user._id.toString();

    if (visibility === 'private') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, please log in',
        });
      }
      if (author && !isOwnAuthor) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view private posts',
        });
      }
      query.author = req.user._id;
      query.visibility = 'private';
    } else if (isOwnAuthor) {
      query.author = req.user._id;
      if (visibility) query.visibility = visibility;
    } else if (author) {
      query.author = author;
      query.visibility = 'public';
    } else {
      query.visibility = visibility || 'public';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name email avatar')
        .populate({
          path: 'comments',
          options: { sort: { createdAt: -1 }, limit: 5 },
          populate: { path: 'author', select: 'name avatar' },
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'name email avatar' },
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const authorId = blog.author._id || blog.author;

    if (
      blog.visibility === 'private' &&
      (!req.user || !authorId.equals(req.user._id))
    ) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const { title, content, category, visibility } = req.body;

    const validationErrors = validateBlogInput({
      title: title ?? blog.title,
      content: content ?? blog.content,
      category: category ?? blog.category,
    });
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join('. '),
      });
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (visibility) updateData.visibility = visibility;
    if (req.file) updateData.coverImage = await uploadToCloudinary(req.file.path, 'blogsphere/covers');

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: not authorized to delete this blog',
      });
    }

    await Comment.deleteMany({ blog: blog._id });
    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const isLiked = blog.likes.includes(req.user._id);

    if (isLiked) {
      blog.likes = blog.likes.filter(
        (like) => like.toString() !== req.user._id.toString()
      );
      await blog.save();
      return res.status(200).json({
        success: true,
        message: 'Like removed',
        data: { likes: blog.likes.length, isLiked: false },
      });
    }

    blog.likes.push(req.user._id);
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog liked',
      data: { likes: blog.likes.length, isLiked: true },
    });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const comment = await Comment.create({
      text,
      author: req.user._id,
      blog: req.params.id,
    });

    await comment.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  createComment,
  deleteComment,
};