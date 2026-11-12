import { closeSearch, initCatalog } from './catalog.js';
import { getGame, loadGames } from './data.js';
import { renderFeatured } from './featured.js';
import { installImageFallback } from './images.js';
import { initPlayer, showGame, unloadGame } from './player.js';
import { startRouter } from './router.js';

const SITE_TITLE = 'UNBLOCKED — Games, Glitches & Other Distractions';

const homeView = document.getElementById('homeView');
const gameView = document.getElementById('gameView');
const navLinks = document.querySelectorAll('[data-nav]');
const mastheadLogo = document.getElementById('mastheadLogo');

// --- Routing ------------------------------------------------------------------

function setActiveNav(name) {
  navLinks.forEach((link) => {
    const active = link.dataset.nav === name;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function handleRoute(route) {
  closeSearch();

  if (route.name === 'game') {
    const game = getGame(route.id);
    if (!game) {
      window.location.replace('#/'); // unknown game id: back to the homepage
      return;
    }
    homeView.hidden = true;
    gameView.hidden = false;
    setActiveNav('games');
    document.title = `${game.title} · UNBLOCKED`;
    showGame(game);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  unloadGame();
  gameView.hidden = true;
  homeView.hidden = false;
  document.title = SITE_TITLE;

  if (route.name === 'games') {
    setActiveNav('games');
    document.getElementById('game-index').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    setActiveNav('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --- Logo glitch (plays on load and whenever the masthead logo is clicked) -------

function playGlitch(element) {
  element.classList.remove('is-glitching');
  void element.offsetWidth; // restart the CSS animation
  element.classList.add('is-glitching');
  element.addEventListener('animationend', () => element.classList.remove('is-glitching'), { once: true });
}

// --- Start ----------------------------------------------------------------------

async function start() {
  installImageFallback();
  initPlayer();
  mastheadLogo.addEventListener('click', () => playGlitch(mastheadLogo));

  try {
    await loadGames();
  } catch (error) {
    console.error(error);
    document.getElementById('gamesList').innerHTML =
      '<div class="no-games-found">COULD NOT LOAD THE GAME LIST. CHECK data/games.json.</div>';
    return;
  }

  renderFeatured();
  initCatalog();
  startRouter(handleRoute);
  playGlitch(mastheadLogo);
}

start();
