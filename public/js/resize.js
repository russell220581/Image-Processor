class ResizeHandler {
  constructor() {
    this.dropzone = this.initDropzone();
    this.bindEvents();
  }

  initDropzone() {
    return new Dropzone('#resize-dropzone', {
      url: '/dummy-url',
      maxFiles: 1,
      maxFilesize: 50, // MB
      acceptedFiles: 'image/jpeg,image/png,image/webp',
      addRemoveLinks: true,
      autoProcessQueue: false,
      dictDefaultMessage: '',
      init: function () {
        this.on('addedfile', function (file) {
          document.getElementById('resize-btn').disabled = false;

          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }

          // Preview original dimensions
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = function () {
            document.getElementById(
              'original-dimensions'
            ).textContent = `${this.naturalWidth} × ${this.naturalHeight} px`;
          };
        });

        this.on('removedfile', function () {
          document.getElementById('resize-btn').disabled = true;
          document.getElementById('original-dimensions').textContent = '-';
        });
      },
    });
  }

  bindEvents() {
    document
      .getElementById('resize-btn')
      .addEventListener('click', () => this.processImage());
  }

  processImage() {
    if (this.dropzone.files.length === 0) return;

    const file = this.dropzone.files[0];
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const fit = document.getElementById('fit').value;
    const position = document.getElementById('position').value;
    const withoutEnlargement = document.getElementById(
      'without-enlargement'
    ).checked;

    if (!width && !height) {
      alert('Please specify at least width or height');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('fit', fit);
    formData.append('position', position);
    formData.append('withoutEnlargement', withoutEnlargement);

    fetch('/api/resize', {
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
        alert('An error occurred while resizing the image');
      });
  }

  showResult(originalFile, resultUrl) {
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');

    resultImage.src = resultUrl;

    // Preview new dimensions
    const img = new Image();
    img.src = resultUrl;
    img.onload = function () {
      document.getElementById(
        'new-dimensions'
      ).textContent = `${this.naturalWidth} × ${this.naturalHeight} px`;
    };

    downloadBtn.href = resultUrl;
    downloadBtn.download = `resized_${originalFile.name}`;

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ResizeHandler();
});
