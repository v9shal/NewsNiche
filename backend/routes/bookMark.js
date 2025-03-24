const express = require("express");
const {getUserRecommendations,saveSearch,getHistroy,deleteHistory} = require('../controllers/history');
const { getBookmark } = require("../controllers/article");
const { deleteBookmark } = require("../controllers/article");


const router = express.Router();

 //router.get("/", getBookmarkStatus);
//router.post("/", addBookmark);
 router.delete("/removeBookmark/:username/:id", deleteBookmark);
router.get("/getbookmark/:username", getBookmark);
router.post("/search", saveSearch);
//router.post('/search', HistoryController.saveSearch);
router.get('/recommendations/:username', getUserRecommendations);
router.get('/getHistory/:username', getHistroy);
router.delete('/deleteHistory/:username/:keyword',deleteHistory)

module.exports = router;
