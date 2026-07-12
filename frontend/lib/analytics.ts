export type AnalyticsEvent =
  | "page_view"
  | "tool_open"
  | "chat_start"
  | "chat_complete"
  | "report_generate"
  | "search_use"
  | "button_click"
  | "feedback_submit"
  | "error_occur";

export interface AnalyticsProvider {
  name: string;
  initialize(): void;
  trackEvent(event: AnalyticsEvent, params?: Record<string, any>): void;
  trackPageView(path: string): void;
}

// Development Console Provider
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  name = "Console";

  initialize() {
    console.log("[Analytics] Initializing Console Analytics Provider...");
  }

  trackEvent(event: AnalyticsEvent, params?: Record<string, any>) {
    console.log(`[Analytics Event] ${event}`, params);
  }

  trackPageView(path: string) {
    console.log(`[Analytics PageView] ${path}`);
  }
}

// Future Google Analytics Provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = "GoogleAnalytics";
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  initialize() {
    if (typeof window === "undefined") return;
    console.log("[Analytics] Initializing Google Analytics...");
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag("js", new Date());
    gtag("config", this.measurementId);
  }

  trackEvent(event: AnalyticsEvent, params?: Record<string, any>) {
    if (typeof window === "undefined" || !(window as any).gtag) return;
    (window as any).gtag("event", event, params);
  }

  trackPageView(path: string) {
    if (typeof window === "undefined" || !(window as any).gtag) return;
    (window as any).gtag("event", "page_view", {
      page_path: path,
    });
  }
}

class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;

  registerProvider(provider: AnalyticsProvider) {
    this.providers.push(provider);
    if (this.isInitialized) {
      provider.initialize();
    }
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Register console provider by default
    this.registerProvider(new ConsoleAnalyticsProvider());

    const gaId = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined;
    if (gaId) {
      this.registerProvider(new GoogleAnalyticsProvider(gaId));
    }

    this.providers.forEach(p => p.initialize());
    this.isInitialized = true;
  }

  trackEvent(event: AnalyticsEvent, params?: Record<string, any>) {
    this.providers.forEach(p => {
      try {
        p.trackEvent(event, params);
      } catch (err) {
        console.error(`Provider ${p.name} failed to track event:`, err);
      }
    });
  }

  trackPageView(path: string) {
    this.providers.forEach(p => {
      try {
        p.trackPageView(path);
      } catch (err) {
        console.error(`Provider ${p.name} failed to track pageview:`, err);
      }
    });
  }
}

export const analytics = new AnalyticsService();
export default analytics;
