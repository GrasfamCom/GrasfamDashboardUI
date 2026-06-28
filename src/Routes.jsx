import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { generateRouteConfig } from './Components/Utils/RouteUtils';

const routeConfig = generateRouteConfig();

/**
 * PathAwareRoutes — Resolves the current URL to a route component
 * WITHOUT requiring its own BrowserRouter. Used when DashboardUI is loaded
 * as a Module Federation remote inside the Host's existing Router.
 *
 * Listens for URL changes via:
 * - `popstate` events (browser back/forward)
 * - Monkey-patched `pushState` / `replaceState` (programmatic navigation
 *   from the Host's React Router)
 */
function PathAwareRoutes() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const originalPushState = useRef(null);
  const originalReplaceState = useRef(null);

  // Rebuild the route table from the current menu on every navigation. The menu
  // can land in localStorage *after* this remote first mounts (e.g. the user
  // clicked the sidebar before the menu API responded), so a frozen import-time
  // config would miss routes that exist by the time the user navigates.
  const routeConfig = useMemo(() => generateRouteConfig(), [currentPath]);

  const syncPath = useCallback(() => {
    setCurrentPath((prev) => {
      const next = window.location.pathname;
      return prev !== next ? next : prev;
    });
  }, []);

  useEffect(() => {
    // 1. Listen for browser back / forward
    window.addEventListener('popstate', syncPath);

    // 2. Intercept pushState / replaceState so we detect
    //    Host React-Router navigations that don't fire popstate.
    //    Store originals only once (multiple MFEs could be loaded).
    if (!window.__dashboardMfePatchedHistory) {
      originalPushState.current = window.history.pushState.bind(window.history);
      originalReplaceState.current = window.history.replaceState.bind(window.history);

      window.history.pushState = function patchedPush(...args) {
        originalPushState.current(...args);
        // Dispatch a custom event so all MFEs can listen
        window.dispatchEvent(new Event('mfe-locationchange'));
      };

      window.history.replaceState = function patchedReplace(...args) {
        originalReplaceState.current(...args);
        window.dispatchEvent(new Event('mfe-locationchange'));
      };

      window.__dashboardMfePatchedHistory = true;
    }

    window.addEventListener('mfe-locationchange', syncPath);

    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('mfe-locationchange', syncPath);

      // Restore originals on unmount if we were the one who patched
      if (originalPushState.current && originalReplaceState.current) {
        window.history.pushState = originalPushState.current;
        window.history.replaceState = originalReplaceState.current;
        window.__dashboardMfePatchedHistory = false;
      }
    };
  }, [syncPath]);

  // Normalize a trailing slash so "/Dashboard/" matches the "/Dashboard" route.
  const normalizedPath =
    currentPath.length > 1 && currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;

  // Match current URL to configured routes
  const matchedRoute = routeConfig.routes.find((route) => {
    // Support exact match
    if (route.path === normalizedPath) return true;
    // Support wildcard suffix (e.g. /Dashboard/*)
    if (route.path.endsWith('/*')) {
      const base = route.path.slice(0, -2);
      return normalizedPath === base || normalizedPath.startsWith(base + '/');
    }
    return false;
  });

  // Unknown path, or the menu hasn't loaded yet → hand the user back to the host
  // dashboard instead of a dead-end "Route not found" screen. We can't use
  // <Navigate> here: react-router-dom is NOT a shared singleton across MFEs, so
  // the host's Router context isn't visible to this remote. Drive the host's
  // BrowserRouter via the history API + a popstate event instead.
  useEffect(() => {
    if (!matchedRoute && window.location.pathname !== '/dashboard') {
      window.history.replaceState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [matchedRoute]);

  if (matchedRoute) {
    return matchedRoute.component;
  }

  return null;
}

/**
 * StandaloneRoutes — Full BrowserRouter wrapper.
 * Used only when DashboardUI runs as a standalone app (e.g. dev on port 5178).
 */
function StandaloneRoutes() {
  return (
    <Router>
      <Routes>
        {routeConfig.routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<div>Route not found: {window.location.pathname}</div>} />
      </Routes>
    </Router>
  );
}

/**
 * AppRoutes — Automatically selects the right routing strategy.
 *
 * When loaded as a Module Federation remote inside the Host's Router,
 * uses PathAwareRoutes (no nested BrowserRouter).
 *
 * When running standalone (direct dev or port 5178), uses StandaloneRoutes
 * with its own BrowserRouter.
 */
function AppRoutes() {
  // Detect if we are inside an existing Router context.
  // The Host app renders us inside <BrowserRouter>.
  // When standalone (main.jsx), there is no parent Router.
  // A reliable heuristic: check if the host's root element exists.
  const isRunningAsMFE = !document.getElementById('root')?.dataset?.standalone;

  // If we detect the host root container (id="app"), we're an MFE
  const hostRoot = document.getElementById('app');

  if (hostRoot || isRunningAsMFE) {
    return <PathAwareRoutes />;
  }

  return <StandaloneRoutes />;
}

export { PathAwareRoutes, StandaloneRoutes };
export default AppRoutes;