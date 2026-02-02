import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL; // must end with /api/

if (!API_BASE) {
  console.warn("Missing REACT_APP_API_URL. Set it in .env and Vercel env vars.");
}

const BACKEND_ORIGIN = API_BASE ? new URL(API_BASE).origin : "";

export { BACKEND_ORIGIN };

export const api = axios.create({
  baseURL: API_BASE,
});

// ---- Token helpers ----
export function getAccessToken() {
  return localStorage.getItem("access_token");
}
export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ---- Request interceptor: attach access token ----
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response interceptor: refresh once on 401 ----
let refreshing = false;
let queued = [];

function queueRequest(cb) {
  queued.push(cb);
}
function runQueue(newToken) {
  queued.forEach((cb) => cb(newToken));
  queued = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = getRefreshToken();
      if (!refresh) return Promise.reject(error);

      if (refreshing) {
        return new Promise((resolve) => {
          queueRequest((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      refreshing = true;
      try {
        // ✅ Use backend origin from env var (works on Vercel + local)
        const resp = await axios.post(`${BACKEND_ORIGIN}/api/token/refresh/`, {
          refresh,
        });

        const newAccess = resp.data.access;
        setTokens({ access: newAccess });

        runQueue(newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        clearTokens();
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
