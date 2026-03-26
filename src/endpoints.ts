import {
  SectorAlarmApiError,
  SectorAlarmAuthError,
} from "./types.js";
import type { AuthManager } from "./auth.js";

export async function apiGet<T>(
  auth: AuthManager,
  baseUrl: string,
  path: string,
): Promise<T> {
  const token = await auth.getToken();

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(
  auth: AuthManager,
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<T> {
  const token = await auth.getToken();

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new SectorAlarmAuthError("Unauthorized", 401);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new SectorAlarmApiError(
      `API error ${response.status}: ${text}`,
      response.status,
    );
  }

  // response.json() returns Promise<unknown> — we trust the API shape here.
  // Callers are responsible for providing the correct generic type T.
  const data: unknown = await response.json();
  return data as T;
}
