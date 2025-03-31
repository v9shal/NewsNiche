const express = require("express");
const {getUserRecommendations, saveSearch, getHistroy, deleteHistory} = require('../controllers/history');
const { getBookmark, deleteBookmark, getMoodInsights } = require("../controllers/article");
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Bookmark routes
router.delete("/removeBookmark/:username/:id", deleteBookmark);
router.get("/getbookmark/:username", getBookmark);
         
// History routes
router.post("/search", saveSearch);
router.get('/recommendations/:username', getUserRecommendations);
router.get('/getHistory/:username', getHistroy);
router.delete('/deleteHistory/:username/:keyword', deleteHistory);

// New mood insights route
router.get('/moodInsights/:username', authenticateToken, getMoodInsights);

module.exports = router;