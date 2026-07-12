"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, BirthDetails, ChatRequest } from "../types";
import { useLocalStorage } from "./useLocalStorage";
import { api } from "../lib/api";

interface ChatContextType {
  messages: Message[];
  birthDetails: BirthDetails;
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  resetConversation: () => Promise<void>;
  updateBirthDetails: (details: BirthDetails) => void;
  submitFeedback: (rating: number, comment?: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useLocalStorage<Message[]>("astrologer_messages", []);
  const [birthDetails, setBirthDetails] = useLocalStorage<BirthDetails>("astrologer_birth_details", {});
  const [conversationId, setConversationId] = useLocalStorage<string | null>("astrologer_conversation_id", null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session conversation ID if absent, or load from URL parameter
  useEffect(() => {
    const initSession = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get("id");
        
        if (urlId && urlId !== conversationId) {
          setIsLoading(true);
          setError(null);
          try {
            const dbMessages = await api.getMessages(urlId);
            const mappedMessages = dbMessages.map((m: any, index: number) => ({
              id: m.id || `msg-${index}-${Date.now()}`,
              role: m.role,
              content: m.content,
              timestamp: m.created_at || new Date().toISOString()
            }));
            setConversationId(urlId);
            setMessages(mappedMessages);
            setIsLoading(false);
            return;
          } catch (err: any) {
            setError("Failed to load conversation history. It may have been deleted.");
            setIsLoading(false);
          }
        }
      }

      if (!conversationId) {
        try {
          const res = await api.resetConversation();
          setConversationId(res.conversationId);
          const greetingText = birthDetails?.name 
            ? `Namaste 🙏\n\nYour birth profile for **${birthDetails.name}** has been saved. You can now ask questions about career, relationships, education, finances, or other areas.`
            : "Namaste 🙏\n\nWelcome to AI Vedic Astrologer.\n\nPlease provide your birth details (Name, Date of Birth, Time, Place of Birth) so I can align your planetary chart, or feel free to ask general questions about astrology, career, relationships, and life guidance.";
          
          const initialGreeting: Message = {
            id: "greeting-0",
            role: "model",
            content: greetingText,
            timestamp: new Date().toISOString()
          };
          setMessages([initialGreeting]);
        } catch (err: any) {
          setError("Failed to initialize astrologer session. Backend may be offline.");
        }
      }
    };
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const clearError = () => setError(null);

  // Send message implementation
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (isLoading) return;

    clearError();
    setIsLoading(true);

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update messages locally before API call
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Map message history into standard API formats (history uses role user/model)
      const apiHistory = updatedMessages.slice(0, -1).slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const requestPayload: ChatRequest = {
        message: userMessage.content,
        conversationId: conversationId || undefined,
        birthDetails: birthDetails,
        history: apiHistory,
      };

      const response = await api.sendMessage(requestPayload);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        content: response.reply,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If backend auto-extracted details, merge them into local storage
      if (response.extractedDetails) {
        setBirthDetails((prev) => ({
          ...prev,
          ...response.extractedDetails
        }));
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      // Rollback last user message if we fail (optional, but standard practice)
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation context
  const resetConversation = async () => {
    setIsLoading(true);
    clearError();
    try {
      const res = await api.resetConversation();
      setConversationId(res.conversationId);
      
      const initialGreeting: Message = {
        id: `greeting-${Date.now()}`,
        role: "model",
        content: "Namaste 🙏\n\nWelcome to AI Vedic Astrologer.\n\nPlease provide your birth details (Name, Date of Birth, Time, Place of Birth) so I can align your planetary chart, or feel free to ask general questions about astrology, career, relationships, and life guidance.",
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreeting]);
    } catch (err: any) {
      setError("Failed to reset session. Please check your backend connections.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update birth details
  const updateBirthDetails = (details: BirthDetails) => {
    setBirthDetails(details);
  };

  // Submit session feedback
  const submitFeedback = async (rating: number, comment?: string) => {
    if (!conversationId) {
      throw new Error("No active conversation session to rate.");
    }
    await api.submitFeedback({
      rating,
      comment,
      conversationId,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        birthDetails,
        conversationId,
        isLoading,
        error,
        sendMessage,
        resetConversation,
        updateBirthDetails,
        submitFeedback,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
