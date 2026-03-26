import { SectorAlarmAuthError } from "./types.js";
import type { LoginRequest, LoginResponse } from "./types.js";

interface JwtPayload {
  exp: number;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split(".");
  const payload = parts[1];
  if (!payload) {
    throw new SectorAlarmAuthError("Invalid JWT: missing payload", 0);
  }
  const decoded = Buffer.from(payload, "base64url").toString("utf-8");
  return JSON.parse(decoded) as JwtPayload;
}

export class AuthManager {
  private token: string | null = null;
  private expiresAt = 0;
  private loginPromise: Promise<string> | null = null;
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly password: string;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
  }

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt - 60_000) {
      return this.token;
    }
    if (this.loginPromise) {
      return this.loginPromise;
    }
    this.loginPromise = this.login().finally(() => {
      this.loginPromise = null;
    });
    return this.loginPromise;
  }

  private async login(): Promise<string> {
    const body: LoginRequest = {
      UserId: this.email,
      Password: this.password,
    };

    const response = await fetch(`${this.baseUrl}/api/Login/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new SectorAlarmAuthError(
        `Login failed: ${response.statusText}`,
        response.status,
      );
    }

    const data = (await response.json()) as LoginResponse;
    this.token = data.AuthorizationToken;

    const payload = decodeJwtPayload(this.token);
    this.expiresAt = payload.exp * 1000;

    return this.token;
  }
}
