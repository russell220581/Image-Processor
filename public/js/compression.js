document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input');
  const compressBtn = document.getElementById('compress-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const downloadAllBtn = document.getElementById('download-all-btn');

  // Quality slider
  document.getElementById('quality').addEventListener('input', function () {
    document.getElementById('quality-value').textContent = `${this.value}%`;
  });

  // File selection handler
  fileInput.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);

    // Validate file count
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      fileInput.value = '';
      compressBtn.disabled = true;
      return;
    }

    // Enable compress button if files are valid
    compressBtn.disabled = files.length === 0;
    compressBtn.textContent =
      files.length > 1 ? `Compress ${files.length} Images` : 'Compress Image';
  });

  // Compression handler
  compressBtn.addEventListener('click', async function () {
    const files = Array.from(fileInput.files);
    const quality = document.getElementById('quality').value;
    const format = document.getElementById('format').value;

    try {
      compressBtn.disabled = true;
      compressBtn.textContent = 'Processing...';

      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      formData.append('quality', quality);
      formData.append('format', format);

      const response = await fetch('/api/compress-multiple', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Compression failed');

      // Display results
      displayResults(data.files);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      compressBtn.disabled = false;
      compressBtn.textContent =
        files.length > 1 ? `Compress ${files.length} Images` : 'Compress Image';
    }
  });

  // Display results function
  function displayResults(files) {
    resultsList.innerHTML = '';

    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'result-item';

      item.innerHTML = `
        <div class="result-thumbnail">
          <img src="${file.downloadUrl}" alt="Compressed ${index + 1}">
          <span class="badge">${index + 1}</span>
        </div>
        <div class="result-meta">
          <div class="meta-row">
            <span>File Name:</span>
            <span>${file.originalName}</span>
          </div>
          <div class="meta-row">
            <span>Format:</span>
            <span>${file.format.toUpperCase()}</span>
          </div>
          <div class="meta-row">
            <span>Original Size:</span>
            <span>${formatFileSize(file.originalSize)}</span>
          </div>
          <div class="meta-row">
            <span>Compressed Size:</span>
            <span>${formatFileSize(file.size)}</span>
          </div>
          <div class="meta-row">
            <span>Reduction:</span>
            <span>${calculateReduction(file.originalSize, file.size)}%</span>
          </div>
        </div>
        <div class="result-actions">
          <a href="${
            file.downloadUrl
          }" class="download-btn" download="compressed_${
        file.originalName
      }">Download</a>
        </div>
      `;

      resultsList.appendChild(item);
    });

    // Set up download all button
    downloadAllBtn.onclick = () => {
      const paths = encodeURIComponent(
        JSON.stringify(files.map((f) => f.path))
      );
      window.location.href = `/api/download-multiple?paths=${paths}`;
    };

    // Show results section
    resultsSection.style.display = 'block';
  }

  // Helper functions
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function calculateReduction(original, compressed) {
    return (((original - compressed) / original) * 100).toFixed(1);
  }
});
