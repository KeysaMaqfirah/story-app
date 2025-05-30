import App from './pages/app';
import '../styles/styles.css';
import '../styles/notifikasi.css';
import '../styles/navigasi.css';
import '../styles/leaflet.css';
import '../styles/skip.css';
import '../styles/gabungan.css';


document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');

  drawerButton.addEventListener('click', () => {
    navigationDrawer.classList.toggle('open'); 
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
