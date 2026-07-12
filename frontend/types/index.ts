export interface BirthDetails {
  name?: string;
  gender?: string;
  date_of_birth?: string; // YYYY-MM-DD
  time_of_birth?: string; // HH:MM
  place_of_birth?: string;
  timezone?: string;
}

export interface Message {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string; // ISO 8601
}

export interface Conversation {
  id: string;
  messages: Message[];
  birthDetails: BirthDetails;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  birthDetails?: BirthDetails;
  history?: { role: string; content: string }[];
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  extractedDetails?: BirthDetails;
}

export interface FeedbackRequest {
  rating: number;
  comment?: string;
  conversationId: string;
}

export interface FeedbackResponse {
  status: string;
  message: string;
}

export interface HealthStatus {
  status: string;
  uptime: string;
  uptimeSeconds: number;
  version: string;
  timestamp: string;
}

export interface RootStatus {
  appName: string;
  version: string;
  status: string;
  health: string;
  timestamp: string;
}
