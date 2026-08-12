import { apiRequest, buildQuery } from "./apiClient";
import { normalizeGame } from "./normalizers";

function normalizeCollection(payload) {
  return {
    games: payload.data.map(normalizeGame),
    meta: payload.meta || null,
  };
}

export const gamesApi = {
  async list(filters = {}, options = {}) {
    const payload = await apiRequest(`/games${buildQuery(filters)}`, options);
    return normalizeCollection(payload);
  },

  async get(slug, options = {}) {
    const payload = await apiRequest(`/games/${slug}`, options);
    return normalizeGame(payload.data);
  },

  async random(filters = {}) {
    const payload = await apiRequest(`/games/random${buildQuery(filters)}`);
    return normalizeGame(payload.data);
  },

  async upcoming(limit = 10) {
    const payload = await apiRequest(
      `/games/upcoming${buildQuery({ limit })}`,
    );
    return payload.data.map(normalizeGame);
  },
};
