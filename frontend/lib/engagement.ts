import { api } from "./api";

export interface BookmarkItem {
  id: string;
  title: string;
  type: "article" | "chart" | "reading";
  url: string;
  savedAt: string;
}

export interface RecentlyViewedItem {
  id: string;
  title: string;
  type: "article" | "tool" | "zodiac";
  url: string;
  viewedAt: string;
}

class EngagementService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save storage item ${key}:`, err);
    }
  }

  // --- BOOKMARKS & FAVORITES ---
  getBookmarks(): BookmarkItem[] {
    return this.getStorageItem<BookmarkItem[]>("astrologer_bookmarks", []);
  }

  addBookmark(item: Omit<BookmarkItem, "savedAt">): void {
    const bookmarks = this.getBookmarks();
    if (bookmarks.some(b => b.id === item.id)) return;
    
    const newBookmark: BookmarkItem = {
      ...item,
      savedAt: new Date().toISOString()
    };
    
    this.setStorageItem("astrologer_bookmarks", [...bookmarks, newBookmark]);
  }

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks();
    this.setStorageItem("astrologer_bookmarks", bookmarks.filter(b => b.id !== id));
  }

  isBookmarked(id: string): boolean {
    return this.getBookmarks().some(b => b.id === id);
  }

  // --- RECENTLY VIEWED PAGES ---
  getRecentlyViewed(): RecentlyViewedItem[] {
    return this.getStorageItem<RecentlyViewedItem[]>("astrologer_recently_viewed", []);
  }

  recordPageView(item: Omit<RecentlyViewedItem, "viewedAt">): void {
    let recent = this.getRecentlyViewed();
    recent = recent.filter(r => r.id !== item.id);
    
    const newItem: RecentlyViewedItem = {
      ...item,
      viewedAt: new Date().toISOString()
    };
    
    this.setStorageItem("astrologer_recently_viewed", [newItem, ...recent].slice(0, 5));
  }

  // --- RECENT CHARTS ---
  async getRecentlyGeneratedCharts(): Promise<any[]> {
    try {
      const charts = await api.getSavedCharts();
      return charts;
    } catch {
      return [];
    }
  }

  // --- TRENDING ARTICLES ---
  getTrendingArticles(): any[] {
    return [
      { id: "saturn-transit", title: "Saturn Transit 2026: Direct Career Impact", slug: "saturn-transit-2026" },
      { id: "jupiter-aspects", title: "Decoding Jupiter Aspects on Navamsha (D9) Chart", slug: "jupiter-aspects-d9" },
      { id: "rahu-ketu", title: "Rahu-Ketu Karmic Placements and Remedies", slug: "rahu-ketu-remedies" }
    ];
  }
}

export const engagement = new EngagementService();
export default engagement;
