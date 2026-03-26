import { vi } from "vitest";

/** Encode a JWT with the given payload (no signature verification needed for tests). */
export function fakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fake-signature`;
}

/** Create a JWT that expires at the given unix timestamp (seconds). */
export function fakeToken(expSeconds: number): string {
  return fakeJwt({ exp: expSeconds, sub: "test@example.com" });
}

/** Create a mock Response object. */
export function mockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status === 200 ? "OK" : `Error ${status}`,
    headers: { "Content-Type": "application/json" },
  });
}

/** Standard test config. */
export const TEST_CONFIG = {
  email: "test@example.com",
  password: "test-password",
  panelId: "12345678",
  panelCode: "1234",
} as const;

/** Token that expires far in the future. */
export const VALID_TOKEN = fakeToken(Math.floor(Date.now() / 1000) + 3600);

/** Set up fetch mock that handles login + one data call. */
export function mockFetchForLogin(dataResponse: Response): void {
  const loginResponse = mockResponse(200, { AuthorizationToken: VALID_TOKEN });

  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockResolvedValueOnce(loginResponse)
      .mockResolvedValueOnce(dataResponse),
  );
}
