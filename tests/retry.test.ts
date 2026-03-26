import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SectorAlarm } from "../src/client.js";
import { withRetry } from "../src/endpoints.js";
import { SectorAlarmApiError, SectorAlarmAuthError } from "../src/types.js";
import { TEST_CONFIG, VALID_TOKEN, mockResponse } from "./helpers.js";

describe("withRetry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retries up to 3 times on SectorAlarmApiError (5xx)", async () => {
    const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
    const err500 = mockResponse(500, { error: "Internal Server Error" });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(loginResp)
        .mockResolvedValueOnce(err500)
        .mockResolvedValueOnce(err500)
        .mockResolvedValueOnce(err500),
    );

    const client = new SectorAlarm(TEST_CONFIG);
    await expect(client.getPanelStatus()).rejects.toThrow(SectorAlarmApiError);
    // 1 login + 3 API attempts
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("does NOT retry on SectorAlarmAuthError (401)", async () => {
    const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
    const err401 = mockResponse(401, { error: "Unauthorized" });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(loginResp)
        .mockResolvedValueOnce(err401),
    );

    const client = new SectorAlarm(TEST_CONFIG);
    await expect(client.getPanelStatus()).rejects.toThrow(SectorAlarmAuthError);
    // 1 login + 1 API attempt (no retry)
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries on fetch rejection (network error)", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new SectorAlarmApiError("Network error", 0))
      .mockRejectedValueOnce(new SectorAlarmApiError("Network error", 0))
      .mockRejectedValueOnce(new SectorAlarmApiError("Network error", 0));

    await expect(
      withRetry(fn, { attempts: 3, delayMs: 0 }),
    ).rejects.toThrow(SectorAlarmApiError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("succeeds on 2nd attempt after a 5xx", async () => {
    const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
    const err500 = mockResponse(500, { error: "Server Error" });
    const okResp = mockResponse(200, { IsOnline: true });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(loginResp)
        .mockResolvedValueOnce(err500)
        // retry: getToken returns cached token, then API succeeds
        .mockResolvedValueOnce(okResp),
    );

    const client = new SectorAlarm(TEST_CONFIG);
    const result = await client.getPanelStatus();
    expect(result).toEqual({ IsOnline: true });
    // 1 login + 2 API calls (fail then succeed)
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry non-SectorAlarmApiError errors", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new TypeError("unexpected"));

    await expect(
      withRetry(fn, { attempts: 3, delayMs: 0 }),
    ).rejects.toThrow(TypeError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
