import { apiRequest, buildQuery } from "./apiClient";

export const ratingsApi = {
  async list(gameSlug, filters = {}) {
    const payload = await apiRequest(
      `/games/${gameSlug}/ratings${buildQuery(filters)}`,
    );
    return payload;
  },

  async create(gameSlug, data) {
    const payload = await apiRequest(`/games/${gameSlug}/ratings`, {
      method: "POST",
      body: data,
    });
    return payload.data;
  },

  async update(gameSlug, ratingId, data) {
    const payload = await apiRequest(
      `/games/${gameSlug}/ratings/${ratingId}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return payload.data;
  },

  remove(gameSlug, ratingId) {
    return apiRequest(`/games/${gameSlug}/ratings/${ratingId}`, {
      method: "DELETE",
    });
  },
};
