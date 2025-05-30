import { getStories } from "../../data-api/api-service";
import { showFormattedDate } from "../../utils/app";
import { initMap } from "../../utils/leaflet";

export default class HomePage {
  constructor() {
    this.stories = [];
    this.map = null;
  }

  async render() {
    return `
      <section class="container">
        
        <h1 id="content">Kala Peta Bersuara</h1>
        <p>Dengarkan kisah-kisah yang lahir dari berbagai penjuru Indonesia dan negara lainnya. 
        Setiap titik di peta menyimpan sepotong harapan, kenangan, dan suara hati yang tak 
        ingin dilupakan. "Karena setiap tempat punya cerita dan setiap cerita layak untuk didengar."</p>
        
        <div class="map-container">
          <div id="map" class="map"></div>
        </div>

        <div id="stories-container" class="stories-container">
          <div class="loading-indicator">⏳ Hang on, stories are coming...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._loadStories();
    this._initMap();
    this._initTransition();
    this._initSkipLink(); 
  }

  _initSkipLink() {
    const skipLink = document.getElementById("skip-link");
    const mainContent = document.querySelector("#content"); 
    if (skipLink && mainContent) {
      skipLink.addEventListener("click", function (event) {
        event.preventDefault(); 
        skipLink.blur();
        mainContent.focus(); 
        mainContent.scrollIntoView(); 
      });
    }
  }

  async _loadStories() {
    const storiesContainer = document.getElementById("stories-container");

    try {
      const result = await getStories();

      if (result.error) {
        storiesContainer.innerHTML = `<div class="error-message">${result.message}</div>`;
        return;
      }

      this.stories = result.data;

      if (this.stories.length === 0) {
        storiesContainer.innerHTML = `<div class="empty-message">No stories found</div>`;
        return;
      }

      storiesContainer.innerHTML = "";
      this.stories.forEach((story) => {
        storiesContainer.innerHTML += this._createStoryItemTemplate(story);
      });

      if (this.map) {
        this._addMarkers();
      }
    } catch (error) {
      storiesContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
  }

  _createStoryItemTemplate(story) {
    return `
      <article class="story-item">
        <a href="#/detail/${story.id}" class="story-link">
          <div class="story-image-container">
            <img 
              src="${story.photoUrl}" 
              alt="Story image by ${story.name}" 
              class="story-image"
              loading="lazy"
            >
          </div>
          <div class="story-content">
            <h2 class="story-title">${story.name}</h2>
            <p class="story-date"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(
              story.createdAt
            )}</p>
            <p class="story-description">${this._truncateText(
              story.description,
              150
            )}</p>
          </div>
        </a>
      </article>
    `;
  }

  _truncateText(text, maxLength) {
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  }

  _initMap() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    this.map = initMap("map");

    if (this.stories && this.stories.length > 0) {
      this._addMarkers();
    }
  }

  _addMarkers() {
    const storiesWithLocation = this.stories.filter(
      (story) => story.lat && story.lon
    );

    if (storiesWithLocation.length > 0) {
      storiesWithLocation.forEach((story) => {
        const popupContent = `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <p>${this._truncateText(story.description, 100)}</p>
            <a href="#/detail/${story.id}" class="popup-link">View Story</a>
          </div>
        `;

        L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(popupContent);
      });

      const bounds = L.latLngBounds(
        storiesWithLocation.map((story) => [story.lat, story.lon])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  _initTransition() {
    document.querySelectorAll(".story-item").forEach((item, index) => {
      setTimeout(() => {
        item.style.animation = "fadeIn 0.5s forwards";
        item.style.opacity = "0";
      }, index * 100);
    });
  }
}

window.onload = function () {
  window.scrollTo(0, 0);
};
