// controllers/authController.js

const { User } = require('../models');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const logger = require('../logger'); // Ensure logger.js exists and is correctly set up

dotenv.config();

// Ensure that JWT secrets are set
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  logger.error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables.');
  throw new Error('JWT secrets are not set.');
}

// Helper function to generate tokens
const generateAccessToken = (user, fresh = true) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    fresh, // Indicates if the token is freshly issued
    iat: nowInSeconds, // Issued at
    jti: uuidv4(), // JWT ID
    type: 'access',
    sub: {
      id: user.id,
      is_admin: user.is_admin,
      username: user.username,
      image_file: user.image_file || '',
    },
    nbf: nowInSeconds, // Not Before
    exp: nowInSeconds + (15 * 60), // Expires in 15 minutes
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

const generateRefreshToken = (user) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    iat: nowInSeconds,
    jti: uuidv4(),
    type: 'refresh',
    sub: {
      id: user.id,
      is_admin: user.is_admin,
      username: user.username,
      image_file: user.image_file || '',
    },
    nbf: nowInSeconds,
    exp: nowInSeconds + (7 * 24 * 60 * 60), // Expires in 7 days
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET);
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation schema
    const registerSchema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};\'":|,.<>/?]).+$'))
        .required()
        .messages({
          'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
        }),
    });

    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      logger.warn('Registration Validation Failed:', { message: error.details[0].message });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username: validatedUsername, email: validatedEmail, password: validatedPassword } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { email: validatedEmail },
          { username: validatedUsername },
        ],
      },
    });
    if (existingUser) {
      logger.warn('Registration Attempt with Existing Email or Username:', { email: validatedEmail, username: validatedUsername });
      return res.status(400).json({ message: 'User with provided email or username already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(validatedPassword, saltRounds);

    // Create user
    await User.create({
      username: validatedUsername,
      email: validatedEmail,
      password: hashedPassword,
    });

    logger.info('User Registered Successfully:', { username: validatedUsername, email: validatedEmail });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    logger.error('Registration Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Login a user
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Define a validation schema using Joi
      const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
  
      // Validate the request body
      const { error, value } = loginSchema.validate({ email, password });
      if (error) {
        logger.warn('Login Validation Failed:', { message: error.details[0].message });
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const { email: validatedEmail, password: validatedPassword } = value;
  
      // Fetch the user with password included using 'withPassword' scope
      const user = await User.scope('withPassword').findOne({ where: { email: validatedEmail } });
  
      if (!user) {
        logger.warn('Login Attempt: User Not Found:', { email: validatedEmail });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // Debugging: Log user details (exclude password in logs for security)
      logger.debug('Fetched User:', { id: user.id, username: user.username, email: user.email });
  
      // Debugging: Check if password exists
      if (!user.password) {
        logger.error('User password is undefined or null for user:', { userId: user.id, email: user.email });
        return res.status(500).json({ message: 'Internal server error.' });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(validatedPassword, user.password);
      if (!isMatch) {
        logger.warn('Login Attempt: Incorrect Password:', { email: validatedEmail });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // Generate tokens
      const accessToken = generateAccessToken(user, true); // 'true' indicates a fresh token
      const refreshToken = generateRefreshToken(user);
  
      // Set refresh token in HTTP-only cookie
      res.cookie(process.env.JWT_REFRESH_COOKIE_NAME || 'refresh_token_cookie', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'Strict',
        path: '/api/auth/refresh', // Restrict path for better security
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
  
      logger.info('User Logged In Successfully:', { username: user.username, email: user.email });
  
      // Send access token in response
      res.json({ access_token: accessToken });
    } catch (error) {
      logger.error('Login Error:', { message: error.message, stack: error.stack });
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

// Refresh access token
exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies[process.env.JWT_REFRESH_COOKIE_NAME || 'refresh_token_cookie'];

    if (!refreshToken) {
      logger.warn('Refresh Token Missing in Request.');
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          logger.warn('Refresh Token Expired:', { message: err.message });
          return res.status(401).json({ message: 'Refresh token expired.' });
        } else {
          logger.warn('Invalid Refresh Token:', { message: err.message });
          return res.status(403).json({ message: 'Invalid refresh token.' });
        }
      }

      // Check token type
      if (decoded.type !== 'refresh') {
        logger.warn('Invalid Token Type for Refresh:', { type: decoded.type });
        return res.status(403).json({ message: 'Invalid token type.' });
      }

      // Optionally, check if the refresh token is revoked or blacklisted

      // Fetch user details
      const user = await User.findByPk(decoded.sub.id);
      if (!user) {
        logger.warn('User Not Found for Refresh Token:', { userId: decoded.sub.id });
        return res.status(401).json({ message: 'User not found.' });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user, false); // fresh = false

      // Optionally, implement token rotation by generating a new refresh token
      const newRefreshToken = generateRefreshToken(user);
      res.cookie(process.env.JWT_REFRESH_COOKIE_NAME || 'refresh_token_cookie', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'Strict',
        path: '/api/auth/refresh', // Restrict path for better security
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      logger.info('Access Token Refreshed Successfully for User:', { username: user.username, email: user.email });

      res.json({ access_token: newAccessToken });
    });
  } catch (error) {
    logger.error('Refresh Token Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Logout a user
exports.logout = async (req, res) => {
  try {
    res.clearCookie(process.env.JWT_REFRESH_COOKIE_NAME || 'refresh_token_cookie', { path: '/api/auth/refresh' });
    logger.info('User Logged Out Successfully.');
    res.json({ message: 'Logout successful.' });
  } catch (error) {
    logger.error('Logout Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};
