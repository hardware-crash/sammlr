// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../logger'); // Ensure logger.js exists and is correctly set up

dotenv.config();

// Ensure that JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET must be set in environment variables.');
  throw new Error('JWT_SECRET not set.');
}

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and well-formed
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
          logger.warn('JWT Verification Failed: Token Expired', { message: err.message, stack: err.stack });
          return res.status(401).json({ message: 'Access token expired. Please refresh your token.' });
        } else if (err.name === 'JsonWebTokenError') {
          logger.warn('JWT Verification Failed: Invalid Token', { message: err.message, stack: err.stack });
          return res.status(403).json({ message: 'Invalid access token.' });
        } else {
          logger.warn('JWT Verification Failed:', { message: err.message, stack: err.stack });
          return res.status(403).json({ message: 'Failed to authenticate token.' });
        }
      }

      // Ensure the token type is 'access'
      if (decoded.type !== 'access') {
        logger.warn('Invalid Token Type:', { type: decoded.type });
        return res.status(403).json({ message: 'Invalid token type.' });
      }

      // Attach the user info from 'sub' to req.user
      req.user = decoded.sub;
      logger.info('Authenticated User:', { user: req.user });

      next();
    });
  } else {
    logger.warn('Authorization header missing or malformed.');
    return res.status(401).json({ message: 'Authorization header missing or malformed.' });
  }
};

module.exports = authenticateJWT;
