return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">NewsHub</h1>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-1">
                <User size={16} className="text-green-400" />
                <span className="text-green-400 font-medium">{username}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-1">
                <User size={16} className="text-red-400" />
                <span className="text-red-400">Not logged in</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8 bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe size={20} className="text-blue-400" />
              <h2 className="text-xl font-semibold">Search News</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                <select
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Search Topic (optional)</label>
                <div className="relative">
                  <input
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Technology, sports, politics..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || !lang}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-400 shrink-0" size={20} />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {noResponse && !loading && articles.length === 0 && (
          <div className="max-w-2xl mx-auto mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-gray-400 shrink-0" size={20} />
            <p className="text-gray-400">{noResponse}</p>
          </div>
        )}

        {/* News Articles Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.article_id || article.id}
                className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-gray-700 transition-all hover:shadow-xl flex flex-col h-full"
              >
                {/* Article Image Placeholder */}
                <div className="h-48 bg-gray-800 relative overflow-hidden">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
                      <span className="text-2xl font-bold text-gray-700">{getLanguageName(lang)}</span>
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  {article.category && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-xs font-semibold px-2 py-1 rounded text-white">
                      {article.category}
                    </div>
                  )}
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(article)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-full shadow hover:bg-gray-700 transition-all"
                    title={bookmarks.includes(article.article_id) ? "Remove bookmark" : "Add bookmark"}
                  >
                    {bookmarks.includes(article.article_id) ? (
                      <BookmarkCheck className="text-blue-400" size={18} />
                    ) : (
                      <Bookmark className="text-gray-300" size={18} />
                    )}
                  </button>
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {article.description || "No description available"}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {article.author ? (
                        <span className="inline-block">By {article.author}</span>
                      ) : null}
                      {article.pubDate && (
                        <span className="inline-block ml-2">{formatDate(article.pubDate)}</span>
                      )}
                    </div>
                    
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:text-blue-300 flex items-center group-hover:underline"
                    >
                      Read 
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty state */}
          {!loading && articles.length === 0 && !noResponse && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Search for news to get started
              </p>
            </div>
          )}
          
          {/* Loading state */}
          {loading && articles.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
                <p className="text-gray-400">Loading news articles...</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} NewsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );