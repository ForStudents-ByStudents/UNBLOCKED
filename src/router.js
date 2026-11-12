/**
 * Tiny hash router. Routes:
 *   #/             home
 *   #/games        home, scrolled to the game index
 *   #/game/<id>    a game's page
 * Because every link is a plain <a href="#/...">, there are no click handlers
 * to wire up and the back button, middle-click and deep links just work.
 */

export function parseRoute(hash = window.location.hash) {
  const game = hash.match(/^#\/game\/([^/]+)$/);
  if (game) return { name: 'game', id: decodeURIComponent(game[1]) };
  if (hash === '#/games') return { name: 'games' };
  return { name: 'home' };
}

export function startRouter(onRoute) {
  const run = () => onRoute(parseRoute());
  window.addEventListener('hashchange', run);
  run();
}
