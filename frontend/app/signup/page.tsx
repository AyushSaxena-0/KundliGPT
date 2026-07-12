"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Compass } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function SignupPage() {
  const { signUp, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    clearError();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
    } catch (err: any) {
      setLocalErr(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden select-none">
      
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md glass-panel border-border/80 relative z-10">
        <CardHeader className="text-center pb-2">
          <Compass className="h-10 w-10 text-primary mx-auto mb-3 animate-spin-slow" />
          <CardTitle className="text-2xl font-bold font-display text-white">Create Account</CardTitle>
          <CardDescription>Sign up to start saving your profiles and decoding astrological charts.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error notifications */}
            {(localErr || error) && (
              <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                {localErr || error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Your Full Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="pl-9"
                  required
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-mutedText" />
              </div>
            </div>

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

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-mutedText" />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
              Register Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 py-4">
          <p className="text-xs text-mutedText">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
