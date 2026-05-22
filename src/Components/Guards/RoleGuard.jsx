import { findMenuByPath } from "../../config/dashboardMenuConfig";
import Cookies from "js-cookie";

/**
 * Derives the current user's role from the Dashboard cookie.
 *
 * @returns {"Guest"|"User"|"Admin"|"MasterAdmin"}
 */
export const deriveUserRole = () => {
  const dashboardCookie = Cookies.get("Dashboard");
  if (!dashboardCookie) return "Guest";

  try {
    const dashboardData = JSON.parse(dashboardCookie);
    const mainKey = Object.keys(dashboardData)[0];
    const leafMenus = dashboardData[mainKey] ?? [];
    const menuNames = leafMenus.map((m) => m.MenuName || m.menuName);

    // Initial logic based on menu presence
    if (menuNames.includes("Reports")) return "Admin";
    if (menuNames.includes("Analytics")) return "User";
    return "Guest";
  } catch {
    return "Guest";
  }
};

/**
 * canAccess — pure permission check.
 *
 * @param {string[]} allowedRoles
 * @param {string} userRole
 * @returns {boolean}
 */
export const canAccess = (allowedRoles, userRole) => {
  return Array.isArray(allowedRoles) && allowedRoles.includes(userRole);
};

/**
 * canAccessPath — check if a user can access a specific route path.
 *
 * @param {string} path
 * @param {string} userRole
 * @returns {boolean}
 */
export const canAccessPath = (path, userRole) => {
  const menuItem = findMenuByPath(path);
  if (!menuItem) return false;
  return canAccess(menuItem.allowedRoles, userRole);
};

/**
 * RoleGuard — Liskov-compliant wrapper component.
 *
 * @param {{ allowedRoles: string[], children: React.ReactNode, showDenied?: boolean }} props
 */
const RoleGuard = ({ allowedRoles, children, showDenied = false }) => {
  const userRole = deriveUserRole();
  const hasAccess = canAccess(allowedRoles, userRole);

  if (hasAccess) {
    return children;
  }

  if (showDenied) {
    return (
      <div className="relative p-8">
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            You do not have permission to view this page.
            <br />
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RoleGuard;
