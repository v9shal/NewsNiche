const BookMark = require('../models/bookmark');
const axios = require('axios');

class BookMarkController {
  static async fetchLiveNewsByCategory(req, res) {
    try {
      const baseUrl = `https://newsapi.org/v2/top-headlines`;
      const apiKey = process.env.NEWS_API;
  
      const { category } = req.query;
      const queryParams = new URLSearchParams({ apiKey });
  
      if (category) queryParams.append("category", category);
  
      const url = `${baseUrl}?${queryParams.toString()}`;
      console.log("Fetching news from:", url);
  
      const response = await axios.get(url);
  
      if (!response.data.articles || response.data.articles.length === 0) {
        return res.status(404).json({ message: "No news articles found" });
      }
  
      res.status(200).json({
        message: "Live news fetched successfully",
        articles: response.data.articles,
      });
  
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news", error: error.message });
    }
  }
  
  static async fetchLatestNews(req, res) {
    try {
      const baseUrl = `https://newsdata.io/api/1/latest`;
      const apiKey = process.env.NEWS_API;
  
      const { language } = req.query;
      const queryParams = new URLSearchParams({ apikey: apiKey });
  
      if(language) queryParams.append("language", language);
  
      const url = `${baseUrl}?${queryParams.toString()}`;
      console.log("Fetching news from:", url);
  
      const response = await axios.get(url);
  
      if (!response.data.results || response.data.results.length === 0) {
        return res.status(404).json({ message: "No news articles found" });
      }
  
      res.status(200).json({
        message: "Live news fetched successfully",
        articles: response.data.results,
      });
  
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news", error: error.message });
    }
  }

  static async fetchLiveNewsByParameter(req, res) {
    try {
      const apiKey = process.env.NEWS_API;
      const { language, q, category, sortBy, from, to } = req.query;
      
      // Determine which endpoint to use based on parameters
      let baseUrl;
      const queryParams = new URLSearchParams({ apiKey });
      
      // If category is specified, use top-headlines endpoint
      if (category && !q && !from && !to) {
        baseUrl = `https://newsapi.org/v2/top-headlines`;
        queryParams.append("category", category);
        
        if (language) queryParams.append("language", language);
      } 
      // If search query or dates are specified, use everything endpoint
      else if (q || from || to) {
        baseUrl = `https://newsapi.org/v2/everything`;
        
        if (q) queryParams.append("q", q);
        if (language) queryParams.append("language", language);
        if (from) queryParams.append("from", from);
        if (to) queryParams.append("to", to);
      }
      // Default to top-headlines with country filter if no specific criteria
      else {
        baseUrl = `https://newsapi.org/v2/top-headlines`;
        queryParams.append("country", "us"); // Default to US news
      }
      
      // Add sort parameter if provided, otherwise use default
      if (sortBy) {
        queryParams.append("sortBy", sortBy);
      } else if (baseUrl.includes("everything")) {
        queryParams.append("sortBy", "publishedAt"); // Default sort for everything endpoint
      }
      
      const url = `${baseUrl}?${queryParams.toString()}`;
      console.log("Fetching news from:", url);
      
      const response = await axios.get(url);
      
      if (!response.data.articles || response.data.articles.length === 0) {
        return res.status(404).json({ message: "No news articles found" });
      }
      
      // Process articles to include article_id
      const articlesWithIds = response.data.articles.map((article, index) => ({
        ...article,
        article_id: article.url ? `${article.source.id || 'news'}-${index}-${Date.now()}` : `article-${index}-${Date.now()}`,
        link: article.url // Map URL to link for frontend compatibility
      }));
      
      res.status(200).json({
        message: "Live news fetched successfully",
        articles: articlesWithIds,
      });
      
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news", error: error.message });
    }
  }

  static async saveArticle(req, res) {
    try {
      // Get the user ID from the authenticated user
      const username = req.user.username;
      const { title, author, articleId } = req.body;
      
      if (!title ) {
        return res.status(400).json({ message: "Missing required fields", success: false });
      }

      // Check if article is already bookmarked
      const isAlreadyBookmarked = await BookMark.isBookmarked(username, title);
      if (isAlreadyBookmarked) {
        return res.status(400).json({ message: "Article already bookmarked", success: false });
      }

      const response = await BookMark.createBookmark(username, title, author, articleId);
      res.status(201).json({ 
        message: "Your news article has been saved", 
        success: true, 
        bookmarkId: response.insertId 
      });

    } catch (error) {
      console.error('Saving error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async fetchBookmarksByUser(req, res) {
    try {
      // Get the user ID from the authenticated user
      const userId = req.user.id;
      
      const bookmarks = await BookMark.getBookmarksByUserId(userId);
      
      if (!bookmarks.length) {
        return res.json({ message: "No saved news found", bookmarks: [] });
      }

      res.status(200).json({ 
        message: "Here are your saved news articles", 
        bookmarks 
      });

    } catch (error) {
      console.error("Error while fetching bookmarks", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
  static async getBookmark(req,res){
    try {
      const {username}=req.params;
      const bookmarks=await BookMark.getNewsByUser(username);
      res.status(200).json({bookmarks});

      
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch bookmarks'});
      
    }
  }

  static async deleteBookmark(req, res) {
    try {
      const { username, id } = req.params;
  
      // Ensure ID is treated as a number
      const bookmarkId = parseInt(id, 10);
  
      if (isNaN(bookmarkId)) {
        return res.status(400).json({ error: "Invalid bookmark ID" });
      }
  
     const result=await BookMark.deleteBookmark(username,id);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
  
      res.json({ message: "Bookmark deleted successfully" });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
  
}

module.exports = BookMarkController;