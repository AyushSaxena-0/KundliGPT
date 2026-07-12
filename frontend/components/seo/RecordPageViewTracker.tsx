"use client";

import { useEffect } from "react";
import { engagement } from "../../lib/engagement";
import { analytics } from "../../lib/analytics";

interface TrackerProps {
  id: string;
  title: string;
  type: "article" | "tool" | "zodiac";
  url: string;
}

export function RecordPageViewTracker({ id, title, type, url }: TrackerProps) {
  useEffect(() => {
    engagement.recordPageView({ id, title, type, url });
    analytics.initialize();
    analytics.trackPageView(url);
    analytics.trackEvent("page_view", { 
      content_id: id, 
      content_title: title, 
      content_type: type 
    });
  }, [id, title, type, url]);

  return null;
}

export default RecordPageViewTracker;
