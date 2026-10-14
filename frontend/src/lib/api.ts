// Sends JSON to one of the BACKEND's API endpoints and always returns a predictable result.
// The backend runs separately (see ../backend). Its address comes from the environment
// variable NEXT_PUBLIC_API_URL in frontend/.env.local, for example http://localhost:4000.
// The future mobile app can call the very same endpoints (/api/booking, /api/contact).

import type { ApiResponse } from "@/types";

// Falls back to the local backend so `npm run dev` works out of the box.
// NOTE: NEXT_PUBLIC_ variables are baked in when you run `npm run build`,
// so set NEXT_PUBLIC_API_URL BEFORE building for production.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  "",
);

/** `path` is the endpoint on the backend, for example "/api/booking". */
export async function postJson<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      ok: false,
      message: "Something went wrong. Please check your connection and try again.",
    };
  }
}
