import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthManager } from "../src/auth.js";
import { fakeToken, mockResponse } from "./helpers.js";

const BASE_URL = "https://mypagesapi.sectoralarm.net";

describe("AuthManager concurrent login dedup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("3 simultaneous calls with expired token result in exactly 1 login", async () => {
    const token = fakeToken(Math.floor(Date.now() / 1000) + 3600);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(200, { AuthorizationToken: token }),
      ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");

    // Fire 3 concurrent getToken calls — all should share one login
    const [t1, t2, t3] = await Promise.all([
      auth.getToken(),
      auth.getToken(),
      auth.getToken(),
    ]);

    expect(t1).toBe(token);
    expect(t2).toBe(token);
    expect(t3).toBe(token);
    // Only 1 login call
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("second batch after expiry triggers exactly 1 more login", async () => {
    // First token expires immediately (within 60s margin)
    const shortToken = fakeToken(Math.floor(Date.now() / 1000) + 10);
    const freshToken = fakeToken(Math.floor(Date.now() / 1000) + 3600);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          mockResponse(200, { AuthorizationToken: shortToken }),
        )
        .mockResolvedValue(
          mockResponse(200, { AuthorizationToken: freshToken }),
        ),
    );

    const auth = new AuthManager(BASE_URL, "u@t.com", "p");

    // First call: login
    await auth.getToken();
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second batch: token is within margin, 3 concurrent calls
    const results = await Promise.all([
      auth.getToken(),
      auth.getToken(),
      auth.getToken(),
    ]);

    expect(results).toEqual([freshToken, freshToken, freshToken]);
    // 1 original login + 1 refresh = 2 total
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
