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

export type PetSpecies = "DOG" | "CAT" | "BIRD" | "RODENT" | "REPTILE" | "OTHER";

export interface PetResponse {
  id: number;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  weight?: number;
  ownerId: number;
}

export interface CreatePetRequest {
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  weight?: number;
}

export interface UpdatePetRequest {
  name?: string;
  species?: PetSpecies;
  breed?: string;
  birthDate?: string;
  weight?: number;
}

export interface VetProfileResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialty: string;
  experienceYears: number;
  description?: string;
  education?: string;
  priceRub?: number;
  available: boolean;
}

export interface SearchVetsParams {
  specialty?: string;
  available?: boolean;
}

export interface SlotResponse {
  id: number;
  vetId: number;
  startTime: string;
  booked: boolean;
}

export type AppointmentStatus = "BOOKED" | "CANCELLED";

export interface AppointmentResponse {
  id: number;
  slotId: number;
  slotStartTime: string;
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  vetProfileId: number;
  vetFirstName: string;
  vetLastName: string;
  petId?: number;
  petName?: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  slotId: number;
  petId?: number;
  reason?: string;
}

export interface ConversationResponse {
  id: number;
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  vetId: number;
  vetFirstName: string;
  vetLastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
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

  getMyPets(): Promise<PetResponse[]> {
    return this.request("/api/pets");
  }

  createPet(data: CreatePetRequest): Promise<PetResponse> {
    return this.request("/api/pets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updatePet(petId: number, data: UpdatePetRequest): Promise<PetResponse> {
    return this.request(`/api/pets/${petId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deletePet(petId: number): Promise<void> {
    return this.request(`/api/pets/${petId}`, {
      method: "DELETE",
    });
  }

  searchVets(params: SearchVetsParams = {}): Promise<VetProfileResponse[]> {
    const query = new URLSearchParams();
    if (params.specialty) query.set("specialty", params.specialty);
    if (params.available !== undefined) {
      query.set("available", String(params.available));
    }
    const qs = query.toString();
    return this.request(`/api/vets${qs ? `?${qs}` : ""}`);
  }

  getVet(vetId: number): Promise<VetProfileResponse> {
    return this.request(`/api/vets/${vetId}`);
  }

  listConversations(): Promise<ConversationResponse[]> {
    return this.request("/api/conversations");
  }

  createConversation(otherUserId: number): Promise<ConversationResponse> {
    return this.request("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ otherUserId }),
    });
  }

  listMessages(conversationId: number): Promise<MessageResponse[]> {
    return this.request(`/api/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, content: string): Promise<MessageResponse> {
    return this.request(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  listVetSlots(vetId: number, from?: string, to?: string): Promise<SlotResponse[]> {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const qs = query.toString();
    return this.request(`/api/vets/${vetId}/slots${qs ? `?${qs}` : ""}`);
  }

  createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    return this.request("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  listMyAppointments(): Promise<AppointmentResponse[]> {
    return this.request("/api/appointments");
  }

  cancelAppointment(appointmentId: number): Promise<AppointmentResponse> {
    return this.request(`/api/appointments/${appointmentId}/cancel`, {
      method: "POST",
    });
  }
}

export const api = new ApiClient(API_URL);
