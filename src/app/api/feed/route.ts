import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");

    const where: Record<string, unknown> = {
      status: "active",
      expiresAt: { gt: new Date() },
    };

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }
      where.categoryId = category.id;
    }

    const polls = await prisma.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        category: { select: { name: true, slug: true } },
        user: { select: { id: true, displayName: true } },
        _count: { select: { votes: true } },
      },
    });

    const data = polls.map((poll) => ({
      id: poll.id,
      question: poll.question,
      options: JSON.parse(poll.options),
      pollType: poll.pollType,
      status: poll.status,
      duration: poll.duration,
      totalVotes: poll._count.votes,
      createdAt: poll.createdAt,
      expiresAt: poll.expiresAt,
      category: poll.category,
      user: poll.user,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
