import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  ChevronLeft, 
  History, 
  BookmarkIcon, 
  Loader, 
  AlertCircle, 
  BarChart4, 
  TrendingUp, 
  TrendingDown,
  Frown,
  Smile,
  Meh
} from "lucide-react";

interface BookmarkItem {
  id: number;
  article_id: string;
  title: string;
  author: string;
  url?: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'negative' | 'neutral';
}

interface HistoryItem {
  keyword: string;
}

interface MoodInsight {
  sentiment_label: 'positive' | 'negative' | 'neutral';
  count: number;
  average_score: number;
}

interface OverallMood {
  score: number;
  mood: 'positive' | 'negative' | 'neutral';
  totalArticles: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const { token, isAuthenticated, username } = auth;

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [moodInsights, setMoodInsights] = useState<MoodInsight[]>([]);
  const [overallMood, setOverallMood] = useState<OverallMood | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"history" | "bookmarks" | "mood">("history");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch user's history
        const historyResponse = await axios.get(
          `http://localhost:7000/api/bookmark/getHistory/${username}`,
          getAuthHeaders()
        );
        
        if (historyResponse.data.history) {
          setHistory(
            historyResponse.data.history.map((keyword: string) => ({ keyword }))
          );
        }
        
        // Fetch user's bookmarks
        const bookmarksResponse = await axios.get(
          `http://localhost:7000/api/bookmark/getbookmark/${username}`, 
          getAuthHeaders()
        );
        
        if (bookmarksResponse.data && bookmarksResponse.data.bookmarks) {
          setBookmarks(bookmarksResponse.data.bookmarks);
        }
        
        // Fetch mood insights
        const moodResponse = await axios.get(
          `http://localhost:7000/api/bookmark/moodInsights/${username}`,
          getAuthHeaders()
        );
        
        if (moodResponse.data && moodResponse.data.insights) {
          setMoodInsights(moodResponse.data.insights);
          setOverallMood(moodResponse.data.overall);
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(`Failed to fetch user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, username, token, navigate]);

  const deleteBookmark = async (id: number) => {
    try {
      await axios.delete(
        `http://localhost:7000/api/bookmark/removeBookmark/${username}/${id}`,
        getAuthHeaders()
      );
      
      setBookmarks(prevBookmarks => 
        prevBookmarks.filter(bookmark => bookmark.id !== id)
      );
      
      // Refresh mood insights
      const moodResponse = await axios.get(
        `http://localhost:7000/api/bookmark/moodInsights/${username}`,
        getAuthHeaders()
      );
      
      if (moodResponse.data && moodResponse.data.insights) {
        setMoodInsights(moodResponse.data.insights);
        setOverallMood(moodResponse.data.overall);
      }
    } catch (err: any) {
      console.error("Error deleting bookmark:", err);
      setError(`Failed to delete bookmark: ${err.message}`);
    }
  };

  const deleteHistory = async (keyword: string) => {
    try {
      await axios.delete(
        `http://localhost:7000/api/bookmark/deleteHistory/${username}/${encodeURIComponent(keyword)}`,
        getAuthHeaders()
      );
      
      setHistory(prevHistory => 
        prevHistory.filter(item => item.keyword !== keyword)
      );
    } catch (err: any) {
      console.error("Error deleting history item:", err);
      setError(`Failed to delete history item: ${err.message}`);
    }
  };

  const goBackToHome = () => {
    navigate('/');
  };
  
  // Helper function to get mood icon
  const getMoodIcon = (sentiment: string, size = 18) => {
    switch (sentiment) {
      case 'positive':
        return <Smile size={size} className="text-green-400" />;
      case 'negative':
        return <Frown size={size} className="text-red-400" />;
      default:
        return <Meh size={size} className="text-yellow-400" />;
    }
  };
  
  // Helper function to get sentiment color class
  const getSentimentColorClass = (score: number) => {
    if (score > 0.25) return 'bg-green-500/20 border-green-500/50 text-green-300';
    if (score < -0.25) return 'bg-red-500/20 border-red-500/50 text-red-300';
    return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBackToHome}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to News</span>
            </motion.button>
            <h1 className="text-3xl font-bold text-cyan-400">Hi {username}</h1>
          </div>
          <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span>{username}</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === "history"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History size={18} />
            <span>Search History</span>
          </button>
          <button
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === "bookmarks"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("bookmarks")}
          >
            <BookmarkIcon size={18} />
            <span>Bookmarked Articles</span>
          </button>
          <button
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === "mood"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("mood")}
          >
            <BarChart4 size={18} />
            <span>Mood Insights</span>
          </button>
        </div>

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
            <p>Loading your data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <AnimatePresence mode="wait">
            {activeTab === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Your Search History</h2>
                {history.length === 0 ? (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <History size={40} className="mx-auto mb-4 opacity-50" />
                    <p>You haven't searched for anything yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <motion.div
                        key={item.keyword}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-200">{item.keyword}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/?q=${encodeURIComponent(item.keyword)}`)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20"
                          >
                            Search Again
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteHistory(item.keyword)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            aria-label="Delete history item"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === "bookmarks" ? (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Your Bookmarked Articles</h2>
                {bookmarks.length === 0 ? (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <BookmarkIcon size={40} className="mx-auto mb-4 opacity-50" />
                    <p>You haven't bookmarked any articles yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {bookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-200">{bookmark.title}</h3>
                            <div className={`ml-2 px-2 py-1 rounded text-xs flex items-center ${
                              bookmark.sentiment_score > 0.25 ? 'bg-green-500/20 text-green-300' :
                              bookmark.sentiment_score < -0.25 ? 'bg-red-500/20 text-red-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {getMoodIcon(bookmark.sentiment_label, 14)}
                              <span className="ml-1 capitalize">{bookmark.sentiment_label}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">By {bookmark.author || "Unknown"}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                          {bookmark.url && (
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                            >
                              Read Article
                            </a>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteBookmark(bookmark.id)}
                            className="text-red-400 hover:text-red-300 transition-colors ml-auto"
                            aria-label="Delete bookmark"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="mood"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Your News Mood Insights</h2>
                
                {(!moodInsights || moodInsights.length === 0) ? (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    <BarChart4 size={40} className="mx-auto mb-4 opacity-50" />
                    <p>You need to bookmark some articles to see mood insights.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall mood card */}
                    {overallMood && (
                      <div className={`p-6 rounded-lg ${getSentimentColorClass(overallMood.score)} border`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Your Overall News Diet</h3>
                          <div className="flex items-center">
                            {getMoodIcon(overallMood.mood, 24)}
                            <span className="ml-2 text-lg capitalize">{overallMood.mood}</span>
                          </div>
                        </div>
                        
                        <p className="mb-2">Based on {overallMood.totalArticles} saved articles, your news consumption tends to be <span className="font-medium capitalize">{overallMood.mood}</span>.</p>
                        
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                          <div 
                            className={`h-2.5 rounded-full ${
                              overallMood.score > 0.25 ? 'bg-green-500' :
                              overallMood.score < -0.25 ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(Math.max((overallMood.score + 1) / 2 * 100, 0), 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Negative</span>
                          <span>Neutral</span>
                          <span>Positive</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Mood breakdown */}
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">Mood Breakdown</h3>
                      
                      <div className="space-y-4">
                        {moodInsights.map((insight) => (
                          <div key={insight.sentiment_label} className="flex items-center">
                            <div className="w-24 flex items-center">
                              {getMoodIcon(insight.sentiment_label)}
                              <span className="ml-2 capitalize">{insight.sentiment_label}</span>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="w-full bg-gray-700 rounded-full h-5">
                                <div 
                                  className={`h-5 rounded-full ${
                                    insight.sentiment_label === 'positive' ? 'bg-green-500' :
                                    insight.sentiment_label === 'negative' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  } flex items-center justify-end pr-2`}
                                  style={{ 
                                    width: `${overallMood && overallMood.totalArticles ? 
                                      (insight.count / overallMood.totalArticles) * 100 : 0}%` 
                                  }}
                                >
                                  <span className="text-xs font-medium text-white">{insight.count}</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-16 text-right">
                              {overallMood && overallMood.totalArticles ? 
                                `${Math.round((insight.count / overallMood.totalArticles) * 100)}%` : '0%'}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <h4 className="font-medium mb-2">What This Means</h4>
                        <p className="text-sm text-gray-300">
                          This analysis shows the emotional tone of the news articles you've saved. Understanding your news diet can help you maintain a balanced perspective on world events.
                        </p>
                        
                        {overallMood && (
                          <div className="mt-4 p-4 rounded bg-gray-700/50">
                            <h5 className="font-medium mb-1 flex items-center">
                              {overallMood.mood === 'positive' ? <TrendingUp size={16} className="mr-2 text-green-400" /> : 
                               overallMood.mood === 'negative' ? <TrendingDown size={16} className="mr-2 text-red-400" /> :
                               <BarChart4 size={16} className="mr-2 text-yellow-400" />}
                              Your Insight
                            </h5>
                            <p className="text-sm">
                              {overallMood.mood === 'positive' ? 
                                "You tend to save news with positive tones. While staying positive is good for mental health, make sure you're not missing important critical stories." : 
                               overallMood.mood === 'negative' ? 
                                "Your saved articles skew negative. Consider balancing with some positive news to maintain perspective." :
                                "Your saved articles have a balanced emotional tone, suggesting you consume a diverse news diet."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Profile;