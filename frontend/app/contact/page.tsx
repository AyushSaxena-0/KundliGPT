"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Compass, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    // Simulate contact form submit
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        
        <Card className="glass-panel border-border/80">
          <CardHeader className="text-center p-6 pb-2">
            <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl sm:text-3xl font-display text-white">Contact Us</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Have questions, feedback, or suggestion inquiries? Drop us a message below.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {isSent ? (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <h3 className="text-lg font-bold font-display text-white">Message Sent Successfully!</h3>
                <p className="text-sm text-mutedText max-w-xs">
                  Thank you for reaching out. Our team will review your message and reply via email.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSent(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Rahul Sharma"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="rahul@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Subject (Optional)
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Astrological calculation inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message here..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
