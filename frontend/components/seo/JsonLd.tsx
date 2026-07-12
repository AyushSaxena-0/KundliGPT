import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * Server/Client compatible component to output structured Schema.org JSON-LD data
 * in the HTML headers or body, safely handling special characters.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
