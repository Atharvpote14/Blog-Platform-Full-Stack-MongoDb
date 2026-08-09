const express = require('express');
const path = require('path');
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  createComment,
} = require('../controllers/blogController');
const { protect, optional } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { body } = require('express-validator');
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', optional, getBlogs);
router.get('/:id', optional, getBlogById);

router.post(
  '/',
  protect,
  upload.single('coverImage'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('visibility')
      .optional()
      .isIn(['public', 'private'])
      .withMessage('Visibility must be public or private'),
  ],
  validate,
  createBlog
);

router.put(
  '/:id',
  protect,
  upload.single('coverImage'),
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('content')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('category').optional().trim(),
    body('visibility')
      .optional()
      .isIn(['public', 'private'])
      .withMessage('Visibility must be public or private'),
  ],
  validate,
  updateBlog
);

router.post('/:id/like', protect, likeBlog);

router.post(
  '/:id/comments',
  protect,
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Comment text is required')
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
  ],
  validate,
  createComment
);

router.delete('/:id', protect, deleteBlog);

module.exports = router;