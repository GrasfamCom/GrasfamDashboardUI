/**
 * dashboardMenuConfig.js
 *
 * Single source of truth for the Dashboard module's menu structure and role permissions.
 * Open/Closed principle: adding a new menu item requires ONLY a new entry here —
 * no changes to any component or guard logic.
 *
 * Roles: "Guest" | "User" | "Admin" | "MasterAdmin"
 */

export const DASHBOARD_ROLES = {
  GUEST: "Guest",
  USER: "User",
  ADMIN: "Admin",
  MASTER_ADMIN: "MasterAdmin",
};

const ALL_ROLES = [
  DASHBOARD_ROLES.GUEST,
  DASHBOARD_ROLES.USER,
  DASHBOARD_ROLES.ADMIN,
  DASHBOARD_ROLES.MASTER_ADMIN,
];

const USER_AND_ABOVE = [
  DASHBOARD_ROLES.USER,
  DASHBOARD_ROLES.ADMIN,
  DASHBOARD_ROLES.MASTER_ADMIN,
];

const ADMIN_AND_ABOVE = [
  DASHBOARD_ROLES.ADMIN,
  DASHBOARD_ROLES.MASTER_ADMIN,
];

/**
 * @typedef {Object} DashboardMenuItem
 * @property {string} menuName      - Matches the MenuName from the database seed / cookie
 * @property {string} path          - Full URL path
 * @property {string} icon          - Unicode emoji used as icon (no external icon library)
 * @property {string} label         - Display label shown in UI
 * @property {string[]} allowedRoles - Roles that may access this route
 * @property {DashboardMenuItem[]} children - Nested menu items (optional)
 */

/** @type {DashboardMenuItem[]} */
export const dashboardMenuConfig = [
  {
    menuName: "Overview",
    path: "/Dashboard/Overview",
    icon: "📊",
    label: "Overview",
    allowedRoles: ALL_ROLES,
    children: [],
  },
  {
    menuName: "Analytics",
    path: "/Dashboard/Analytics",
    icon: "📈",
    label: "Analytics",
    allowedRoles: USER_AND_ABOVE,
    children: [],
  },
  {
    menuName: "Reports",
    path: "/Dashboard/Reports",
    icon: "📋",
    label: "Reports",
    allowedRoles: ADMIN_AND_ABOVE,
    children: [],
  },
];

/**
 * Returns a flat list of all menu items (including children) for lookup.
 * @returns {DashboardMenuItem[]}
 */
export const flattenMenuConfig = () => {
  const result = [];
  const flatten = (items) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children?.length > 0) {
        flatten(item.children);
      }
    });
  };
  flatten(dashboardMenuConfig);
  return result;
};

/**
 * Find a menu item config by its path.
 * @param {string} path
 * @returns {DashboardMenuItem | undefined}
 */
export const findMenuByPath = (path) => {
  return flattenMenuConfig().find((item) => item.path === path);
};
