import { initMap } from "../../utils/leaflet";
import { addStory } from "../../data-api/api-service";

export default class AddPage {
  constructor() {
    this.map = null;
    this.selectedLocation = null;
    this.photoFile = null;
    this.stream = null;
  }

  async render() {
    return `
      <section class="container fade-in">
         <h1 id="content" tabindex="0"><span class="highlight">Tambah</span> Cerita Baru</h1>
        <form id="add-story-form" class="story-form">    
          <div class="form-group">
            <label for="description">Cerita Anda</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              placeholder="Ceritakan pengalaman atau cerita menarik Anda"
              rows="5"
              aria-required="true"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Ambil gambar dengan kamera</label>
            <div class="camera-container">
              <div class="camera-preview-container">
                <video id="camera-preview" class="camera-preview" autoplay></video>
                <canvas id="photo-canvas" class="photo-canvas" style="display: none;"></canvas>
                <img id="photo-preview" class="photo-preview" alt="Your photo will appear here" style="display: none;">
              </div>

              <div class="camera-controls">
         <button type="button" id="start-camera" class="btn btn-secondary">
         Mulai Kamera
         </button>
         <button type="button" id="take-photo" class="btn btn-secondary" disabled>
         Ambil Foto
         </button>
         <button type="button" id="retake-photo" class="btn btn-secondary" disabled>
         Ambil Ulang
        </button>
       </div>

            </div>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi</label>
            <div id="add-map" class="map"></div>
            <div id="selected-location" class="selected-location">
              Klik pada peta untuk menentukan lokasi cerita Anda.
            </div>
          </div>

          <div class="form-group">
            <button type="submit" id="submit-button" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Bagikan Cerita
            </button>
          </div>
        </form>

        <div id="submission-status" class="submission-status"></div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initCameraControls();
    this._initFormSubmission();
  }

  _initMap() {
    const mapContainer = document.getElementById("add-map");
    if (!mapContainer) return;

    this.map = initMap("add-map");
    let marker;

    this.map.on("click", (e) => {
      this.selectedLocation = {
        lat: e.latlng.lat,
        lon: e.latlng.lng,
      };

      document.getElementById("selected-location").innerHTML = `
        Selected: ${this.selectedLocation.lat.toFixed(
          6
        )}, ${this.selectedLocation.lon.toFixed(6)}
      `;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(this.map);
      }
    });
  }

  _initCameraControls() {
    const startCameraButton = document.getElementById("start-camera");
    const takePhotoButton = document.getElementById("take-photo");
    const retakePhotoButton = document.getElementById("retake-photo");
    const videoPreview = document.getElementById("camera-preview");
    const photoCanvas = document.getElementById("photo-canvas");
    const photoPreview = document.getElementById("photo-preview");

    startCameraButton.addEventListener("click", async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoPreview.srcObject = this.stream;
        videoPreview.style.display = "block";
        photoPreview.style.display = "none";

        startCameraButton.disabled = true;
        takePhotoButton.disabled = false;
        retakePhotoButton.disabled = true;
      } catch (error) {
        alert("Error accessing camera: " + error.message);
      }
    });

    takePhotoButton.addEventListener("click", () => {
      if (!this.stream) return;

      const context = photoCanvas.getContext("2d");

      photoCanvas.width = videoPreview.videoWidth;
      photoCanvas.height = videoPreview.videoHeight;

      context.drawImage(
        videoPreview,
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      photoCanvas.toBlob(
        (blob) => {
          this.photoFile = new File([blob], "photo.jpg", {
            type: "image/jpeg",
          });

          photoPreview.src = URL.createObjectURL(this.photoFile);
          photoPreview.style.display = "block";
          videoPreview.style.display = "none";

          takePhotoButton.disabled = true;
          retakePhotoButton.disabled = false;

          this._stopCameraStream();
        },
        "image/jpeg",
        0.8
      );
    });

    retakePhotoButton.addEventListener("click", async () => {
      this.photoFile = null;
      photoPreview.style.display = "none";

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoPreview.srcObject = this.stream;
        videoPreview.style.display = "block";

        takePhotoButton.disabled = false;
        retakePhotoButton.disabled = true;
      } catch (error) {
        alert("Error accessing camera: " + error.message);
      }
    });
  }

  _stopCameraStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  _initFormSubmission() {
    const form = document.getElementById("add-story-form");
    const statusContainer = document.getElementById("submission-status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!this.photoFile) {
        const message = document.createElement("div");
        message.className = "error-message";
        message.innerHTML = `<i class="fas fa-camera"></i> Harap mengambil foto sebelum mengirim cerita`;
        statusContainer.innerHTML = ""; 
        statusContainer.appendChild(message);
      
        setTimeout(() => {
          message.classList.add("fade-out");
        }, 4000);
      
        setTimeout(() => {
          message.remove();
        }, 4500);
      
        return;
      }
      
      
      const description = document.getElementById("description").value;

      const payload = {
        description,
        photo: this.photoFile,
      };

      if (this.selectedLocation) {
        payload.lat = this.selectedLocation.lat;
        payload.lon = this.selectedLocation.lon;
      }

      statusContainer.innerHTML = `<div class="loading-indicator">⏳Mengirimkan cerita Anda...</div>`;

      try {
        const result = await addStory(payload);

        if (result.error) {
          statusContainer.innerHTML = `<div class="notif-box error-message" onclick="this.remove()">
      ❌ ${result.message}
    </div>
  `;
} else {
  statusContainer.innerHTML = `
    <div class="notif-box success-message" onclick="this.remove()">
      ✅ Yes! Success stories are marketed.
      <a href="#/">📚 Come on, read another exciting story!</a>
    </div>
  `;

          form.reset();
          this.photoFile = null;
          this.selectedLocation = null;
          document.getElementById("photo-preview").style.display = "none";
          document.getElementById("selected-location").innerHTML =
            "No location selected";

          this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              this.map.removeLayer(layer);
            }
          });
        }
      } catch (error) {
        statusContainer.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
      }
    });

    window.addEventListener("hashchange", () => {
      this._stopCameraStream();
    });
  }
}
