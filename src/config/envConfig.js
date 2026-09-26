// A deployed site must never fall back to localhost: Chrome asks the visitor for
// "Access other apps and services on this device" when a public page calls it.
const DEPLOYED_API_URLS = {
  "app-dev.grasfam.com": "https://api-dev.grasfam.com",
  "app-stg.grasfam.com": "https://api-stg.grasfam.com",
  "app.grasfam.com": "https://api.grasfam.com",
};

export const API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL ||
  DEPLOYED_API_URLS[window.location.hostname] ||
  "http://localhost:5250";
