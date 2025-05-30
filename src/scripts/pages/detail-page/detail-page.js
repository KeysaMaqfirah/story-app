import { getStoryDetail } from "../../data-api/api-service";
import { showFormattedDate } from "../../utils/app";
import { initMap } from "../../utils/leaflet";
import { parseActivePathname } from "../../routes/parser";

export default class DetailPage {
  constructor() {
    this.story = null;
    this.map = null;
  }

  async render() {
    return `
      <section class="container">
        <div id="content" class="story-detail" tabindex="0">
          <div class="loading-indicator">🕰️ A journey of words is about to begin...</div>
        </div>
        
        <div class="map-container">
          <div id="detail-map" class="map"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    await this._loadStoryDetail(id);
  }

  async _loadStoryDetail(id) {
    const detailContainer = document.querySelector(".story-detail");

    try {
      const result = await getStoryDetail(id);

      if (result.error) {
        detailContainer.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
      }

      this.story = result.data;

      detailContainer.innerHTML = this._createStoryDetailTemplate(this.story);

      if (this.story.lat && this.story.lon) {
        this._initMap();
      } else {
        document.querySelector(".map-container").style.display = "none";
      }
    } catch (error) {
      detailContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
  }

  _createStoryDetailTemplate(story) {
    return `
      <article class="detail-content">
        <h1 class="detail-title">${story.name}</h1>
        <p class="detail-date"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(
          story.createdAt
        )}</p>
        
        <div class="detail-image-container">
          <img 
            src="${story.photoUrl}" 
            alt="Story image by ${story.name}" 
            class="detail-image"
          >
        </div>
        
        <div class="author-info">
          <i class="fas fa-user"></i> 
          <span>Cerita dari ${story.name}</span>
        </div>
        
        <div class="detail-description">
          <p>${story.description}</p>
        </div>
      </article>
    `;
  }

  _initMap() {
    const mapContainer = document.getElementById("detail-map");
    if (!mapContainer) return;

    this.map = initMap("detail-map");

    const marker = L.marker([this.story.lat, this.story.lon]).addTo(this.map);

    const popupContent = `
      <div class="map-popup">
        <h3>${this.story.name}</h3>
        <p>Location: ${this.story.lat.toFixed(4)}, ${this.story.lon.toFixed(
      4
    )}</p>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    this.map.setView([this.story.lat, this.story.lon], 13);
  }
}
