const History=require('../models/history');
const axios=require("axios");
    const getHistroy=async function(req, res) {
      try {
        const {username}=req.params;
        const history=await History.getHistoryOfUser(username);
        res.status(200).json({history
        });

      } catch (error) {
        res.status(500).json({error: 'Failed to fetch search history'});

        
      }
    }
    const deleteHistory=async function name(req,res) {
      try {
        const {username,keyword}=req.params;
        const history=await History.deleteHistory(username,keyword);
        res.status(200).json({message:"history deleted successfully"});
      } catch (error) {
        res.status(500).json({error:'failed to delete Histroy'});
        
      }
      
    }
    const saveSearch=async function(req, res) {
        try {
          const { username, keyword } = req.body;
          await History.createHistory(username, keyword);
          res.status(200).json({ message: 'Search history updated' });
        } catch (error) {
          res.status(500).json({ error: 'Failed to save search history' });
        }
      }
    
      const getUserRecommendations = async function(req, res) {
        try {
          const { username } = req.params;
          
          // Fetch user's search history keywords
          const keywords = await History.getHistoryOfUser(username);
          
          // If no search history is found
          if (!keywords || keywords.length === 0) {
            return res.status(200).json({ 
              keywords: [],
              news: [],
              message: 'No search history found'
            });
          }
          
          // Fetch news articles based on user's search history
          const newsData = await fetchNewsFromAPI(keywords);
          
          // Return both keywords and news articles
          res.status(200).json({ 
            keywords, 
            news: newsData 
          });
          
        } catch (error) {
          console.error("Error in getUserRecommendations:", error);
          res.status(500).json({ 
            error: 'Failed to fetch recommendations',
            message: error.message
          });
        }
      };
      
      const fetchNewsFromAPI = async function(keywords) {
        try {
          const API_KEY = process.env.NEWS_API;
          if (!API_KEY) {
            console.error("API key is not defined");
            return [];
          }
          
          const articles = [];
          
          // Fetch news for each keyword (up to top 5 keywords)
          const topKeywords = keywords.slice(0, 5);
          
          for (const keyword of topKeywords) {
            const baseUrl = 'https://newsapi.org/v2/everything';
            const queryParams = new URLSearchParams({
              q: keyword,
              apiKey: API_KEY,
              pageSize: 50 // Limit to 3 articles per keyword
            });
            
            const url = `${baseUrl}?${queryParams.toString()}`;
            console.log(`Fetching news for keyword "${keyword}"`);
            
            const response = await axios.get(url);
            
            if (response.data.articles && response.data.articles.length > 0) {
              // Add article_id to each article for consistent referencing
              const processedArticles = response.data.articles.map((article, index) => ({
                ...article,
                article_id: article.url ? `${keyword}-${index}-${Date.now()}` : `article-${index}-${Date.now()}`,
                link: article.url, // Ensure consistent naming (link vs url)
                category: keyword // Tag with the keyword category
              }));
              
              articles.push(...processedArticles);
            }
          }
          
          return articles;
          
        } catch (error) {
          console.error('Error fetching news:', error);
          return [];
        }
      };

module.exports = {
  saveSearch,
  getUserRecommendations, 
  getHistroy,
  deleteHistory
};
