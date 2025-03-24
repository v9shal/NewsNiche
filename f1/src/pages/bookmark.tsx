import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store"; 

interface Bookmark {
  id: number;
  title: string;
  author: string;
  article_id: string;
}

interface BookmarkResponse {
  message: string;
  bookmarks: Bookmark[] | undefined;
}

const BookmarkPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const { username } = auth;

  useEffect(() => {
    if (!username) return; 

    const fetchBookmarks = async () => {
      try {
        const response = await axios.get<BookmarkResponse>("/api/news/bookmarks/fetchbookmark");
        
        if (response.data && Array.isArray(response.data.bookmarks)) {
          setBookmarks(response.data.bookmarks);
        } else if (response.data && !response.data.bookmarks) {
          setBookmarks([]);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Couldn't load bookmarks: unexpected data format");
          setBookmarks([]);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setError("Failed to load bookmarks");
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [username]);

  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      await axios.delete(`/api/news/bookmarks/${bookmarkId}`);
      setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Saved Bookmarks</h1>
      
      {loading ? (
        <p>Loading bookmarks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : bookmarks.length === 0 ? (
        <p>No bookmarks found.</p>
      ) : (
        <ul className="space-y-4">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{bookmark.title}</h2>
              <p className="text-gray-600">By {bookmark.author || "Unknown"}</p>
              {bookmark.article_id && (
                <a
                  href={bookmark.article_id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Read More
                </a>
              )}
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookmarkPage;