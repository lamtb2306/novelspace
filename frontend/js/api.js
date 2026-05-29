export const API_BASE_URL =
  window.location.hostname === "novel-space.com" ||
  window.location.hostname === "www.novel-space.com"
    ? "https://api.novel-space.com"
    : "http://127.0.0.1:8000";

export const LEGACY_AUDIO_BASE_URL = "https://audio.novel-space.com/";
export const AUDIO_BASE_URL = "https://audio.novel-space.com/";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function normalizeAudioUrl(url) {
  if (typeof url !== "string") return "";
  return url.trim().replace(LEGACY_AUDIO_BASE_URL, AUDIO_BASE_URL);
}

export async function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options);
}
