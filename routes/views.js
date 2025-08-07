const express = require('express');
const router = express.Router();
const path = require('path');

// Serve main pages
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/compress', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/compression.html'));
});

router.get('/resize', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/resize.html'));
});

router.get('/upscale', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/upscale.html'));
});

router.get('/svg2png', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/converter.html'));
});

// 404 handler
router.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../views/404.html'));
});

module.exports = router;
