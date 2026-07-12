import { api } from "../lib/api";

describe("Frontend API Service Layer", () => {
  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = jest.fn();
  });

  it("should successfully send chat requests", async () => {
    const mockResponse = {
      reply: "Based on the stars, your career path looks bright.",
      timestamp: "2026-07-11T23:14:03Z",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const payload = {
      message: "How is my career?",
      conversationId: "8f6a9c1e-f3b2-4d5c-b6e8-3a1b4c7d9e0f",
      birthDetails: { name: "Test User" },
      history: [],
    };

    const res = await api.sendMessage(payload);
    expect(res.reply).toBe(mockResponse.reply);
    expect(res.timestamp).toBe(mockResponse.timestamp);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should successfully trigger reset session requests", async () => {
    const mockResponse = {
      conversationId: "7df4a938-12bc-45f8-b3d9-4a92c4f5a3b9",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await api.resetConversation();
    expect(res.conversationId).toBe(mockResponse.conversationId);
  });

  it("should trap fetch HTTP failure errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: "Database connection failed" }),
    });

    await expect(api.resetConversation()).rejects.toThrow("Database connection failed");
  });
});
