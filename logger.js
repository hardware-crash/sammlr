// logger.js

const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: path.join(__dirname, 'logs', 'app.log'),
    handleExceptions: true,
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  errorFile: {
    level: 'error',
    filename: path.join(__dirname, 'logs', 'error.log'),
    handleExceptions: true,
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  },
};

// Instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
  transports: [
    new transports.File(options.file),
    new transports.File(options.errorFile),
    new transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Create a logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

module.exports = logger;
