export interface SectorAlarmConfig {
  email: string;
  password: string;
  panelId: string;
  panelCode: string;
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
  ArmedStatus: string;
  StatusAnnex: string;
  PanelDisplayName: string;
  ArmTime: string;
  [key: string]: unknown;
}

export interface TemperatureSensor {
  SerialNo: string;
  Label: string;
  Temprature: string;
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

export interface DoorWindowSensor {
  SerialNo: string;
  Label: string;
  Status: string;
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

// Discriminated union for API results

interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiFailure {
  ok: false;
  error: SectorAlarmError;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// Errors

export type SectorAlarmError = SectorAlarmAuthError | SectorAlarmApiError;

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
