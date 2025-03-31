import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Search, Loader, AlertCircle } from 'lucide-react';

const RecommendationSection = ({ onApplyKeyword }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  
  // Simulated auth state - in a real application, this would come from Redux
  const auth = {
    token: 'sample-token',
    isAuthenticated: true,
    username: 'demo-user'
  };
  
  const { token, isAuthenticated, username } = auth;
  
  const getAuthHeaders = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRecommendations();
      fetchBookmarks();
    }
  }, [isAuthenticated, token]);
  
  const fetchRecommendations = async () => {
    if (!isAuthenticated || !token) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simulated API call response
      const mockData = {
        keywords: ['technology', 'science', 'business'],
        news: [
          {
            article_id: 'tech-1-123456',
            title: 'New Breakthrough in Quantum Computing',
            description: 'Researchers have achieved a significant milestone in quantum computing that could revolutionize data processing.',
            link: 'https://example.com/article1',
            source: { name: 'Tech News' },
            author: 'Jane Smith',
            category: 'technology'
          },
          {
            article_id: 'sci-1-123457',
            title: 'Mars Rover Discovers Evidence of Ancient Water',
            description: 'NASA scientists confirm that new samples contain minerals that could only form in the presence of water.',
            link: 'https://example.com/article2',
            source: { name: 'Science Daily' },
            author: 'John Doe',
            category: 'science'
          },
          {
            article_id: 'bus-1-123458',
            title: 'Global Markets Respond to Economic Policy Shifts',
            description: 'Stock markets around the world show mixed reactions to new economic policies announced yesterday.',
            link: 'https://example.com/article3',
            source: { name: 'Business Insider' },
            author: 'Alex Johnson',
            category: 'business'
          }
        ]
      };
      
      const { keywords, news } = mockData;
      
      if (keywords && keywords.length > 0) {
        setKeywords(keywords);
      }
      
      if (news && news.length > 0) {
        setRecommendations(news);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBookmarks = async () => {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      // Simulated bookmarks data
      const bookmarkedIds = ['tech-1-123456']; // Mock a bookmarked article
      setBookmarks(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };
  
  const toggleBookmark = async (article) => {
    if (!isAuthenticated || !token) {
      setError('Please log in to bookmark articles');
      return;
    }

    try {
      if (bookmarks.includes(article.article_id)) {
        // Remove from bookmarks
        setBookmarks((prev) => 
          prev.filter((id) => id !== article.article_id)
        );
      } else {
        // Add to bookmarks
        setBookmarks((prev) => [...prev, article.article_id]);
      }
      
      // In a real app, we would make API calls here
      console.log(`${bookmarks.includes(article.article_id) ? 'Removed from' : 'Added to'} bookmarks: ${article.title}`);
      
    } catch (error) {
      console.error('Error updating bookmark:', error);
      setError(`Failed to update bookmark: ${error.message}`);
    }
  };
  
  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-cyan-400">Recommended For You</h2>
        <button 
          onClick={fetchRecommendations}
          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          <span>Refresh</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Keywords section */}
      {keywords.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-2">Based on your searches:</div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => onApplyKeyword(keyword)}
                className="px-3 py-1 text-sm bg-gray-700/70 text-cyan-300 rounded-full hover:bg-gray-600/70 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-300">
          <Loader size={40} className="animate-spin mb-4" />
          <p>Finding recommendations for you...</p>
        </div>
      )}
      
      {/* Recommendations */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((article) => (
            <div
              key={article.article_id}
              className="bg-gray-800/70 p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="relative">
                <h3 className="text-lg font-semibold text-white mb-2 pr-12 line-clamp-2">
                  {article.title}
                </h3>
                {article.source && article.source.name && (
                  <span className="text-xs text-cyan-500 bg-cyan-900/30 px-2 py-1 rounded-full absolute top-0 right-12">