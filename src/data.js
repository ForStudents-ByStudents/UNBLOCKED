/**
 * Data layer. Everything the site shows comes from data/games.json;
 * this module loads it once, cleans it up, and answers questions about it.
 */

export const store = {
  games: [],
  categories: [],
  featuredId: null,
  recentCount: 4,
};

// Resolved relative to this file, so it works from any folder or sub-path.
const DATA_URL = new URL('../data/games.json', import.meta.url);

/** Fill in defaults so the rest of the code can rely on every field existing. */
function normalizeGame(raw) {
  const category = String(raw.category || raw.genre || 'OTHER').toUpperCase();
  return {
    thumbnail: '',
    cover: '',
    blurb: '',
    annotation: '',
    subtitle: '',
    description: '',
    iframeUrl: '',
    rating: '',
    dateAdded: '',
    ...raw,
    id: String(raw.id),
    title: String(raw.title),
    category,
    genre: String(raw.genre || category).toUpperCase(),
  };
}

export async function loadGames() {
  const response = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`games.json returned ${response.status}`);
  const data = await response.json();

  const seen = new Set();
  store.games = (data.games ?? []).filter((raw) => {
    if (!raw?.id || !raw?.title) {
      console.warn('games.json: skipped an entry without an "id" and "title"', raw);
      return false;
    }
    if (seen.has(raw.id)) {
      console.warn(`games.json: skipped duplicate id "${raw.id}"`);
      return false;
    }
    seen.add(raw.id);
    return true;
  }).map(normalizeGame);

  const site = data.site ?? {};
  store.featuredId = site.featuredGameId ?? null;
  store.recentCount = site.recentCount ?? 4;
  store.categories = orderCategories(
    [...new Set(store.games.map((game) => game.category))],
    (site.categoryOrder ?? []).map((name) => String(name).toUpperCase()),
  );
}

/** Categories listed in `categoryOrder` come first; any new ones follow A-Z. */
function orderCategories(present, preferred) {
  const listed = preferred.filter((name) => present.includes(name));
  const rest = present.filter((name) => !listed.includes(name)).sort();
  return [...listed, ...rest];
}

export const getGame = (id) => store.games.find((game) => game.id === id);

/** The cover story: `site.featuredGameId`, or the first game if unset/unknown. */
export const getFeatured = () => getGame(store.featuredId) ?? store.games[0] ?? null;

/** Newest games first, by `dateAdded` (YYYY-MM-DD). Games without a date sort last. */
export function getRecent() {
  return [...store.games]
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
    .slice(0, store.recentCount);
}

/** Games split into one group per category, in category order. */
export function groupByCategory(games) {
  return store.categories
    .map((category) => ({ category, games: games.filter((game) => game.category === category) }))
    .filter((group) => group.games.length);
}
