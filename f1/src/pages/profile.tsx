import { useState, useEffect, use } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronLeft, History, BookmarkIcon, Loader, AlertCircle } from "lucide-react";

interface BookmarkItem {
  id: number;
  article_id: string;
  title: string;
  author: string;
  url?: string;
}

interface HistoryItem {
  keyword: string;
  // search_count: number;
  // created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const { token, isAuthenticated, username } = auth;

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"history" | "bookmarks">("history");

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
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(`Failed to fetch user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, username, token]);

  const deleteBookmark = async (id: number) => {
    try {
      await axios.delete(
        `http://localhost:7000/api/bookmark/removeBookmark/${username}/${id}`,
        getAuthHeaders()
      );
      
      setBookmarks(prevBookmarks => 
        prevBookmarks.filter(bookmark => bookmark.id !== id)
      );
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
                          <div className="text-sm text-gray-400">
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/news?keyword=${encodeURIComponent(item.keyword)}`)}
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
            ) : (
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
                          <h3 className="font-medium text-gray-200 mb-1">{bookmark.title}</h3>
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
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Profile;