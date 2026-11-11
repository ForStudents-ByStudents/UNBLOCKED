/**
 * Game page: header, embedded player, fullscreen toggle and prev/next links.
 */

import { store } from './data.js';
import { escapeHtml, gameHref, isHttpUrl } from './utils.js';

const els = {
  genre: document.getElementById('gameGenre'),
  rating: document.getElementById('gameRating'),
  title: document.getElementById('gameTitle'),
  subtitle: document.getElementById('gameSubtitle'),
  wrapper: document.getElementById('playerWrapper'),
  screen: document.getElementById('playerScreen'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  prev: document.getElementById('prevGame'),
  next: document.getElementById('nextGame'),
};

/** Embed URLs pasted in by the visitor this session (the catalog is never mutated). */
const pastedUrls = new Map();

// --- Player -----------------------------------------------------------------

function renderIframe(game, url) {
  const iframe = document.createElement('iframe');
  iframe.className = 'game-iframe';
  iframe.src = url;
  iframe.title = game.title;
  iframe.allow = 'autoplay; fullscreen; gamepad; keyboard-map; screen-wake-lock';
  els.screen.replaceChildren(iframe);
}

function renderEmptyPlayer(game, errorMessage = '') {
  els.screen.innerHTML = `
    <div class="player-empty">
      <h3 class="player-empty-title">${escapeHtml(game.title.toUpperCase())}</h3>
      <p class="player-empty-text">
        No embed URL is set for this game yet. Paste one below to play right now,
        or set <code>iframeUrl</code> in <code>data/games.json</code> to make it permanent.
      </p>
      <form class="player-empty-form" id="embedForm">
        <label for="embedUrl">PASTE EMBED URL:</label>
        <div class="player-empty-row">
          <input type="url" id="embedUrl" placeholder="https://..." required />
          <button type="submit" class="cat-btn active">LOAD GAME</button>
        </div>
        <p class="player-empty-error" role="alert">${escapeHtml(errorMessage)}</p>
      </form>
    </div>`;

  document.getElementById('embedForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = document.getElementById('embedUrl').value.trim();
    if (!isHttpUrl(url)) {
      renderEmptyPlayer(game, 'THAT DOES NOT LOOK LIKE A WEB ADDRESS (HTTP OR HTTPS).');
      return;
    }
    pastedUrls.set(game.id, url);
    renderIframe(game, url);
  });
}

function renderPlayer(game) {
  const url = pastedUrls.get(game.id) || game.iframeUrl;
  if (url && isHttpUrl(url)) renderIframe(game, url);
  else renderEmptyPlayer(game);
}

// --- Public API ---------------------------------------------------------------

export function showGame(game) {
  els.genre.textContent = `GENRE: ${game.genre}`;
  els.rating.textContent = `RATING: ${game.rating}`;
  els.title.innerHTML = `${escapeHtml(game.title.toUpperCase())}<span class="game-page-title-period">.</span>`;
  els.subtitle.textContent = game.subtitle || 'GAME';

  renderPlayer(game);

  // Previous / next wrap around the catalog.
  const { games } = store;
  const index = games.indexOf(game);
  const prev = games[(index - 1 + games.length) % games.length];
  const next = games[(index + 1) % games.length];
  els.prev.href = gameHref(prev);
  els.prev.textContent = `← ${prev.title.toUpperCase()}`;
  els.next.href = gameHref(next);
  els.next.textContent = `${next.title.toUpperCase()} →`;
}

/** Leaving the game page: stop the game (and its audio) and leave fullscreen. */
export function unloadGame() {
  els.screen.replaceChildren();
  exitFullscreen();
}

// --- Fullscreen ---------------------------------------------------------------

const isFullscreen = () =>
  document.fullscreenElement === els.wrapper ||
  els.wrapper.classList.contains('is-fullscreen');

function updateFullscreenButton() {
  const fullscreen = isFullscreen();

  els.fullscreenBtn.innerHTML = `
    <span class="fullscreen-icon">${fullscreen ? '✕' : '⛶'}</span>
    <span class="fullscreen-text">${fullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</span>
  `;

  els.fullscreenBtn.setAttribute(
    'aria-label',
    fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
  );
}

async function enterFullscreen() {
  try {
    if (els.wrapper.requestFullscreen) {
      await els.wrapper.requestFullscreen();
    } else {
      throw new Error('Fullscreen API unavailable');
    }
  } catch {
    els.wrapper.classList.add('is-fullscreen');
  }

  updateFullscreenButton();
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }

  els.wrapper.classList.remove('is-fullscreen');
  updateFullscreenButton();
}

export function initPlayer() {
  updateFullscreenButton();

  els.fullscreenBtn.addEventListener('click', () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.wrapper.classList.contains('is-fullscreen')) {
      exitFullscreen();
    }
  });
}