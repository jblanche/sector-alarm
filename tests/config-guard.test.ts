import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SectorAlarm } from "../src/client.js";
import { SectorAlarmConfigError } from "../src/types.js";
import { mockResponse, mockFetchForLogin } from "./helpers.js";

const NO_CODE_CONFIG = {
  email: "test@example.com",
  password: "test-password",
  panelId: "12345678",
  // panelCode intentionally omitted
} as const;

describe("SectorAlarmConfigError guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("arm without panelCode throws SectorAlarmConfigError", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    await expect(client.arm()).rejects.toThrow(SectorAlarmConfigError);
  });

  it("disarm without panelCode throws SectorAlarmConfigError", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    await expect(client.disarm()).rejects.toThrow(SectorAlarmConfigError);
  });

  it("partialArm without panelCode throws SectorAlarmConfigError", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    await expect(client.partialArm()).rejects.toThrow(SectorAlarmConfigError);
  });

  it("lock without panelCode throws SectorAlarmConfigError", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    await expect(client.lock("LOCK-001")).rejects.toThrow(SectorAlarmConfigError);
  });

  it("unlock without panelCode throws SectorAlarmConfigError", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    await expect(client.unlock("LOCK-001")).rejects.toThrow(SectorAlarmConfigError);
  });

  it("error has correct code property", async () => {
    const client = new SectorAlarm(NO_CODE_CONFIG);
    try {
      await client.arm();
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(SectorAlarmConfigError);
      const configErr = err as InstanceType<typeof SectorAlarmConfigError>;
      expect(configErr.code).toBe("CONFIG_ERROR");
      expect(configErr.message).toContain("panelCode");
    }
  });

  it("read-only endpoints work without panelCode", async () => {
    mockFetchForLogin(mockResponse(200, { IsOnline: true }));

    const client = new SectorAlarm(NO_CODE_CONFIG);
    const result = await client.getPanelStatus();
    expect(result).toEqual({ IsOnline: true });
  });

  it("getTemperatures works without panelCode", async () => {
    mockFetchForLogin(mockResponse(200, []));

    const client = new SectorAlarm(NO_CODE_CONFIG);
    const result = await client.getTemperatures();
    expect(result).toEqual([]);
  });

  it("getPanels works without panelCode", async () => {
    mockFetchForLogin(mockResponse(200, []));

    const client = new SectorAlarm(NO_CODE_CONFIG);
    const result = await client.getPanels();
    expect(result).toEqual([]);
  });
});
