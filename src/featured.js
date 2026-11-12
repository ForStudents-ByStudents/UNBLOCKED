/** The homepage cover story, built from whichever game games.json features. */

import { coverHtml } from './images.js';
import { getFeatured } from './data.js';
import { escapeHtml, gameHref } from './utils.js';

const MAX_BLURB = 150;

const shorten = (text) => (text.length > MAX_BLURB ? `${text.slice(0, MAX_BLURB).trimEnd()}…` : text);

export function renderFeatured() {
  const section = document.getElementById('featuredStory');
  const game = getFeatured();
  section.hidden = !game;
  if (!game) return;

  const title = game.title.toUpperCase();
  const blurb = game.blurb || shorten(game.description);

  section.setAttribute('aria-label', `Featured game: ${game.title}`);
  section.innerHTML = `
    <div class="editors-pick-sticker" aria-hidden="true">
      <span>EDITOR'S</span>
      <span>PICK</span>
      <span class="editors-pick-star">★</span>
    </div>

    <div class="featured-copy">
      <div class="cover-story-badge">FEATURED</div>
      <div class="featured-kicker">THIS WEEK'S BEST GAME</div>

      <div class="featured-title-block">
        <span class="featured-title-text" data-long="${title.length > 9}">${escapeHtml(title)}<span class="featured-title-period">.</span></span>
      </div>

      ${game.subtitle ? `<div class="featured-subtitle">${escapeHtml(game.subtitle)}</div>` : ''}
      ${blurb ? `<p class="featured-desc">${escapeHtml(blurb)}</p>` : ''}

      <div class="featured-tech-box">
        <span class="featured-tech-tag">SHARE WITH FRIENDS</span>
        <div class="featured-tech-note">LET´S SEE WHO´S THE BEST</div>
      </div>
    </div>

    <div class="featured-art-wrapper">
      ${game.annotation ? `<div class="art-annotation" aria-hidden="true"><span>${escapeHtml(game.annotation)}</span><span class="annotation-arrow">⤷</span></div>` : ''}

      <div class="featured-artwork">
        ${coverHtml(game)}
        <div class="stamp-tested" aria-hidden="true">★ FUN GUARANTEED ★</div>
      </div>

      <a class="featured-play-btn" href="${gameHref(game)}">PLAY NOW →</a>
    </div>`;
}
