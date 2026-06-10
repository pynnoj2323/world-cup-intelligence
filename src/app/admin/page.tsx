"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Users, Mail, Calendar, RefreshCw, UserCog } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated" && !isAdmin) {
      redirect("/");
    }
  }, [status, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "操作失败");
        return;
      }
      fetchUsers();
    } catch {
      alert("操作失败");
    }
  };

  if (status === "loading" || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">管理面板</h1>
            <p className="text-sm text-muted-foreground">用户管理 · 权限控制</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">总用户</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">管理员</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{stats.admins}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">普通用户</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.users}</p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              用户列表
            </h2>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              刷新
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">加载中...</div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <button onClick={fetchUsers} className="mt-2 text-primary text-sm hover:underline">
                重试
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        用户
                      </div>
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                      角色
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        注册时间
                      </div>
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name || "未设置"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <span className="inline-block md:hidden mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {user.role === "admin" ? "管理员" : "普通用户"}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {user.role === "admin" ? "管理员" : "普通用户"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.role === "admin"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          }`}
                        >
                          {user.role === "admin" ? "降为普通用户" : "提升为管理员"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">暂无用户</div>
          )}
        </div>
      </div>
    </div>
  );
}
