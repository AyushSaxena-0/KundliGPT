"use client";

import React from "react";
import { Message } from "../../types";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/avatar";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageToolbar } from "./MessageToolbar";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  
  // Parse friendly time format (HH:MM)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={cn("flex w-full gap-3 p-4 md:p-6 transition-all hover:bg-white/[0.01]", {
        "flex-row-reverse justify-start": isUser,
        "justify-start": !isUser,
      })}
    >
      {/* Avatar Icon */}
      <Avatar role={message.role} className="mt-0.5 border-border" />

      {/* Bubble Core */}
      <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]")}>
        {/* Header (Role/Name & Time) */}
        <div
          className={cn("flex items-center gap-2 mb-1.5 text-xs text-mutedText", {
            "justify-end": isUser,
          })}
        >
          <span className="font-semibold font-display">
            {isUser ? "You" : "Vedic Astrologer"}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Bubble content */}
        <div
          className={cn("rounded-2xl px-4 py-3 shadow-sm text-sm md:text-md", {
            // User message styling
            "bg-secondary text-white rounded-tr-none": isUser,
            // Astrologer message styling
            "bg-card text-white border border-border/80 rounded-tl-none glass-card": !isUser,
          })}
        >
          {isUser ? (
            // Simple text rendering for User to preserve exact typing spaces
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            // Markdown rendering for Astrologer replies
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Footer actions for assistant message only */}
        {!isUser && message.id !== "greeting-0" && (
          <MessageToolbar messageId={message.id} content={message.content} />
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
