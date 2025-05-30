import { isLoggedIn, logout, getUserData } from "../data-api/api-service";
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogout();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupLogout() {
    document.addEventListener("click", (event) => {
      if (
        event.target.id === "logout-link" ||
        event.target.parentElement?.id === "logout-link"
      ) {
        event.preventDefault();

        const result = logout();

        if (!result.error) {
          this._clearAuthUI();

          window.location.hash = "#/login";
        }
      }
    });
  }

  _clearAuthUI() {
    const loginLink = document.querySelector(".login-menu");
    const registerLink = document.querySelector(".register-menu");
    const logoutLink = document.querySelector(".logout-menu");
    const userInfoElement = document.getElementById("user-info");
    const authRequiredLinks = document.querySelectorAll(".auth-required-link");

    if (loginLink) loginLink.style.display = "block";
    if (registerLink) registerLink.style.display = "block";

    if (logoutLink) logoutLink.style.display = "none";

    if (userInfoElement) userInfoElement.style.display = "none";

    authRequiredLinks.forEach((link) => link.classList.add("hidden"));
  }

  _toggleAuthLinks() {
    const isAuthenticated = isLoggedIn();
    const loginLink = document.querySelector(".login-menu");
    const registerLink = document.querySelector(".register-menu");
    const logoutLink = document.querySelector(".logout-menu");
    const authRequiredLinks = document.querySelectorAll(".auth-required-link");
    const userInfoElement = document.getElementById("user-info");

    if (isAuthenticated) {
      if (loginLink) loginLink.style.display = "none";
      if (registerLink) registerLink.style.display = "none";
      if (logoutLink) logoutLink.style.display = "block";

      authRequiredLinks.forEach((link) => link.classList.remove("hidden"));

      this._updateUserInfo();
    } else {
      if (loginLink) loginLink.style.display = "block";
      if (registerLink) registerLink.style.display = "block";
      if (logoutLink) logoutLink.style.display = "none";

      if (userInfoElement) userInfoElement.style.display = "none";

      authRequiredLinks.forEach((link) => link.classList.add("hidden"));
    }
  }

  _updateUserInfo() {
    const userData = getUserData();
    const userInfoElement = document.getElementById("user-info");

    if (userData && userInfoElement) {
      userInfoElement.textContent = `Hello, ${userData.name}`;
      userInfoElement.style.display = "block";
    } else if (userInfoElement) {
      userInfoElement.style.display = "none";
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
        <div class="container error-page">
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
        </div>
      `;
      return;
    }

    try {
      if (page.needsAuth && !isLoggedIn()) {
        window.location.hash = "#/login";
        return;
      }

      this.#content.innerHTML = await page.render();
      await page.afterRender();

      window.scrollTo(0, 0);
      this._toggleAuthLinks();
    } catch (error) {
      console.error("Error rendering page:", error);
      this.#content.innerHTML = `
        <div class="container error-page">
          <h2>Something went wrong</h2>
          <p>An error occurred while loading the page.</p>
        </div>
      `;
    }
  }
}

export default App;
