const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Try to get token from cookies first (for browser clients)
  const cookieToken = req.cookies.authToken;
  
  // Then check Authorization header (for API clients)
  const authHeader = req.headers.authorization;
  let token = cookieToken;
  
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret'); 
    // Attach the full user info to the request
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = authenticateToken;