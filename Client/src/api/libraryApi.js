import { apiRequest, buildQuery } from "./apiClient";
import { normalizeLibraryEntry } from "./normalizers";

export const libraryApi = {
  async list(filters = {}) {
    const payload = await apiRequest(`/library${buildQuery(filters)}`);
    return payload.data.map(normalizeLibraryEntry);
  },

  async get(id) {
    const payload = await apiRequest(`/library/${id}`);
    return normalizeLibraryEntry(payload.data);
  },

  async create(data) {
    const payload = await apiRequest("/library", {
      method: "POST",
      body: data,
    });
    return normalizeLibraryEntry(payload.data);
  },

  async update(id, data) {
    const payload = await apiRequest(`/library/${id}`, {
      method: "PATCH",
      body: data,
    });
    return normalizeLibraryEntry(payload.data);
  },

  remove(id) {
    return apiRequest(`/library/${id}`, { method: "DELETE" });
  },
};
