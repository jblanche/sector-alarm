import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthManager } from "../src/auth.js";
import { SectorAlarmAuthError } from "../src/types.js";
import { fakeToken, mockResponse } from "./helpers.js";

const BASE_URL = "https://mypagesapi.sectoralarm.net";

describe("AuthManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a token on first call", async () => {
    const token = fakeToken(Math.floor(Date.now() / 1000) + 3600);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: token })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "pass");
    const result = await auth.getToken();

    expect(result).toBe(token);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/Login/Login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ UserId: "user@test.com", Password: "pass" }),
      }),
    );
  });

  it("caches token on subsequent calls", async () => {
    const token = fakeToken(Math.floor(Date.now() / 1000) + 3600);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: token })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "pass");
    await auth.getToken();
    const result = await auth.getToken();

    expect(result).toBe(token);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("refreshes token when close to expiry", async () => {
    const expiredToken = fakeToken(Math.floor(Date.now() / 1000) + 30); // expires in 30s (< 60s buffer)
    const freshToken = fakeToken(Math.floor(Date.now() / 1000) + 3600);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: expiredToken }))
        .mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: freshToken })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "pass");
    const first = await auth.getToken();
    expect(first).toBe(expiredToken);

    const second = await auth.getToken();
    expect(second).toBe(freshToken);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws SectorAlarmAuthError on login failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockResponse(401, { error: "Unauthorized" })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "wrong");

    await expect(auth.getToken()).rejects.toThrow(/Login failed/);
  });

  it("throws SectorAlarmAuthError on invalid JWT payload", async () => {
    const badToken = "header.!!!invalid-base64.signature";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: badToken })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "pass");
    await expect(auth.getToken()).rejects.toThrow();
  });

  it("throws SectorAlarmAuthError on JWT with no payload segment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: "just-a-string" })),
    );

    const auth = new AuthManager(BASE_URL, "user@test.com", "pass");
    await expect(auth.getToken()).rejects.toThrow(SectorAlarmAuthError);
  });
});
