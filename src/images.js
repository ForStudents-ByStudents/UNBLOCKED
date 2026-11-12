import { escapeHtml } from './utils.js';

const PLACEHOLDER = new URL('../assets/placeholder.svg', import.meta.url).href;

const src = (path) => escapeHtml(path || PLACEHOLDER);

/** Card / list thumbnail. The CSS crops it to fit, so any image shape works. */
export const thumbnailHtml = (game) =>
  `<img src="${src(game.thumbnail)}" alt="" width="200" height="120" loading="lazy" decoding="async" />`;

/** Large cover-story image: `cover`, falling back to `thumbnail`. */
export const coverHtml = (game) =>
  `<img src="${src(game.cover || game.thumbnail)}" alt="${escapeHtml(game.title)} artwork" width="340" height="230" decoding="async" />`;

/**
 * If an image path in games.json is wrong or the file is missing, show the
 * placeholder instead of a broken-image icon. (`error` doesn't bubble, so
 * listen in the capture phase.)
 */
export function installImageFallback() {
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img instanceof HTMLImageElement && img.src !== PLACEHOLDER) {
        img.src = PLACEHOLDER;
      }
    },
    true,
  );
}
