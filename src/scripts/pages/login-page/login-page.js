import { login, isLoggedIn } from "../../data-api/api-service";

export default class LoginPage {
  async render() {
    if (isLoggedIn()) {
      window.location.hash = "#/";
      return "";
    }

    return `
  <section class="container fade-in">
   <h1 id="content" class="login-title">Login</h1> 
    <div class="auth-form">
      <form id="login-form">
        <div class="form-group">
          <label for="email">
            Alamat Email
          </label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="Masukkan email Anda"
            aria-required="true"
            autocomplete="email"
          >
        </div>

        <div class="form-group">
          <label for="password">
            Kata Sandi
          </label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            placeholder="Masukkan kata sandi Anda"
            aria-required="true"
            autocomplete="current-password"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary login-btn">
            Masuk
          </button>
        </div>
      </form>

      <div class="auth-links">
        <p> Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </div>

      <div id="login-status" class="status-message"></div>
    </div>
  </section>
`;
  }

  async afterRender() {
    this._initLoginForm();
    this._updateAuthUI();
  }

  _initLoginForm() {
    const form = document.getElementById("login-form");
    const statusContainer = document.getElementById("login-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        statusContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Harap isi semua kolom
          </div>
        `;
        return;
      }

      statusContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>Please wait, logging you in...</span>
        </div>
      `;

      try {
        const result = await login(email, password);

        if (result.error) {
          statusContainer.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> ${result.message}
            </div>
          `;
        } else {
          statusContainer.innerHTML = `
            <div class="success-message">
              <i class="fas fa-check-circle"></i> ${result.message}
            </div>
          `;

          setTimeout(() => {
            window.location.hash = "#/";
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        statusContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Error: ${
              error.message || "An unknown error occurred"
            }
          </div>
        `;
      }
    });
  }

  _updateAuthUI() {
    const loginMenuItems = document.querySelectorAll(".login-menu");
    const registerMenuItems = document.querySelectorAll(".register-menu");
    const logoutMenuItem = document.querySelector(".logout-menu");
    const userInfoElement = document.getElementById("user-info");

    if (logoutMenuItem) logoutMenuItem.style.display = "none";

    loginMenuItems.forEach((item) => (item.style.display = "block"));
    registerMenuItems.forEach((item) => (item.style.display = "block"));

    if (userInfoElement) userInfoElement.style.display = "none";
  }
}
