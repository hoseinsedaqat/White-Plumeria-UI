export type DeskRoute = {
  path: string;
  alias?: string | string[];
};

// GitHub Pages and the docs frame open desks/nuxt/index.html. Nuxt's base URL
// already ends in a slash, so that file is the route /index.html, not /.
export function acceptIndexDocument<T extends DeskRoute>(pages: T[]): T[] {
  const home = pages.find((page) => page.path === '/');
  if (!home) return pages;
  const current =
    home.alias == null ? [] : Array.isArray(home.alias) ? [...home.alias] : [home.alias];
  if (!current.includes('/index.html')) home.alias = [...current, '/index.html'];
  return pages;
}
