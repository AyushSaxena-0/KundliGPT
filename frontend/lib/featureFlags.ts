export interface FeatureFlags {
  premiumReports: boolean;
  dailyHoroscope: boolean;
  ads: boolean;
  notifications: boolean;
  blog: boolean;
  pdfExport: boolean;
  auth: boolean;
  analytics: boolean;
  payments: boolean;
}

const defaultFlags: FeatureFlags = {
  premiumReports: false,
  dailyHoroscope: true,
  ads: true,
  notifications: false,
  blog: true,
  pdfExport: true,
  auth: true,
  analytics: true,
  payments: false
};

class FeatureFlagService {
  private flags: FeatureFlags;

  constructor() {
    this.flags = {
      premiumReports: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_PREMIUM_REPORTS === "true") || defaultFlags.premiumReports,
      dailyHoroscope: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_DAILY_HOROSCOPE === "false") ? false : defaultFlags.dailyHoroscope,
      ads: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_ADS === "false") ? false : defaultFlags.ads,
      notifications: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_NOTIFICATIONS === "true") || defaultFlags.notifications,
      blog: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_BLOG === "false") ? false : defaultFlags.blog,
      pdfExport: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_PDF_EXPORT === "false") ? false : defaultFlags.pdfExport,
      auth: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_AUTH === "false") ? false : defaultFlags.auth,
      analytics: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_ANALYTICS === "false") ? false : defaultFlags.analytics,
      payments: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLAG_PAYMENTS === "true") || defaultFlags.payments
    };
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  getAllFlags(): FeatureFlags {
    return this.flags;
  }
}

export const featureFlags = new FeatureFlagService();
export default featureFlags;
