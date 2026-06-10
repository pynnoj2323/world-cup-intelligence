/**
 * NextAuth.js 配置（Edge Runtime 兼容）
 * 不含 Prisma / Node.js 模块，仅供 proxy.ts 使用
 */
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/auth/login") ||
        nextUrl.pathname.startsWith("/auth/register");
      const isAdminPage = nextUrl.pathname.startsWith("/admin");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/auth/login", nextUrl));
      }

      if (isAdminPage) {
        const role = (auth.user as any)?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  trustHost: true,
});
