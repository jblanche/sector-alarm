import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SectorAlarm } from "../src/client.js";
import { SectorAlarmAuthError, SectorAlarmApiError } from "../src/types.js";
import { TEST_CONFIG, VALID_TOKEN, mockResponse, mockFetchForLogin } from "./helpers.js";

const BASE_URL = "https://mypagesapi.sectoralarm.net";

describe("SectorAlarm client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getPanelStatus", () => {
    it("returns panel status", async () => {
      const panelData = {
        IsOnline: true,
        ArmedStatus: "disarmed",
        StatusAnnex: "",
        PanelDisplayName: "Home",
        ArmTime: "2024-01-01T00:00:00",
      };
      mockFetchForLogin(mockResponse(200, panelData));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getPanelStatus();

      expect(result).toEqual(panelData);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/panel/GetPanelStatus?panelId=${TEST_CONFIG.panelId}`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${VALID_TOKEN}`,
          }),
        }),
      );
    });
  });

  describe("getTemperatures", () => {
    it("returns temperature sensors", async () => {
      const temps = [
        { SerialNo: "T1", Label: "Living Room", Temprature: "21.5", DeviceId: "d1" },
      ];
      mockFetchForLogin(mockResponse(200, temps));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getTemperatures();

      expect(result).toEqual(temps);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/panel/GetTemperatures?panelId=${TEST_CONFIG.panelId}`,
        expect.anything(),
      );
    });
  });

  describe("getHumidity", () => {
    it("returns humidity sensors", async () => {
      const humidity = [
        { SerialNo: "H1", Label: "Bathroom", Humidity: "65", Temperature: "22.0" },
      ];
      mockFetchForLogin(mockResponse(200, humidity));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getHumidity();

      expect(result).toEqual(humidity);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/housecheck/panels/${TEST_CONFIG.panelId}/humidity`,
        expect.anything(),
      );
    });
  });

  describe("getDoorsAndWindows", () => {
    it("returns door/window sensors via POST", async () => {
      const doors = [
        { SerialNo: "D1", Label: "Front Door", Status: "closed" },
      ];
      mockFetchForLogin(mockResponse(200, doors));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getDoorsAndWindows();

      expect(result).toEqual(doors);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/housecheck/doorsandwindows`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ panelId: TEST_CONFIG.panelId }),
        }),
      );
    });
  });

  describe("getLocks", () => {
    it("returns lock statuses", async () => {
      const locks = [
        { Serial: "L1", Label: "Front Door", Status: "locked", SoundLevel: 2, AutoLockEnabled: true },
      ];
      mockFetchForLogin(mockResponse(200, locks));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getLocks();

      expect(result).toEqual(locks);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/panel/GetLockStatus?panelId=${TEST_CONFIG.panelId}`,
        expect.anything(),
      );
    });
  });

  describe("getSmartPlugs", () => {
    it("returns smart plug statuses", async () => {
      const plugs = [
        { SerialNo: "SP1", Label: "Lamp", Status: "on" },
      ];
      mockFetchForLogin(mockResponse(200, plugs));

      const client = new SectorAlarm(TEST_CONFIG);
      const result = await client.getSmartPlugs();

      expect(result).toEqual(plugs);
      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/panel/GetSmartplugStatus?panelId=${TEST_CONFIG.panelId}`,
        expect.anything(),
      );
    });
  });

  describe("arm", () => {
    it("sends arm request", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.arm();

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Arm`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
          }),
        }),
      );
    });

    it("includes profile name when provided", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.arm("Night");

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Arm`,
        expect.objectContaining({
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
            ProfileName: "Night",
          }),
        }),
      );
    });
  });

  describe("partialArm", () => {
    it("sends partial arm request", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.partialArm();

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/PartialArm`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
          }),
        }),
      );
    });

    it("includes profile name when provided", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.partialArm("Away");

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/PartialArm`,
        expect.objectContaining({
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
            ProfileName: "Away",
          }),
        }),
      );
    });
  });

  describe("disarm", () => {
    it("sends disarm request", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.disarm();

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Disarm`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
          }),
        }),
      );
    });

    it("includes profile name when provided", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.disarm("Home");

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Disarm`,
        expect.objectContaining({
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            PanelCode: TEST_CONFIG.panelCode,
            ProfileName: "Home",
          }),
        }),
      );
    });
  });

  describe("lock", () => {
    it("sends lock request with serial", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.lock("LOCK-001");

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Lock`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            LockSerial: "LOCK-001",
            PanelCode: TEST_CONFIG.panelCode,
          }),
        }),
      );
    });
  });

  describe("unlock", () => {
    it("sends unlock request with serial", async () => {
      mockFetchForLogin(mockResponse(200, { status: "success" }));

      const client = new SectorAlarm(TEST_CONFIG);
      await client.unlock("LOCK-001");

      expect(fetch).toHaveBeenLastCalledWith(
        `${BASE_URL}/api/Panel/Unlock`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            PanelId: TEST_CONFIG.panelId,
            LockSerial: "LOCK-001",
            PanelCode: TEST_CONFIG.panelCode,
          }),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("throws SectorAlarmAuthError on 401 from data endpoint", async () => {
      const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
      const authErrorResp = mockResponse(401, { error: "Unauthorized" });

      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce(loginResp)
          .mockResolvedValueOnce(authErrorResp),
      );

      const client = new SectorAlarm(TEST_CONFIG);
      await expect(client.getPanelStatus()).rejects.toThrow(SectorAlarmAuthError);
    });

    it("throws SectorAlarmApiError on 500 from data endpoint", async () => {
      const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
      const serverErrorResp = () => mockResponse(500, { error: "Internal Server Error" });

      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce(loginResp)
          .mockResolvedValueOnce(serverErrorResp())
          .mockResolvedValueOnce(serverErrorResp())
          .mockResolvedValueOnce(serverErrorResp()),
      );

      const client = new SectorAlarm(TEST_CONFIG);
      await expect(client.getPanelStatus()).rejects.toThrow(SectorAlarmApiError);
    });

    it("throws SectorAlarmAuthError when login fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValueOnce(mockResponse(403, { error: "Forbidden" })),
      );

      const client = new SectorAlarm(TEST_CONFIG);
      await expect(client.getPanelStatus()).rejects.toThrow(SectorAlarmAuthError);
    });

    it("SectorAlarmApiError has correct status", async () => {
      const loginResp = mockResponse(200, { AuthorizationToken: VALID_TOKEN });
      const errorResp = () => mockResponse(503, { error: "Service Unavailable" });

      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce(loginResp)
          .mockResolvedValueOnce(errorResp())
          .mockResolvedValueOnce(errorResp())
          .mockResolvedValueOnce(errorResp()),
      );

      const client = new SectorAlarm(TEST_CONFIG);
      try {
        await client.getPanelStatus();
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(SectorAlarmApiError);
        const apiErr = err as InstanceType<typeof SectorAlarmApiError>;
        expect(apiErr.status).toBe(503);
        expect(apiErr.code).toBe("API_ERROR");
      }
    });

    it("SectorAlarmAuthError has correct status and code", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValueOnce(mockResponse(401, {})),
      );

      const client = new SectorAlarm(TEST_CONFIG);
      try {
        await client.getPanelStatus();
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(SectorAlarmAuthError);
        const authErr = err as InstanceType<typeof SectorAlarmAuthError>;
        expect(authErr.status).toBe(401);
        expect(authErr.code).toBe("AUTH_ERROR");
      }
    });
  });

  describe("custom base URL", () => {
    it("uses custom base URL when provided", async () => {
      const customUrl = "https://custom.api.example.com";
      const token = VALID_TOKEN;

      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce(mockResponse(200, { AuthorizationToken: token }))
          .mockResolvedValueOnce(mockResponse(200, { IsOnline: true })),
      );

      const client = new SectorAlarm({ ...TEST_CONFIG, baseUrl: customUrl });
      await client.getPanelStatus();

      expect(fetch).toHaveBeenCalledWith(
        `${customUrl}/api/Login/Login`,
        expect.anything(),
      );
      expect(fetch).toHaveBeenLastCalledWith(
        `${customUrl}/api/panel/GetPanelStatus?panelId=${TEST_CONFIG.panelId}`,
        expect.anything(),
      );
    });
  });
});
