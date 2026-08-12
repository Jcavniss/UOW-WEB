import { apiRequest, setAuthToken } from "./apiClient";
import { normalizeUser } from "./normalizers";

function normalizeAuthPayload(payload) {
  return {
    token: payload.data.token,
    user: normalizeUser(payload.data.user),
  };
}

export const authApi = {
  async register(data) {
    const payload = await apiRequest("/register", {
      method: "POST",
      body: data,
    });
    const result = normalizeAuthPayload(payload);
    setAuthToken(result.token);
    return result;
  },

  async login(credentials) {
    const payload = await apiRequest("/login", {
      method: "POST",
      body: credentials,
    });
    const result = normalizeAuthPayload(payload);
    setAuthToken(result.token);
    return result;
  },

  async logout() {
    try {
      await apiRequest("/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  async currentUser() {
    const payload = await apiRequest("/user");
    return normalizeUser(payload.data);
  },

  async updateProfile(data) {
    const payload = await apiRequest("/user/profile", {
      method: "PUT",
      body: data,
    });
    return normalizeUser(payload.data);
  },
};
