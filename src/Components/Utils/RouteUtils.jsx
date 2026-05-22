import Cookies from 'js-cookie';
import { getComponentByName } from './ComponentUtils';

/**
 * Routes that use sub-paths for internal navigation (need /* wildcard).
 * Add a menu name here whenever its component manages its own URL segments.
 */
const WILDCARD_MENU_NAMES = new Set([]);

/**
 * Public fallback routes — accessible to unauthenticated (Guest) users only.
 */
const PUBLIC_ROUTES = [
  { path: '/Dashboard/Overview',         component: getComponentByName('Overview') },
];

export function generateRouteConfig() {
  const rootMenuName = 'Dashboard';
  const dashboard = Cookies.get(rootMenuName);
  let routeConfig = { routes: [] };

  if (!dashboard) {
    return { routes: PUBLIC_ROUTES };
  }

  try {
    const menuCookie = localStorage.getItem('menu');
    if (!menuCookie) {
      return routeConfig;
    }

    const cookieData = menuCookie.replace(/(;?\s*token=[^;]*)/, '');
    if (!cookieData) {
      return routeConfig;
    }

    const decodedData = decodeURIComponent(cookieData);
    const menuArray = decodedData.split(';').map((item) => {
      const parsed = JSON.parse(item.trim());
      return {
        id: parsed.Id,
        menuName: parsed.MenuName,
        menuDesc: parsed.MenuDesc,
        level: parsed.Level,
        parentMenuId: parsed.ParentMenuId,
        sequenceNo: parsed.SequenceNo,
      };
    });

    const menuMap = new Map();
    menuArray.forEach((menu) => {
      if (menu.id) {
        menuMap.set(menu.id, menu);
      }
    });

    const dashboardData = JSON.parse(dashboard);
    if (!dashboardData || typeof dashboardData !== 'object') {
      return routeConfig;
    }

    const mainKey = Object.keys(dashboardData)[0];
    if (!mainKey || !Array.isArray(dashboardData[mainKey])) {
      return routeConfig;
    }

    const leafMenus = dashboardData[mainKey];
    const pathCache = new Map();

    const buildPathFromRoot = (menuItem) => {
      if (!menuItem) {
        return '';
      }

      if (pathCache.has(menuItem.id)) {
        return pathCache.get(menuItem.id);
      }

      if (!menuItem.parentMenuId) {
        const path = `/${menuItem.menuName}`;
        pathCache.set(menuItem.id, path);
        return path;
      }

      const parent = menuMap.get(menuItem.parentMenuId);
      if (parent) {
        const parentPath = buildPathFromRoot(parent);
        const path = `${parentPath}/${menuItem.menuName}`;
        pathCache.set(menuItem.id, path);
        return path;
      }

      const path = `/${menuItem.menuName}`;
      pathCache.set(menuItem.id, path);
      return path;
    };

    const routes = [];
    for (const menu of leafMenus) {
      const menuId = menu.Id || menu.id;
      if (!menuId) continue;

      const fullMenu = menuMap.get(menuId);
      if (!fullMenu) continue;

      const fullPath = buildPathFromRoot(fullMenu);
      const menuName = menu.MenuName || menu.menuName;
      if (!menuName) continue;

      routes.push({
        path: WILDCARD_MENU_NAMES.has(menuName) ? `${fullPath}/*` : fullPath,
        component: getComponentByName(menuName),
      });
    }

    // Add root /Dashboard route so navigating to the parent menu entry renders Overview
    if (!routes.find((r) => r.path === `/${rootMenuName}`)) {
      routes.unshift({
        path: `/${rootMenuName}`,
        component: getComponentByName('Overview'),
      });
    }

    routeConfig = { routes };
  } catch (err) {
    console.error('Failed to parse dashboard route config:', err);
    return { routes: PUBLIC_ROUTES };
  }

  return routeConfig;
}