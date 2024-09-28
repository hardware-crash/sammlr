// app.js
process.env.TZ = 'UTC'; // Set timezone to UTC
require('dotenv').config(); // Load environment variables

const express = require('express');
const app = express();
const { sequelize } = require('./models');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const consoleRoutes = require('./routes/consoleRoutes');
const manufacturerRoutes = require('./routes/manufacturerRoutes'); // If applicable
const gameRoutes = require('./routes/gameRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes'); // If applicable
const collectionRoutes = require('./routes/collectionRoutes'); // Ensure the path is correct
const searchRoutes = require('./routes/searchRoutes'); // Import the search routes
const adminRoutes = require('./routes/adminRoutes'); // Import Admin Routes

// Apply Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Update with your frontend URLs
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
}));
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting (Optional)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use('/api/auth/', authLimiter); // Apply rate limiter to auth routes

// Serve Uploaded Files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d', // Cache files for 1 day
    setHeaders: (res, path, stat) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));

// Define Routes
app.use('/api/auth', authRoutes); // Mount auth routes here
app.use('/api/console', consoleRoutes); // Mount console routes here
app.use('/api/manufacturers', manufacturerRoutes);  // Mount manufacturer routes here
app.use('/api/game', gameRoutes);   // Mount game routes here
app.use('/api/wishlist', wishlistRoutes); // Mount wishlist routes here
app.use('/api/transactions', transactionRoutes); // Mount transaction routes here
app.use('/api/user', userRoutes); // Mount user routes here
app.use('/api/collection', collectionRoutes); // Mount the collection routes
app.use('/api/search', searchRoutes); // Mount the search routes
app.use('/api/admin', adminRoutes); // Mount admin routes here

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the Server After Ensuring Database Connection
const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
