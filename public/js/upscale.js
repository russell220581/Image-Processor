class UpscaleHandler {
  constructor() {
    this.dropzone = this.initDropzone();
    this.originalDimensions = null;
    this.bindEvents();
  }

  initDropzone() {
    return new Dropzone('#upscale-dropzone', {
      url: '/dummy-url',
      maxFiles: 1,
      maxFilesize: 50, // MB
      acceptedFiles: 'image/jpeg,image/png,image/webp',
      addRemoveLinks: true,
      autoProcessQueue: false,
      dictDefaultMessage: '',
      init: function () {
        this.on('addedfile', function (file) {
          document.getElementById('upscale-btn').disabled = false;

          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }

          // Get original dimensions
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = function () {
            document.getElementById(
              'original-dimensions'
            ).textContent = `${this.naturalWidth} × ${this.naturalHeight} px`;
          };
        });

        this.on('removedfile', function () {
          document.getElementById('upscale-btn').disabled = true;
          document.getElementById('original-dimensions').textContent = '-';
        });
      },
    });
  }

  bindEvents() {
    document
      .getElementById('upscale-btn')
      .addEventListener('click', () => this.processImage());

    // Disable scale when width/height is entered
    document.getElementById('width').addEventListener('input', function () {
      if (this.value) document.getElementById('scale').disabled = true;
      else document.getElementById('scale').disabled = false;
    });

    document.getElementById('height').addEventListener('input', function () {
      if (this.value) document.getElementById('scale').disabled = true;
      else document.getElementById('scale').disabled = false;
    });

    document.getElementById('scale').addEventListener('input', function () {
      if (this.value) {
        document.getElementById('width').disabled = true;
        document.getElementById('height').disabled = true;
      } else {
        document.getElementById('width').disabled = false;
        document.getElementById('height').disabled = false;
      }
    });
  }

  processImage() {
    if (this.dropzone.files.length === 0) return;

    const file = this.dropzone.files[0];
    const scale = document.getElementById('scale').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const kernel = document.getElementById('kernel').value;

    if (!scale && !width && !height) {
      alert('Please specify scale factor or dimensions');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    if (scale) formData.append('scale', scale);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);
    formData.append('kernel', kernel);

    fetch('/api/upscale', {
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
        alert('An error occurred while upscaling the image');
      });
  }

  showResult(originalFile, resultUrl) {
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');

    resultImage.src = resultUrl;

    // Calculate new dimensions and scale factor
    const originalImg = new Image();
    originalImg.src = URL.createObjectURL(originalFile);

    originalImg.onload = () => {
      const resultImg = new Image();
      resultImg.src = resultUrl;

      resultImg.onload = () => {
        const widthScale = (
          resultImg.naturalWidth / originalImg.naturalWidth
        ).toFixed(1);
        const heightScale = (
          resultImg.naturalHeight / originalImg.naturalHeight
        ).toFixed(1);

        document.getElementById(
          'new-dimensions'
        ).textContent = `${resultImg.naturalWidth} × ${resultImg.naturalHeight} px`;
        document.getElementById(
          'scale-factor'
        ).textContent = `${widthScale}x × ${heightScale}x`;
      };
    };

    downloadBtn.href = resultUrl;
    downloadBtn.download = `upscaled_${originalFile.name}`;

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UpscaleHandler();
});
