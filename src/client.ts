import { AuthManager } from "./auth.js";
import { apiGet, apiPost } from "./endpoints.js";
import type {
  SectorAlarmConfig,
  PanelStatusResponse,
  TemperatureSensor,
  HumiditySensor,
  LockStatus,
  SmartPlugStatus,
  DoorWindowSensor,
  ArmRequest,
  LockRequest,
} from "./types.js";

const DEFAULT_BASE_URL = "https://mypagesapi.sectoralarm.net";

export class SectorAlarm {
  private readonly auth: AuthManager;
  private readonly baseUrl: string;
  private readonly panelId: string;
  private readonly panelCode: string;

  constructor(config: SectorAlarmConfig) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.panelId = config.panelId;
    this.panelCode = config.panelCode;
    this.auth = new AuthManager(this.baseUrl, config.email, config.password);
  }

  async getPanelStatus(): Promise<PanelStatusResponse> {
    return apiGet<PanelStatusResponse>(
      this.auth,
      this.baseUrl,
      `/api/panel/GetPanelStatus?panelId=${this.panelId}`,
    );
  }

  async getTemperatures(): Promise<TemperatureSensor[]> {
    return apiGet<TemperatureSensor[]>(
      this.auth,
      this.baseUrl,
      `/api/panel/GetTemperatures?panelId=${this.panelId}`,
    );
  }

  async getHumidity(): Promise<HumiditySensor[]> {
    return apiGet<HumiditySensor[]>(
      this.auth,
      this.baseUrl,
      `/api/housecheck/panels/${this.panelId}/humidity`,
    );
  }

  async getDoorsAndWindows(): Promise<DoorWindowSensor[]> {
    return apiPost<DoorWindowSensor[]>(
      this.auth,
      this.baseUrl,
      "/api/housecheck/doorsandwindows",
      { panelId: this.panelId },
    );
  }

  async getLocks(): Promise<LockStatus[]> {
    return apiGet<LockStatus[]>(
      this.auth,
      this.baseUrl,
      `/api/panel/GetLockStatus?panelId=${this.panelId}`,
    );
  }

  async getSmartPlugs(): Promise<SmartPlugStatus[]> {
    return apiGet<SmartPlugStatus[]>(
      this.auth,
      this.baseUrl,
      `/api/panel/GetSmartplugStatus?panelId=${this.panelId}`,
    );
  }

  async arm(profileName?: string): Promise<unknown> {
    const body: ArmRequest = {
      PanelId: this.panelId,
      PanelCode: this.panelCode,
    };
    if (profileName !== undefined) {
      body.ProfileName = profileName;
    }
    return apiPost(this.auth, this.baseUrl, "/api/Panel/Arm", body);
  }

  async partialArm(profileName?: string): Promise<unknown> {
    const body: ArmRequest = {
      PanelId: this.panelId,
      PanelCode: this.panelCode,
    };
    if (profileName !== undefined) {
      body.ProfileName = profileName;
    }
    return apiPost(this.auth, this.baseUrl, "/api/Panel/PartialArm", body);
  }

  async disarm(profileName?: string): Promise<unknown> {
    const body: ArmRequest = {
      PanelId: this.panelId,
      PanelCode: this.panelCode,
    };
    if (profileName !== undefined) {
      body.ProfileName = profileName;
    }
    return apiPost(this.auth, this.baseUrl, "/api/Panel/Disarm", body);
  }

  async lock(lockSerial: string): Promise<unknown> {
    const body: LockRequest = {
      PanelId: this.panelId,
      LockSerial: lockSerial,
      PanelCode: this.panelCode,
    };
    return apiPost(this.auth, this.baseUrl, "/api/Panel/Lock", body);
  }

  async unlock(lockSerial: string): Promise<unknown> {
    const body: LockRequest = {
      PanelId: this.panelId,
      LockSerial: lockSerial,
      PanelCode: this.panelCode,
    };
    return apiPost(this.auth, this.baseUrl, "/api/Panel/Unlock", body);
  }
}
