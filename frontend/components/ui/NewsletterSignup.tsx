"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { analytics } from "../../lib/analytics";
import { Button } from "./button";
import { Input } from "./input";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    // Track analytics event
    analytics.trackEvent("button_click", { 
      action: "subscribe_newsletter",
      email: email.split("@")[1] // track domain only for privacy compliance
    });

    try {
      await api.subscribeNewsletter(email, name || undefined);
      setSuccess(true);
      setEmail("");
      setName("");
      
      // Track successful subscription
      analytics.trackEvent("feedback_submit", { type: "newsletter_subscribed" });
    } catch (err: any) {
      setError(err.message || "Failed to subscribe. Please try again.");
      analytics.trackEvent("error_occur", { 
        context: "newsletter_subscribe", 
        message: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel border border-border/80 rounded-xl p-6 md:p-8 max-w-2xl mx-auto text-center relative overflow-hidden select-none">
      {/* Decorative glows */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
      
      {success ? (
        <div className="space-y-4 py-4 flex flex-col items-center justify-center animate-fadeIn">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
          <h3 className="text-xl font-bold font-display text-white">Verification Link Sent!</h3>
          <p className="text-sm text-mutedText max-w-sm">
            Thank you! A verification link has been sent to your email. Please verify your address to start receiving daily Vedic charts.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold font-display text-white">Daily Vedic Alignments</h3>
            <p className="text-xs md:text-sm text-mutedText max-w-md mx-auto">
              Subscribe to get daily planetary transit reports, Sade Sati warnings, and auspicious muhurta times directly in your inbox.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="pl-9 w-full"
                disabled={loading}
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-mutedText" />
            </div>
            
            <Button type="submit" isLoading={loading} className="sm:w-auto w-full">
              Subscribe
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-2xs text-mutedText pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero spam. Secure double opt-in protocol. Unsubscribe anytime.</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default NewsletterSignup;
