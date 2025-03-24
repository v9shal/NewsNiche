const pool = require('../config/dbconfig');

class History {
  static async initTable() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        search_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
        UNIQUE KEY unique_user_keyword (username, keyword)
      )
    `;

    try {
      await pool.query(createTable);
      console.log('history table initialized');
    } catch (error) {
      console.error('Table initialization failed:', error);
      throw error;
    }
  }

  static async createHistory(username, keyword) {
    const query = `
      INSERT INTO history (username, keyword, search_count)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE search_count = search_count + 1
    `;

    try {
      const [result] = await pool.query(query, [username, keyword]);
      return result;
    } catch (error) {
      console.error('Error updating search history:', error);
      throw error;
    }
  }

  static async getHistoryOfUser(username) {
    try {
      const [rows] = await pool.query(
        'SELECT keyword FROM history WHERE username = ? ORDER BY search_count DESC LIMIT 3',
        [username]
      );
      return rows.map(row => row.keyword);
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }

  static async deleteHistory(username, keyword) {
    const [result] = await pool.query(
      'DELETE FROM history WHERE username = ? AND keyword = ?',
      [username, keyword]
    );

    return result;
  }

  static async isHistory(username, keyword) {
    const [rows] = await pool.query(
      'SELECT * FROM history WHERE username = ? AND keyword = ?',
      [username, keyword]
    );
    return rows.length > 0;
  }
}

module.exports = History;
