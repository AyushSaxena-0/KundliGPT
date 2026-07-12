"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowRight, Trash2, Edit2, Check, X, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Inline rename states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Redirect if guest
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat consultation?")) return;
    
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Failed to delete chat.");
    }
  };

  const handleRenameStart = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setRenameTitle(currentTitle);
  };

  const handleRenameSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (renameTitle.trim() === "") return;

    try {
      await api.renameConversation(id, renameTitle);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameTitle } : c));
      setEditingId(null);
    } catch (err) {
      alert("Failed to rename conversation.");
    }
  };

  const handleRenameCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  // Filter conversations
  const filteredConvs = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.chart_summary && c.chart_summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-mutedText">Loading consultation history...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative background glows */}
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold font-display text-white">Consultation History</h1>
          <p className="text-sm text-mutedText mt-2">
            Review and resume your previous planetary charts and discussions.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chat summaries and titles..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-mutedText" />
        </div>

        {/* List of Conversations */}
        <div className="space-y-4 pt-4">
          {filteredConvs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border/80 rounded-xl bg-card/10">
              <p className="text-mutedText text-sm mb-4">No matching chats or profiles found.</p>
              <Link href="/chat">
                <Button size="sm">Start New Consultation</Button>
              </Link>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isEditing = editingId === conv.id;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/chat?id=${conv.id}`)}
                  className="p-5 border border-border bg-card/25 rounded-xl flex items-center justify-between gap-4 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group"
                >
                  <div className="flex-1 overflow-hidden space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          className="h-8 py-1 text-sm max-w-xs"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleRenameSave(conv.id, e)}
                          className="p-1 rounded bg-emerald-950/20 text-emerald-400 hover:bg-emerald-500/20"
                          title="Save title"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleRenameCancel}
                          className="p-1 rounded bg-rose-950/20 text-rose-400 hover:bg-rose-500/20"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h4 className="text-md font-semibold text-white truncate">{conv.title}</h4>
                        <button
                          onClick={(e) => handleRenameStart(conv.id, conv.title, e)}
                          className="opacity-0 group-hover:opacity-100 text-mutedText hover:text-white p-1 rounded transition-all focus:outline-none shrink-0"
                          title="Rename Consultation"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <p className="text-2xs text-mutedText">
                      Updated: {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                    {conv.chart_summary && (
                      <p className="text-xs text-mutedText line-clamp-1 italic mt-1.5 font-sans leading-relaxed">
                        Summary: {conv.chart_summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="text-mutedText hover:text-rose-400 p-1.5 rounded transition-all focus:outline-none"
                      title="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <Button
                      variant="link"
                      onClick={() => router.push(`/chat?id=${conv.id}`)}
                      className="p-0 text-accent font-semibold group flex items-center gap-1 text-sm"
                    >
                      <span>Resume</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
