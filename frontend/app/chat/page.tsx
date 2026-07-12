"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, XCircle, FileDown, Printer } from "lucide-react";
import { Sidebar } from "../../components/layout/Sidebar";
import { useChat } from "../../hooks/useChat";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { ChatBubble } from "../../components/chat/ChatBubble";
import { TypingIndicator } from "../../components/chat/TypingIndicator";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { BirthDetailsForm } from "../../components/chat/BirthDetailsForm";
import { AstrologyDashboard } from "../../components/dashboard/AstrologyDashboard";

export default function ChatPage() {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error, 
    resetConversation,
    clearError,
    birthDetails,
    conversationId
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const params = new URLSearchParams(window.location.search);
      const prePrompt = params.get("prompt");
      if (prePrompt) {
        setInputText(decodeURIComponent(prePrompt));
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isMounted]);

  const exportToMarkdown = () => {
    if (messages.length === 0) return;
    let content = `# AI Vedic Astrologer - Consultation Report\n\n`;
    content += `*Generated on: ${new Date().toLocaleString()}*\n`;
    if (birthDetails && birthDetails.name) {
      content += `\n## Birth Chart Profile\n`;
      content += `- **Name**: ${birthDetails.name}\n`;
      content += `- **Gender**: ${birthDetails.gender || "N/A"}\n`;
      content += `- **Date of Birth**: ${birthDetails.date_of_birth || "N/A"}\n`;
      content += `- **Time of Birth**: ${birthDetails.time_of_birth || "N/A"}\n`;
      content += `- **Place of Birth**: ${birthDetails.place_of_birth || "N/A"}\n`;
      content += `- **Timezone**: ${birthDetails.timezone || "N/A"}\n`;
    }
    content += `\n## Conversation Transcript\n\n`;
    messages.forEach((msg) => {
      const roleName = msg.role === "user" ? "User" : "Vedic Astrologer (AI)";
      content += `### ${roleName}\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `astrology_consultation_${conversationId || "session"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };
  const [inputText, setInputText] = useState("");
  const [scrollRef, scrollToBottom] = useAutoScroll<HTMLDivElement>([messages, isLoading]);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If not mounted yet, render a baseline frame to match the server pre-render
  if (!isMounted) {
    return (
      <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden bg-background">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 flex flex-col justify-center items-center p-4 bg-[#09090F] select-none" />
      </div>
    );
  }

  // If birth details are not set, show the welcome onboarding screen in the center
  if (!birthDetails?.name) {
    return (
      <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden bg-background">
        {/* Sidebar remains fully accessible */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 flex flex-col justify-center items-center p-4 md:p-6 overflow-y-auto relative bg-[#09090F] select-none">
          {/* Cosmic background blur glows */}
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />
          
          <div className="w-full max-w-xl z-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-accent mb-2">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
                🔮 Generate Your Free Kundli
              </h1>
              <p className="text-xs md:text-sm text-mutedText max-w-md mx-auto">
                Consult our wise AI Vedic Astrologer. Enter your birth details below to align your planetary coordinates and start your consultation.
              </p>
            </div>
            
            <BirthDetailsForm />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-background lg:flex-row">
      
      {/* Collapsible Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Chat Frame */}
      <main className="flex min-w-0 flex-1 basis-full flex-col h-full overflow-hidden relative lg:basis-[47%]">
        
        {/* Decorative background effects */}
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-[90px] pointer-events-none" />

        {/* Top Mini Header / Status */}
        <div className="h-12 border-b border-border/60 bg-card/10 flex items-center justify-between px-6 shrink-0 relative z-10 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-white font-display">Astrological Reading</span>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 1 && (
              <>
                <button
                  onClick={exportToMarkdown}
                  className="text-xs text-mutedText hover:text-white flex items-center gap-1 transition-all focus:outline-none"
                  title="Export chat as Markdown"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export MD</span>
                </button>
                <button
                  onClick={triggerPrint}
                  className="text-xs text-mutedText hover:text-white flex items-center gap-1 transition-all focus:outline-none"
                  title="Export chat as PDF / Print"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Print / PDF</span>
                </button>
              </>
            )}
            <button
              onClick={resetConversation}
              className="text-xs text-mutedText hover:text-white flex items-center gap-1 transition-all focus:outline-none"
              title="Reset active chat logs"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Errors Banner */}
        {error && (
          <div className="bg-rose-950/60 border-b border-rose-500/20 px-6 py-2 flex items-center justify-between gap-4 text-sm text-rose-300 relative z-10">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={clearError}
              className="text-xs font-semibold hover:underline text-rose-400 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages viewport */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto divide-y divide-border/20 relative z-10"
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Input box section */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-background to-transparent shrink-0 relative z-10">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-end gap-2 p-2 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md glass-panel focus-within:border-primary/60 transition-all shadow-lg">
              
              {/* Message Input Box */}
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your astrology question (e.g., 'Will my career improve next year?')..."
                className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none p-2 text-sm md:text-md text-white min-h-[40px] max-h-[160px] placeholder:text-mutedText"
                disabled={isLoading}
                maxLength={2000}
              />

              {/* Action Buttons */}
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-lg shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Helper metrics (Character limit) */}
            <div className="flex items-center justify-between px-2 mt-1.5 text-2xs text-mutedText">
              <span>Astrology answers can take up to 5 seconds to load.</span>
              <span>{inputText.length} / 2000</span>
            </div>
          </div>
        </div>

        {/* Hidden Print Container for PDF/Print Generation */}
        <div className="hidden print:block print-header">
          <h1>Vedic Astrology Consultation Report</h1>
          <p>AI Vedic Astrologer | Consultation ID: {conversationId || "N/A"}</p>
          {birthDetails && birthDetails.name && (
            <div className="mt-4 p-4 border border-black/20 rounded bg-black/5 text-sm">
              <h3 className="font-bold text-black mb-1">Birth Profile Details</h3>
              <p className="text-black">Name: {birthDetails.name} | Gender: {birthDetails.gender || "N/A"}</p>
              <p className="text-black">Date: {birthDetails.date_of_birth} | Time: {birthDetails.time_of_birth} | Place: {birthDetails.place_of_birth}</p>
              <p className="text-black">Timezone: {birthDetails.timezone || "N/A"}</p>
            </div>
          )}
          <div className="mt-6 space-y-6">
            {messages.slice(1).map((msg) => (
              <div key={msg.id} className={`chat-bubble-print p-4 rounded role-${msg.role}`}>
                <p className="font-bold text-xs uppercase text-black/60 mb-1">
                  {msg.role === "user" ? "User Query" : "Astrologer Guidance"}
                </p>
                <div className="text-sm font-serif leading-relaxed whitespace-pre-wrap text-black">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <AstrologyDashboard birthDetails={birthDetails} />
    </div>
  );
}
