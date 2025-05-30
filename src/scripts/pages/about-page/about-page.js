export default class AboutPage {
  async render() {
    return `
     
    `;
  }

  async afterRender() {
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
      aboutContent.classList.add('fade-in');
    }
  }
}