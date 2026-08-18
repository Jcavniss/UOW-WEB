const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");
const TOKEN_KEY = "gamerdiary_token";

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function buildQuery(parameters = {}) {
  const query = new URLSearchParams();

  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, signal } = options;
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "The GamerDiary API is unavailable. Check that the Laravel server is running.",
      0,
    );
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      setAuthToken(null);
      window.dispatchEvent(new CustomEvent("gamerdiary:unauthorized"));
    }
    throw new ApiError(
      payload.message || "The request could not be completed.",
      response.status,
      payload.errors || {},
    );
  }

  return payload;
}

export function getErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "An unexpected error occurred.";
  }

  const firstValidationMessage = Object.values(error.errors)
    .flat()
    .find(Boolean);

  return firstValidationMessage || error.message;
}
