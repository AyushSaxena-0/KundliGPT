import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "../hooks/useChat";
import { AuthProvider } from "../hooks/useAuth";
import Header from "../components/layout/Header";
 
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
 
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
 
export const metadata: Metadata = {
  title: "AI Vedic Astrologer - Guided by Ancient Cosmic Wisdom",
  description:
    "Consult an intelligent, compassionate, and wise AI Vedic Astrologer. Receive personalized Kundli advice on career, relationships, marriage, and life guidance.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "AI Vedic Astrologer - AI-Powered Cosmic Guidance",
    description:
      "Consult our AI Jyotish for practical and mindful guidance based on Vedic Astrology principles.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Vedic Astrologer",
    description: "Receive thoughtful astrology advice powered by AI.",
  },
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-white min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <ChatProvider>
            {/* Header */}
            <Header />
            
            {/* Main App Workspace */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
