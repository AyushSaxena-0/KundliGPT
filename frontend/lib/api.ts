import { BirthDetails, ChatRequest, ChatResponse, FeedbackRequest, FeedbackResponse, HealthStatus, RootStatus } from "../types";
import { AstrologyDashboardData } from "../types/astrology";

// Base API URL config with fallback to local development
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    const customToken = localStorage.getItem("auth_token");
    if (customToken) return customToken;

    // Extract access_token from standard Supabase localStorage structures
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || "{}");
          if (session?.access_token) return session.access_token;
          if (session?.currentSession?.access_token) return session.currentSession.access_token;
        } catch {}
      }
    }
    return null;
  }

  /**
   * Helper to perform standard HTTP requests with error trapping
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch {
          // Failed to parse JSON error, fallback to status code string
        }
        throw new Error(errorMsg);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.code === "ABORT_ERR" || error?.name === "CanceledError") {
        throw error;
      }
      console.error(`API Request to ${endpoint} failed:`, error);
      throw new Error(error.message || "Network error. Please check your connection.");
    }
  }

  /**
   * Sends a chat message along with session metadata (birth details + history)
   */
  async sendMessage(payload: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async generateChart(payload: BirthDetails, signal?: AbortSignal): Promise<AstrologyDashboardData> {
    return this.request<AstrologyDashboardData>("/api/chart", {
      method: "POST",
      signal,
      body: JSON.stringify(payload),
    });
  }

  async performMarriageMatching(payload: { partner_a: BirthDetails; partner_b: BirthDetails }): Promise<any> {
    return this.request<any>("/api/marriage-matching", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Resets the conversation context and obtains a new session conversationId
   */
  async resetConversation(): Promise<{ conversationId: string }> {
    return this.request<{ conversationId: string }>("/api/reset", {
      method: "POST",
    });
  }

  /**
   * Submits user feedback (rating & comment) linked to a session ID
   */
  async submitFeedback(payload: FeedbackRequest): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Checks the health and uptime metrics of the backend server
   */
  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/health");
  }

  /**
   * Fetches root metadata of the backend server
   */
  async getRootStatus(): Promise<RootStatus> {
    return this.request<RootStatus>("/");
  }

  // ------------------ PROFILE API WRAPPERS ------------------
  async getProfile(): Promise<any> {
    return this.request<any>("/api/profile");
  }

  async updateProfile(name: string): Promise<any> {
    return this.request<any>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  async deleteAccount(): Promise<any> {
    return this.request<any>("/api/profile/account", {
      method: "DELETE",
    });
  }

  async exportData(): Promise<any> {
    return this.request<any>("/api/profile/export");
  }

  // ------------------ BIRTH DETAILS API WRAPPERS ------------------
  async getBirthDetails(): Promise<any[]> {
    return this.request<any[]>("/api/birth-details");
  }

  async saveBirthDetails(payload: any): Promise<any> {
    return this.request<any>("/api/birth-details", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteBirthDetails(id: string): Promise<any> {
    return this.request<any>(`/api/birth-details/${id}`, {
      method: "DELETE",
    });
  }

  // ------------------ CONVERSATIONS HISTORY API WRAPPERS ------------------
  async getConversations(): Promise<any[]> {
    return this.request<any[]>("/api/conversations");
  }

  async renameConversation(id: string, name: string): Promise<any> {
    return this.request<any>(`/api/conversations/${id}/rename`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async deleteConversation(id: string): Promise<any> {
    return this.request<any>(`/api/conversations/${id}`, {
      method: "DELETE",
    });
  }

  async getMessages(id: string): Promise<any[]> {
    return this.request<any[]>(`/api/conversations/${id}/messages`);
  }

  // ------------------ SAVED CHARTS API WRAPPERS ------------------
  async getSavedCharts(): Promise<any[]> {
    return this.request<any[]>("/api/saved-charts");
  }

  async saveChart(label: string, chartData: any): Promise<any> {
    return this.request<any>("/api/saved-charts", {
      method: "POST",
      body: JSON.stringify({ label, chart_data: chartData }),
    });
  }

  async deleteChart(id: string): Promise<any> {
    return this.request<any>(`/api/saved-charts/${id}`, {
      method: "DELETE",
    });
  }

  // ------------------ ADMIN METRICS WRAPPERS ------------------
  async getAdminAnalytics(): Promise<any> {
    return this.request<any>("/api/admin/analytics");
  }

  // ------------------ NEWSLETTER WRAPPER ------------------
  async subscribeNewsletter(email: string, name?: string): Promise<any> {
    return this.request<any>("/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  }
}

// Singleton API instance
export const api = new ApiService(API_BASE_URL);
export default api;
