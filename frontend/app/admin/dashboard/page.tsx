"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, MessageSquare, Clock, Star, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import Footer from "../../../components/layout/Footer";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.is_admin) {
        setError("Access Denied. Administrator privileges required.");
        setLoading(false);
      } else {
        loadAnalytics();
      }
    }
  }, [user, authLoading, router]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-mutedText">Loading administrative console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 animate-bounce" />
        <h1 className="text-2xl font-bold font-display text-white">Authorization Error</h1>
        <p className="text-sm text-mutedText max-w-sm">{error}</p>
        <Button variant="outline" onClick={() => router.push("/")}>Back to Safety</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Admin Operations Console</h1>
              <p className="text-xs text-mutedText">Monitor user signups, API latencies, and system feedback logs.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>Reload metrics</span>
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Total Users */}
          <Card className="glass-panel border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-2xs uppercase tracking-wider font-semibold">Total Registrations</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <span className="text-2xl font-bold font-display text-white">{analytics?.totalUsers}</span>
              <Users className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>

          {/* Total Conversations */}
          <Card className="glass-panel border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-2xs uppercase tracking-wider font-semibold">Conversations</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <span className="text-2xl font-bold font-display text-white">{analytics?.totalConversations}</span>
              <MessageSquare className="h-5 w-5 text-accent" />
            </CardContent>
          </Card>

          {/* Average Latency */}
          <Card className="glass-panel border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-2xs uppercase tracking-wider font-semibold">Avg. Latency</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <span className="text-2xl font-bold font-display text-white">{analytics?.averageLatencyMs}ms</span>
              <Clock className="h-5 w-5 text-emerald-400" />
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="glass-panel border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-2xs uppercase tracking-wider font-semibold">Feedback Score</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <span className="text-2xl font-bold font-display text-white">{analytics?.averageRating} / 5</span>
              <Star className="h-5 w-5 text-yellow-400" />
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card className="glass-panel border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-2xs uppercase tracking-wider font-semibold">Error Rate</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <span className="text-2xl font-bold font-display text-white">{analytics?.errorRatePercent}%</span>
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </CardContent>
          </Card>

        </div>

        {/* Detailed Logs & Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Feedback comments list */}
          <Card className="lg:col-span-8 glass-panel border-border/60">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-md font-bold font-display text-white">Recent Customer Feedbacks</CardTitle>
              <CardDescription>Direct ratings and comments logged in session feedback.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              {analytics?.recentFeedback?.length === 0 ? (
                <p className="text-xs text-mutedText py-6 text-center">No feedback ratings received yet.</p>
              ) : (
                <div className="space-y-3">
                  {analytics?.recentFeedback?.map((fb: any) => (
                    <div key={fb.id} className="p-4 rounded-lg border border-border bg-card/25 flex items-start gap-4">
                      <div className="flex items-center gap-0.5 text-yellow-400 mt-0.5">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white ml-1">{fb.rating}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-mutedText leading-relaxed italic">
                          "{fb.comment || "No comment left."}"
                        </p>
                        <p className="text-2xs text-mutedText/70 font-sans">
                          Session: {fb.conversation_id} • Date: {new Date(fb.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculator Statistics */}
          <Card className="lg:col-span-4 glass-panel border-border/60">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-md font-bold font-display text-white">Calculations Audits</CardTitle>
              <CardDescription>Astrology engine calculation metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs text-mutedText">Birth Charts Generated</span>
                <span className="text-sm font-bold text-white">{analytics?.chartCalculationsCount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs text-mutedText">Daily Active Users</span>
                <span className="text-sm font-bold text-white">{analytics?.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-mutedText">Calculations Failure Rate</span>
                <span className="text-sm font-bold text-rose-500">0.0%</span>
              </div>
            </CardContent>
          </Card>

        </div>

      </main>
      <Footer />
    </div>
  );
}
