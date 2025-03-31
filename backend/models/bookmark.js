const pool = require('../config/dbconfig');

class BookMark {
  static async initTable() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        articleId VARCHAR(255),
        url VARCHAR(512),
        sentiment_score FLOAT DEFAULT 0,
        sentiment_label VARCHAR(20) DEFAULT 'neutral',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
      )
    `;

    try {
      await pool.query(createTable);
      console.log('Bookmark table initialized');
    } catch (error) {
      console.error('Table initialization failed:', error);
      throw error;
    }
  }

  static async createBookmark(username, title, author, articleId = null, url = null, sentimentScore = 0, sentimentLabel = 'neutral') {
    const [result] = await pool.query(
      'INSERT INTO bookmarks (username, title, author, articleId, url, sentiment_score, sentiment_label) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, title, author, articleId, url, sentimentScore, sentimentLabel]
    );
    return result;
  }

  static async getNewsByUser(username) {
    const [rows] = await pool.query(
      'SELECT * FROM bookmarks WHERE username = ? ORDER BY created_at DESC',
      [username]
    );
    return rows;
  }

  static async deleteBookmark(username, id) {
    const [result] = await pool.query(
      'DELETE FROM bookmarks WHERE username = ? AND id = ?',
      [username, id]
    );
    return result;
  }

  static async isBookmarked(username, title) {
    const [rows] = await pool.query(
      'SELECT * FROM bookmarks WHERE username = ? AND title = ?',
      [username, title]
    );
    return rows.length > 0;
  }
  
  static async getMoodInsights(username) {
    const [results] = await pool.query(
      `SELECT 
        sentiment_label, 
        COUNT(*) as count,
        AVG(sentiment_score) as average_score
      FROM bookmarks 
      WHERE username = ? 
      GROUP BY sentiment_label
      ORDER BY count DESC`,
      [username]
    );
    
    return results;
  }
  
  static async getBookmarksByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT b.*, u.id as user_id 
       FROM bookmarks b
       JOIN users u ON b.username = u.username
       WHERE u.id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = BookMark;