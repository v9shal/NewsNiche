const pool = require('../config/dbconfig');

class BookMark {
  static async initTable() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
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

  static async createBookmark(username, title, author) {
    const [result] = await pool.query(
      'INSERT INTO bookmarks (username, title, author) VALUES ( ?, ?, ?)',
      [username, title, author]
    );
    return result;
  }

  static async getNewsByUser(username) {
    const [rows] = await pool.query(
      'SELECT * FROM bookmarks WHERE username = ?',
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
}

module.exports = BookMark;
