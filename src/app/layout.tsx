import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { SessionProvider } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup Intelligence - 世界杯智能赛事中心",
  description: "AI-powered World Cup match predictions, live scores, standings, and knockout bracket analysis",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            {/* 赛事声明条 */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
              <p className="text-xs text-primary/80">
                📡 数据来源：FIFA 官方抽签 + UEFA 附加赛结果（2026年3月）。48 支球队全部确认。赛程为 FIFA 官方发布。
              </p>
            </div>
            <NavBar />
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
