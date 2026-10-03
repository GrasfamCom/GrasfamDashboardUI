import Cookies from 'js-cookie';

const MENU_PREFIX = 'menu:';

/**
 * The raw menu JSON of one top-level module for the signed-in user, or null.
 *
 * HostUI keeps it in localStorage under `menu:<Module>` (it used to ride in a cookie
 * of the same name). No sign-in token means nobody is signed in, so no menu, even if
 * an entry is still in storage. The cookie is the fallback for a host that has not
 * switched to storage yet.
 */
export const getModuleMenu = (rootMenuName) => {
  if (!Cookies.get('token')) return null;
  try {
    const stored = localStorage.getItem(MENU_PREFIX + rootMenuName);
    if (stored) return stored;
  } catch (error) {
    console.error(`Could not read the ${rootMenuName} menu from storage:`, error);
  }
  return Cookies.get(rootMenuName) ?? null;
};
