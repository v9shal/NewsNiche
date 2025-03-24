const express = require('express');
const router = express.Router();
const BookMarkController = require('../controllers/article');
const authenticateToken = require('../middleware/authMiddleware');

// Public news fetching routes (no authentication required)
router.get('/fetchLiveNewsByCategory', BookMarkController.fetchLiveNewsByCategory);  
router.get('/fetchLatestNews', BookMarkController.fetchLatestNews);
router.get('/fetchLiveNewsByParameter', BookMarkController.fetchLiveNewsByParameter);

// Protected bookmark routes (authentication required)
router.post('/bookmarks', authenticateToken, BookMarkController.saveArticle);
router.get('/bookmarks/fetchbookmark', authenticateToken, BookMarkController.fetchBookmarksByUser);
router.delete('/bookmarks/:bookmarkId', authenticateToken, BookMarkController.deleteBookmark);

module.exports = router;