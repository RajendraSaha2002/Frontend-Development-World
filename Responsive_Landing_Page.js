const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  if (nav.style.display === 'flex') {
    nav.style.display = '';
  } else {
    nav.style.display = 'flex';
  }
});