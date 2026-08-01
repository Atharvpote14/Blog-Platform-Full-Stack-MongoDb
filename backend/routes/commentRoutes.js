const express = require('express');
const { deleteComment } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.delete('/:id', protect, deleteComment);

module.exports = router;