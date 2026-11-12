/**
 * Homepage catalog: category filters, game grid, live search dropdown and the
 * "Recently Added" sidebar.
 */

import { getRecent, groupByCategory, store } from './data.js';
import { thumbnailHtml } from './images.js';
import { escapeHtml, gameHref } from './utils.js';

const ALL = 'ALL';
const state = { category: ALL, query: '' };

const list = document.getElementById('gamesList');
const categoryBar = document.getElementById('categoryBar');
const recentList = document.getElementById('recentList');
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

const matchesQuery = (game) => {
  const query = state.query;
  return !query || game.title.toLowerCase().includes(query) || game.genre.toLowerCase().includes(query);
};

const matchesCategory = (game) => state.category === ALL || game.category === state.category;

// --- Category filters -------------------------------------------------------

function renderFilters() {
  categoryBar.innerHTML = [ALL, ...store.categories]
    .map((name) => {
      const active = name === state.category;
      return `<button class="cat-btn${active ? ' active' : ''}" type="button" data-category="${escapeHtml(name)}" aria-pressed="${active}">${escapeHtml(name)}</button>`;
    })
    .join('');
}

// --- Game grid --------------------------------------------------------------

function gameCard(game) {
  return `
    <a class="game-card" href="${gameHref(game)}" aria-label="Play ${escapeHtml(game.title)}">
      <div class="game-card-art">${thumbnailHtml(game)}</div>
      <div class="game-card-info">
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        <div class="game-card-meta">
          <span class="game-card-cat">${escapeHtml(game.genre)}</span>
          <span class="game-card-rating">${escapeHtml(game.rating)}</span>
        </div>
      </div>
      <div class="game-card-arrow" aria-hidden="true">→</div>
    </a>`;
}

/**
 * Browsing with no filter or search: one headed section per category, so new
 * games land in the right place automatically. Otherwise: a single flat grid.
 */

function renderGrid() {
  const visible = store.games.filter((game) => matchesCategory(game) && matchesQuery(game));

  if (!visible.length) {
    list.innerHTML = '<div class="no-games-found">NOTHING HERE. TRY ANOTHER WORD.</div>';
  } else {
    list.innerHTML = `<div class="games-grid">${visible.map(gameCard).join('')}</div>`;
  }
}


// --- Recently added sidebar -------------------------------------------------

function renderRecent() {
  recentList.innerHTML = getRecent()
    .map(
      (game) => `
      <li class="recent-item">
        <a class="recent-row" href="${gameHref(game)}">
          <div class="recent-thumb">${thumbnailHtml(game)}</div>
          <div class="recent-info">
            <div class="recent-title">${escapeHtml(game.title)}</div>
            <div class="recent-cat">${escapeHtml(game.genre)}</div>
          </div>
          <div class="recent-arrow" aria-hidden="true">→</div>
        </a>
      </li>`,
    )
    .join('');
}

// --- Search dropdown --------------------------------------------------------

export function closeSearch() {
  searchDropdown.classList.remove('active');
}

function renderSearchDropdown() {
  if (!state.query) {
    closeSearch();
    searchDropdown.innerHTML = '';
    return;
  }

  const matches = store.games.filter(matchesQuery);
  searchDropdown.classList.add('active');

  if (!matches.length) {
    searchDropdown.innerHTML = `
      <div class="search-dropdown-header"><span>SEARCH RESULTS</span><span>0 FOUND</span></div>
      <div class="search-dropdown-empty">NO GAMES FOUND MATCHING "${escapeHtml(state.query.toUpperCase())}"</div>`;
    return;
  }

  searchDropdown.innerHTML = `
    <div class="search-dropdown-header"><span>GAMES FOUND (${matches.length})</span><span>CLICK TO PLAY</span></div>
    <ul class="search-dropdown-list">
      ${matches
        .map(
          (game) => `
        <li>
          <a class="search-dropdown-item" href="${gameHref(game)}">
            <div class="search-item-thumb">${thumbnailHtml(game)}</div>
            <div class="search-item-info">
              <div class="search-item-title">${escapeHtml(game.title)}</div>
              <div class="search-item-meta">
                <span class="search-item-cat">${escapeHtml(game.genre)}</span>
                <span class="search-item-rating">${escapeHtml(game.rating)}</span>
              </div>
            </div>
            <span class="search-item-arrow" aria-hidden="true">→</span>
          </a>
        </li>`,
        )
        .join('')}
    </ul>`;
}

function onSearch() {
  state.query = searchInput.value.trim().toLowerCase();
  renderGrid();
  renderSearchDropdown();
}

// --- Setup ------------------------------------------------------------------

export function initCatalog() {
  renderFilters();
  renderGrid();
  renderRecent();

  categoryBar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
    renderGrid();
  });

  searchInput.addEventListener('input', onSearch);
  searchInput.addEventListener('focus', () => state.query && renderSearchDropdown());
  searchInput.addEventListener('keydown', (event) => event.key === 'Escape' && closeSearch());

  // Close the dropdown when clicking anywhere outside the search box.
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-search')) closeSearch();
  });
}
