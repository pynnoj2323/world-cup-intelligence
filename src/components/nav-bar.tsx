"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Home, Trophy, BarChart3, Swords, Target, User, Menu, X, LogOut, Shield, LogIn } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/matches", label: "赛程", icon: Trophy },
  { href: "/standings", label: "积分", icon: BarChart3 },
  { href: "/bracket", label: "淘汰赛", icon: Swords },
  { href: "/predictions", label: "预测", icon: Target },
  { href: "/profile", label: "我的", icon: User },
];

function UserMenu({ isDesktop }: { isDesktop: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === "admin";

  if (!session) {
    if (isDesktop) {
      return (
        <Link
          href="/auth/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogIn className="w-4 h-4" />
          登录
        </Link>
      );
    }
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", isDesktop ? "ml-4 pl-4 border-l border-border" : "")}>
      <span className="text-sm text-muted-foreground hidden lg:inline">
        {session.user?.name || session.user?.email}
      </span>
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            pathname === "/admin"
              ? "bg-amber-500/20 text-amber-500"
              : "text-amber-500 hover:bg-amber-500/10"
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          管理
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">退出</span>
      </button>
    </div>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "admin";

  // Don't show nav on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <>
      {/* Desktop Top Nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#F5C542]" />
            <span className="font-bold text-lg tracking-wide">
              World Cup <span className="text-primary">Intelligence</span>
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <UserMenu isDesktop />
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#F5C542]" />
          <span className="font-bold text-base">
            WC <span className="text-primary">Intelligence</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {session && (
            <span className="text-xs text-muted-foreground truncate max-w-20">
              {session.user?.name || session.user?.email}
            </span>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-50 flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
        {session ? (
          <>
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                  pathname === "/admin" ? "text-amber-500" : "text-muted-foreground"
                )}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs">管理</span>
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-muted-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">退出</span>
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-muted-foreground transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-xs">登录</span>
          </Link>
        )}
      </nav>
    </>
  );
}
