import { register, isLoggedIn } from "../../data-api/api-service";

export default class RegisterPage {
  async render() {
    if (isLoggedIn()) {
      window.location.hash = "#/";
      return "";
    }
    return `
      <section class="container fade-in">
        <h1 id="content" class="form-title">Daftar Akun</h1>
        <div class="auth-form">
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Masukkan nama Anda"
                aria-required="true"
                autocomplete="name"
              >
            </div>

            <div class="form-group">
              <label for="email">Alamat Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="Masukkan alamat email Anda"
                aria-required="true"
                autocomplete="email"
              >
            </div>

            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Minimal 6 karakter"
                aria-required="true"
                minlength="6"
                autocomplete="new-password"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary register-btn">
                Daftar Akun
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
          </div>

          <div id="register-status" class="status-message"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initRegisterForm();
    this._updateAuthUI();
  }

  _initRegisterForm() {
    const form = document.getElementById("register-form");
    const statusContainer = document.getElementById("register-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!name || !email || !password) {
        statusContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Harap isi semua kolom
          </div>
        `;
        return;
      }

      if (password.length < 6) {
        statusContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> 
          </div>
        `;
        return;
      }

      statusContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>Creating your account...</span>
        </div>
      `;

      try {
        const result = await register(name, email, password);

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

          form.reset();

          setTimeout(() => {
            window.location.hash = "#/login";
          }, 2000);
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
