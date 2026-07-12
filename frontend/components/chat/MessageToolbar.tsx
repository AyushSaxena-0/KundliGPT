"use client";

import React, { useState } from "react";
import { Check, Copy, MessageSquarePlus } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useChat } from "../../hooks/useChat";

interface MessageToolbarProps {
  messageId: string;
  content: string;
}

export function MessageToolbar({ messageId, content }: MessageToolbarProps) {
  const { submitFeedback } = useChat();
  
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback(rating, comment || undefined);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setSubmitSuccess(false);
        setComment("");
      }, 1500);
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 ml-1 text-mutedText text-xs select-none">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 p-1 rounded hover:bg-secondary hover:text-white transition-all focus:outline-none"
        title="Copy reply to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Feedback Button */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="flex items-center gap-1 p-1 rounded hover:bg-secondary hover:text-white transition-all focus:outline-none"
        title="Share reading feedback"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        <span>Feedback</span>
      </button>

      {/* Feedback Dialog */}
      <Dialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Rate this Astrology Reading"
      >
        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-4xl mb-3">✨</span>
            <h4 className="text-lg font-semibold text-accent font-display">Thank You!</h4>
            <p className="text-sm text-mutedText mt-1">Your feedback helps improve our astrological models.</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    {star <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-mutedText mt-1">
                {rating === 5 && "Excellent & highly insightful!"}
                {rating === 4 && "Very good advice."}
                {rating === 3 && "Average reading."}
                {rating === 2 && "Needs improvement."}
                {rating === 1 && "Not helpful / inaccurate."}
              </p>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-1">
                Comments (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of the astrologer's guidance?..."
                className="min-h-[80px]"
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default MessageToolbar;
