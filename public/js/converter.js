class SvgToPngHandler {
  constructor() {
    this.dropzone = this.initDropzone();
    this.bindEvents();
  }

  initDropzone() {
    return new Dropzone('#svg-dropzone', {
      url: '/dummy-url',
      maxFiles: 1,
      maxFilesize: 50, // MB
      acceptedFiles: 'image/svg+xml',
      addRemoveLinks: true,
      autoProcessQueue: false,
      dictDefaultMessage: '',
      init: function () {
        this.on('addedfile', function (file) {
          document.getElementById('convert-btn').disabled = false;

          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }
        });

        this.on('removedfile', function () {
          document.getElementById('convert-btn').disabled = true;
        });
      },
    });
  }

  bindEvents() {
    document
      .getElementById('convert-btn')
      .addEventListener('click', () => this.processImage());
  }

  processImage() {
    if (this.dropzone.files.length === 0) return;

    const file = this.dropzone.files[0];
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;

    const formData = new FormData();
    formData.append('image', file);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    fetch('/api/svg2png', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Server error');
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        this.showResult(file, url);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while converting the image');
      });
  }

  showResult(originalFile, resultUrl) {
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    const dimensionsSpan = document.getElementById('dimensions');

    resultImage.src = resultUrl;

    // Get dimensions of the converted image
    const img = new Image();
    img.src = resultUrl;
    img.onload = function () {
      dimensionsSpan.textContent = `${this.naturalWidth} × ${this.naturalHeight} px`;
    };

    downloadBtn.href = resultUrl;
    downloadBtn.download =
      originalFile.name.replace('.svg', '.png') || 'converted.png';

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SvgToPngHandler();
});
