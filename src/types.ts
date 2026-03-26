export interface SectorAlarmConfig {
  email: string;
  password: string;
  panelId: string;
  panelCode?: string | undefined;
  baseUrl?: string | undefined;
}

// Auth

export interface LoginRequest {
  UserId: string;
  Password: string;
}

export interface LoginResponse {
  AuthorizationToken: string;
}

// Panel

export interface PanelStatusResponse {
  IsOnline: boolean;
  Status: number;
  AnnexStatus: number;
  ReadyToArm: boolean;
  StatusTime: string;
  StatusTimeUtc: string;
  PanelTimeZoneOffset: number;
  TimeZoneName: string;
}

export interface TemperatureSensor {
  SerialNo: string;
  Label: string;
  Temprature: string; // typo in Sector Alarm API
  DeviceId: string;
}

export interface HumiditySensor {
  SerialNo: string;
  Label: string;
  Humidity: string;
  Temperature: string;
}

export interface LockStatus {
  Serial: string;
  Label: string;
  Status: string;
  SoundLevel: number;
  AutoLockEnabled: boolean;
}

export interface SmartPlugStatus {
  SerialNo: string;
  Label: string;
  Status: string;
}

// Doors & Windows — hierarchical structure from API
export interface ChimeSettings {
  Status: string;
  Sound: string | null;
}

export interface DoorWindowDevice {
  Id: string;
  Name: string;
  Type: number;
  Closed: boolean;
  LowBattery: boolean;
  Alarm: boolean;
  Serial: number;
  SerialString: string;
  LastChanged: string | null;
  MountIndex: number;
  MountType: number;
  ChimeSettings: ChimeSettings;
}

export interface DoorWindowRoom {
  Id: string;
  Name: string;
  FriendlyName: string | null;
  Key: string;
  Index: number;
  Devices: DoorWindowDevice[];
}

export interface DoorWindowFloor {
  Name: string;
  Key: string;
  Rooms: DoorWindowRoom[];
}

export interface DoorsAndWindowsResponse {
  Floors: DoorWindowFloor[];
}

// Panel list

export interface Panel {
  PanelId: string;
  DisplayName: string;
  LegalOwnerName: string;
  AccessGroup: number;
  Status: number;
  InstallationStatus: number;
  IsDefaultPanel: boolean;
  PanelTime: string;
  AlarmSystemStatus: string;
  Vendor: string;
}

// Action requests

export interface ArmRequest {
  PanelId: string;
  PanelCode: string;
  ProfileName?: string | undefined;
}

export interface LockRequest {
  PanelId: string;
  LockSerial: string;
  PanelCode: string;
}

// Errors

export type SectorAlarmError =
  | SectorAlarmAuthError
  | SectorAlarmApiError
  | SectorAlarmConfigError;

export class SectorAlarmAuthError extends Error {
  readonly code = "AUTH_ERROR" as const;
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SectorAlarmAuthError";
    this.status = status;
  }
}

export class SectorAlarmApiError extends Error {
  readonly code = "API_ERROR" as const;
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SectorAlarmApiError";
    this.status = status;
  }
}

export class SectorAlarmConfigError extends Error {
  readonly code = "CONFIG_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "SectorAlarmConfigError";
  }
}
