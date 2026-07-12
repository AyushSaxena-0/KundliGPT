"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="prose prose-invert max-w-none text-md leading-relaxed break-words space-y-2
        prose-p:leading-relaxed prose-p:my-1
        prose-strong:text-accent prose-strong:font-semibold
        prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2
        prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2
        prose-li:my-0.5
        prose-headings:font-display prose-headings:font-semibold prose-headings:text-white prose-headings:my-3
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-md
        prose-table:border-collapse prose-table:w-full prose-table:my-3
        prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-secondary prose-th:text-accent
        prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-mutedText"
    >
      {content}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
