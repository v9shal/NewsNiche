const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  static async register(req, res) {
    try {
      const { username, password,email,age } = req.body;
      if (!username || !password || !email || !age) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if(age<12)
      {
        return res.status(400).json({ error: 'Age should be greater than 12' });
      }
      const existing = await UserModel.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.createUser(username, hashedPassword,email,age);

      const token = jwt.sign(
        { id: user.insertId, username },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: '24h' }
      );

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          username,
          role: 'user'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await UserModel.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: '24h' }
      );

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        message: 'Login successful',
        user: {
          username: user.username,
          role: user.role || 'user'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verify(req, res) {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ error: "No token present" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      const user = await UserModel.getUserByUsername(decoded.username);

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "authorized",
        user: {
          username: user.username,
          role: user.role || 'user',
          token:token
        }
      });
    } catch (error) {
      console.error('Token Verification Error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  static async logout(req, res) {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = AuthController;
