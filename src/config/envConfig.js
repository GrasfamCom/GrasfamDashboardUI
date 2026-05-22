const DASHBOARD_API_URL = import.meta.env.VITE_DASHBOARD_API_URL;

if (!DASHBOARD_API_URL) {
  console.warn("VITE_DASHBOARD_API_URL is not defined. Defaulting to localhost:5250.");
}

export const API_URL = DASHBOARD_API_URL || "http://localhost:5250";
