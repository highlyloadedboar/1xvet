const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | "VET";
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | "VET";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiError {
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const error: ApiError = {
        status: res.status,
        message: body.message ?? res.statusText,
      };
      throw error;
    }

    return res.json();
  }

  register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  login(data: LoginRequest): Promise<AuthResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);
