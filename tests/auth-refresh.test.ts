import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthManager } from "../src/auth.js";
import { fakeToken, mockResponse } from "./helpers.js";

const BASE_URL = "https://mypagesapi.sectoralarm.net";

describe("AuthManager token refresh", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reuses a valid token without calling login again", async () => {
    const token = fakeToken(Math.floor(Date.now() / 1000) + 3600);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        mockResponse(200, { AuthorizationToken: token }),
      ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");
    const t1 = await auth.getToken();
    const t2 = await auth.getToken();
    const t3 = await auth.getToken();

    expect(t1).toBe(token);
    expect(t2).toBe(token);
    expect(t3).toBe(token);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("triggers login when token is fully expired", async () => {
    // Token already expired 10 seconds ago
    const expiredToken = fakeToken(Math.floor(Date.now() / 1000) - 10);
    const freshToken = fakeToken(Math.floor(Date.now() / 1000) + 3600);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          mockResponse(200, { AuthorizationToken: expiredToken }),
        )
        .mockResolvedValueOnce(
          mockResponse(200, { AuthorizationToken: freshToken }),
        ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");
    const t1 = await auth.getToken();
    expect(t1).toBe(expiredToken);

    const t2 = await auth.getToken();
    expect(t2).toBe(freshToken);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("triggers login when token expires within 60s margin", async () => {
    // Token expires in 30 seconds — within the 60s safety margin
    const soonToken = fakeToken(Math.floor(Date.now() / 1000) + 30);
    const freshToken = fakeToken(Math.floor(Date.now() / 1000) + 3600);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          mockResponse(200, { AuthorizationToken: soonToken }),
        )
        .mockResolvedValueOnce(
          mockResponse(200, { AuthorizationToken: freshToken }),
        ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");
    const t1 = await auth.getToken();
    expect(t1).toBe(soonToken);

    // Second call should re-login because 30s < 60s margin
    const t2 = await auth.getToken();
    expect(t2).toBe(freshToken);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does NOT re-login when token expires in >60s", async () => {
    // Token expires in 120 seconds — safely outside the 60s margin
    const goodToken = fakeToken(Math.floor(Date.now() / 1000) + 120);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        mockResponse(200, { AuthorizationToken: goodToken }),
      ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");
    await auth.getToken();
    const t2 = await auth.getToken();

    expect(t2).toBe(goodToken);
    expect(fetch).toHaveBeenCalledOnce();
  });
});
