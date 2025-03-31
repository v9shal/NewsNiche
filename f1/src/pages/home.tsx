import { useEffect, useState } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck, Search, Globe, AlertCircle, Loader, Calendar, Tag, SlidersHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store"; 
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  id: number;
  article_id: string;
  title: string;
  description: string;
  link: string;
  pubData: Date;
  category: string;
  author?: string;
  source?: {
    name: string;
  };
}

// Available language options
const LANGUAGE_OPTIONS = [
  { value: "", label: "Select Language" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
  { value: "ko", label: "Korean" },
  {value:"hi",label:"Hindi"},
  {value:"pt",label:"Portuguese"},
];

// Available category options
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "general", label: "General" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
];

// Available sort options
const SORT_OPTIONS = [
  { value: "publishedAt", label: "Published Date" },
  { value: "relevancy", label: "Relevancy" },
  { value: "popularity", label: "Popularity" },
];

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [lang, setLang] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [noResponse, setNoResponse] = useState<string>("");
  
  // Additional filter states
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("publishedAt");
  const [fromDate, setFromDate] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  
  // Top keywords from user's history
  const [topKeywords, setTopKeywords] = useState<string[]>([]);

  // Get auth state from Redux store
  const auth = useSelector((state: RootState) => state.auth);
  const { token, isAuthenticated } = auth;

  const getAuthHeaders = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  
  
  const initialNews = async () => {
    if (!isAuthenticated || !token) {
      return;
    }
  
    setIsLoading(true);
    setError("");
    setNoResponse("");
  
    try {
      const response = await axios.get(
        `http://localhost:7000/api/bookmark/recommendations/${auth.username}`,
        getAuthHeaders()
      );
      
      const { keywords, news } = response.data;
      
      // Store top keywords for suggestions
      if (keywords && keywords.length > 0) {
        setTopKeywords(keywords);
      }
      
      // If no history found, show a message
      if (!keywords || keywords.length === 0) {
        setNoResponse("No search history found. Try searching for some news!");
        setArticles([]);
        setIsLoading(false);
        return;
      }
      
      // If no news articles were returned
      if (!news || news.length === 0) {
        setNoResponse("No news articles found based on your search history");
        setArticles([]);
        setIsLoading(false);
        return;
      }
      
      const articlesWithIds = news.map((article: any, index: number) => ({
        ...article,
        article_id: article.article_id || `article-${index}-${Date.now()}`,
      }));
      
      setArticles(articlesWithIds);
      
      console.log(`Showing news based on your top searches: ${keywords.join(', ')}`);
      
    } catch (err: any) {
      console.error("Error fetching initial news:", err);
      setError(`Failed to fetch news based on your history: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBookmarks();
      initialNews(); // Call this function when user logs in
    }
  }, [isAuthenticated, token]);
  
  const saveHistory = async () => {
    if (!q || !isAuthenticated) return;
    
    try {
      const response = await axios.post(
        `http://localhost:7000/api/bookmark/search`, 
        {
          username: auth.username, 
          keyword: q              
        },
        getAuthHeaders()           
      );
      
      if (response.status === 200) {
        console.log("Search history saved successfully");
      }
    } catch (error:any) {
      console.error("Error saving search history:", error.response?.data || error.message);
    }
  };
  
  // Fetch bookmarked articles for the user
  const fetchBookmarks = async () => {
    if (!isAuthenticated || !token) {
      console.log("User not authenticated, can't fetch bookmarks");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:7000/api/news/bookmarks`, getAuthHeaders());
      if (response.data && response.data.bookmarks) {
        const bookmarkedIds = response.data.bookmarks.map((b: { article_id: string }) => b.article_id);
        setBookmarks(bookmarkedIds);
      }
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error.response?.data || error.message);
    }
  };

  // Fetch live news with enhanced parameters
  const fetchLiveNews = async () => {
    if (!lang && !q && !category) {
      setError("Please provide at least one search parameter");
      return;
    }

    setIsLoading(true);
    setError("");
    setNoResponse("");

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (lang) queryParams.append("language", lang);
      if (q) queryParams.append("q", q);
      if (category) queryParams.append("category", category);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (fromDate) queryParams.append("from", fromDate);
      
      queryParams.append("_t", new Date().getTime().toString());
      
      const response = await axios.get(
        `http://localhost:7000/api/news/fetchLiveNewsByParameter?${queryParams.toString()}`
      );

      if (!response.data || response.data.articles.length === 0) {
        setNoResponse("No news articles found matching your criteria");
        setArticles([]);
      } else {
        const articlesWithIds = response.data.articles.map((article: any, index: number) => ({
          ...article,
          article_id: article.article_id || `article-${index}-${Date.now()}`,
        }));
        setArticles(articlesWithIds);
      }

      // Save search history if user is authenticated and there's a search query
      if (isAuthenticated && q) {
        await saveHistory();
      }
    } catch (err: any) {
      setError(`Failed to fetch news: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Toggle bookmark
  const toggleBookmark = async (article: Article) => {
    if (!isAuthenticated || !token) {
      setError("Please log in to bookmark articles");
      return;
    }
  
    try {
      if (bookmarks.includes(article.article_id)) {
        await axios.delete(`http://localhost:7000/api/news/bookmarks/${article.article_id}`, getAuthHeaders());
        setBookmarks((prev) => prev.filter((id) => id !== article.article_id));
      } else {
        await axios.post(
          `http://localhost:7000/api/news/bookmarks`,
          {
            title: article.title,
            author: article.author || "",
            url: article.link,
            articleId: article.article_id,
            description: article.description || "", // Add description for sentiment analysis
          },
          getAuthHeaders()
        );
        setBookmarks((prev) => [...prev, article.article_id]);
      }
    } catch (error: any) {
      console.error("Error updating bookmark:", error.response?.data || error.message);
      setError(`Failed to update bookmark: ${error.response?.data?.message || error.message}`);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setLang("");
    setQ("");
    setCategory("");
    setSortBy("publishedAt");
    setFromDate("");
  };
  
  // Apply a suggested keyword
  const applySuggestedKeyword = (keyword: string) => {
    setQ(keyword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-400">News Explorer</h1>
          <a href="/profile"> profile</a>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isAuthenticated
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "bg-red-500/20 text-red-300 border border-red-500/50"
            }`}
          >
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>Logged in as {auth.username}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span>Not logged in</span>
              </div>
            )}
          </div>
        </header>

        {/* Search Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-700/50"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Search News</h2>
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <SlidersHorizontal size={16} />
              {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Globe size={16} />
                Language
              </label>
              <select
                className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Search size={16} />
                Keywords
              </label>
              <input
                className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                placeholder="Search news..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                      <Tag size={16} />
                      Category
                    </label>
                    <select
                      className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                      <Calendar size={16} />
                      From Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                      <SlidersHorizontal size={16} />
                      Sort By
                    </label>
                    <select
                      className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-400 hover:text-gray-300 mr-4"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Suggested Keywords from History */}
          {isAuthenticated && topKeywords.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Suggested keywords:</div>
              <div className="flex flex-wrap gap-2">
                {topKeywords.slice(0, 5).map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestedKeyword(keyword)}
                    className="px-3 py-1 text-sm bg-gray-700/70 text-cyan-300 rounded-full hover:bg-gray-600/70 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium py-3 rounded-lg flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
            onClick={fetchLiveNews}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search News
              </>
            )}
          </motion.button>
        </motion.section>

        {/* Error and No Results Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/50 p-4 rounded-lg flex items-center gap-3 border border-red-700/50"
            >
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}
          {noResponse && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-800/50 p-6 rounded-lg text-center border border-gray-700/50"
            >
              <Search className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-300 text-lg">{noResponse}</p>
              <p className="text-gray-500 mt-2">Try adjusting your search parameters.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 p-5 rounded-xl animate-pulse border border-gray-700/50">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {articles.map((article) => (
                <motion.div
                  key={article.article_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/70 p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <div className="relative">
                    <h3 className="text-lg font-semibold text-white mb-2 pr-12 line-clamp-2">{article.title}</h3>
                    {article.source && article.source.name && (
                      <span className="text-xs text-cyan-500 bg-cyan-900/30 px-2 py-1 rounded-full absolute top-0 right-12">
                        {article.source.name}
                      </span>
                    )}
                    <p className="text-gray-400 mb-3 line-clamp-3">{article.description}</p>
                    <div className="flex justify-between items-center">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline transition-colors"
                      >
                        Read More
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </a>
                      {article.author && <span className="text-sm text-gray-500">By {article.author}</span>}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleBookmark(article)}
                      className={`absolute top-0 right-0 p-2 rounded-full ${
                        bookmarks.includes(article.article_id)
                          ? "bg-cyan-500/30 hover:bg-cyan-500/40"
                          : "bg-gray-700/50 hover:bg-gray-600/50"
                      } transition-all duration-200`}
                      title={bookmarks.includes(article.article_id) ? "Remove bookmark" : "Add bookmark"}
                    >
                      {bookmarks.includes(article.article_id) ? (
                        <BookmarkCheck className="text-cyan-400" size={20} />
                      ) : (
                        <Bookmark className="text-gray-400" size={20} />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Placeholder for No Articles */}
        {!loading && articles.length === 0 && !noResponse && (
          <div className="bg-gray-800/50 p-6 rounded-lg text-center border border-gray-700/50">
            <Search className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-300 text-lg">Start Your News Journey</p>
            <p className="text-gray-500 mt-2">Enter search parameters above to explore news articles.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;