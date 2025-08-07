// Global utility functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize tool-specific scripts based on current page
document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;

  if (path.includes('/compress')) {
    // Compression.js will handle its own initialization
  } else if (path.includes('/resize')) {
    // Resize.js will handle its own initialization
  } else if (path.includes('/upscale')) {
    // Upscale.js will handle its own initialization
  } else if (path.includes('/svg2png')) {
    // SvgToPng.js will handle its own initialization
  }

  // Add active class to current nav item
  document.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
});
