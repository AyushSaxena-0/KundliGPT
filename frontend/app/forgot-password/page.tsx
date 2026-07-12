"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Compass, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    clearError();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setLocalErr(err.message || "Failed to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden select-none">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md glass-panel border-border/80 relative z-10">
        <CardHeader className="text-center pb-2">
          <Compass className="h-10 w-10 text-primary mx-auto mb-3 animate-spin-slow" />
          <CardTitle className="text-2xl font-bold font-display text-white">Reset Password</CardTitle>
          <CardDescription>Enter your email and we'll send you a secure link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isSent ? (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-bold font-display text-white">Verification Link Sent</h3>
              <p className="text-sm text-mutedText max-w-xs">
                Check your inbox at <strong>{email}</strong> for instructions to finalize password replacement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error notifications */}
              {(localErr || error) && (
                <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                  {localErr || error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-9"
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-mutedText" />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 py-4">
          <Link href="/login" className="text-xs text-accent font-semibold hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
