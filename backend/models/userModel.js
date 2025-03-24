const pool = require("../config/dbconfig");

class UserModel {
  static async initTable() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

   

    try {
      await pool.query(createUsersTable);
    
      console.log("Users tables initialized");
    } catch (error) {
      console.error("Table initialization failed:", error);
      throw error;
    }
  }

  // Create a user
  static async createUser(username, password) {
    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );
    return result;
  }

  // Get user by username
  static async getUserByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  // Delete a user
  static async deleteUser(username) {
    const [result] = await pool.query(
      "DELETE FROM users WHERE username = ?",
      [username]
    );
    return result;
  }

  
  // Get all bookmarked articles for a user
  
}

module.exports = UserModel;
