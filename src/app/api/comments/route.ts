import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// GET — 获取赛事评论列表
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  if (!matchId) {
    return NextResponse.json({ error: "缺少 matchId" }, { status: 400 });
  }

  try {
    const comments = await db.comment.findMany({
      where: { matchId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — 发布评论
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, content, parentId, predictionId } = body;

    if (!matchId || !content) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const comment = await db.comment.create({
      data: {
        matchId,
        userId: user.id,
        content: content.slice(0, 500),
        parentId: parentId || null,
        predictionId: predictionId || null,
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — 删除评论
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

    // 只能删自己的
    if (comment.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    await db.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
