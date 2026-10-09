import Cookies from 'js-cookie';
import { API_URL } from '../../../config/envConfig';

// The module codes that are not products a company can cover (same list as the Host's phone home).
const NOT_A_PRODUCT = ['Account', 'Dashboard', 'SubscriptionGroup'];
const PROFILE_LIFETIME_MS = 30000;

const get = async (path) => {
  const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${Cookies.get('token')}` } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

/** The profile, reusing the call the Host header just made (window.__grasfamProfile, 30 s). */
const loadProfile = () => {
  const held = window.__grasfamProfile;
  if (held && Date.now() - held.at < PROFILE_LIFETIME_MS) return held.promise.then(({ data }) => data);
  return get('/api/v1/host/account/profile');
};

/**
 * The modules a person has no plan of their own for but their company's plan covers: the
 * profile's modules whose access answer comes from the company. Resolves to [] on any failure.
 */
export const loadCoveredModules = async () => {
  try {
    const profile = await loadProfile();
    const codes = (profile?.modules || []).filter((code) => !NOT_A_PRODUCT.includes(code));
    const answers = await Promise.allSettled(codes.map((code) => get(`/api/v1/host/Subscription/access/${code.toLowerCase()}`)));
    return codes.filter((code, index) => {
      const access = answers[index].status === 'fulfilled' ? answers[index].value : null;
      return access?.HasAccess && access?.Source === 'Company';
    });
  } catch {
    return [];
  }
};
