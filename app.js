require('dotenv').config();
const express = require('express');
const path = require('path');
const fileUpload = require('./middlewares/fileUpload');
const securityMiddlewares = require('./middlewares/security');
const rateLimiter = require('./middlewares/rateLimiter');
const { cleanTempFolder } = require('./services/fileManager');
const { TEMP_DIR, CLEANUP_INTERVAL } = require('./config/constants');

// Initialize Express app
const app = express();

// ======================
// Middleware Setup
// ======================

// Apply security middlewares
securityMiddlewares.forEach((middleware) => app.use(middleware));

// Rate limiting middleware
app.use(rateLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload);

// ======================
// Route Handlers
// ======================

// Main routes
app.use('/', require('./routes/views'));
app.use('/api', require('./routes/api'));

// ======================
// Error Handling
// ======================

// 404 handler
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);

  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
  }

  // Development error handling
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
  }

  // Production error handling
  res.status(500).sendFile(path.join(__dirname, 'views/500.html'));
});

// ======================
// Server Initialization
// ======================

// Ensure temp directory exists and clean old files
const initializeTempDirectory = async () => {
  try {
    await cleanTempFolder();
    console.log('Temporary directory initialized and cleaned');
  } catch (err) {
    console.error('Failed to initialize temp directory:', err);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  await initializeTempDirectory();

  // Schedule regular cleanup
  setInterval(cleanTempFolder, CLEANUP_INTERVAL);
  console.log(
    `Scheduled cleanup every ${CLEANUP_INTERVAL / 1000 / 60} minutes`
  );

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Temporary files directory: ${path.resolve(TEMP_DIR)}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      cleanTempFolder();
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      cleanTempFolder();
      console.log('Server closed');
      process.exit(0);
    });
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
      cleanTempFolder();
      process.exit(1);
    });
  });

  // Uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
      cleanTempFolder();
      process.exit(1);
    });
  });
};

startServer();
