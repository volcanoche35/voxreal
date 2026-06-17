import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = verifyJwt(authHeader.slice(7));
      userId = payload.id;
    } catch {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, question, options, pollType, duration } = body;

    if (!categoryId || !question || !options || !Array.isArray(options) || options.length < 2) {
      return Response.json({ success: false, error: "Missing or invalid required fields" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return Response.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const normalizedOptions = options.map((opt: string | { text: string }, i: number) => ({
      id: String.fromCharCode(97 + i),
      text: typeof opt === "string" ? opt : opt.text,
    }));

    const poll = await prisma.poll.create({
      data: {
        userId,
        categoryId,
        question,
        options: JSON.stringify(normalizedOptions),
        pollType: pollType || "single",
        duration: typeof duration === "number" && duration > 0 ? duration : 86400,
        status: "active",
        expiresAt: new Date(Date.now() + (typeof duration === "number" && duration > 0 ? duration : 86400) * 1000),
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return Response.json({ success: true, data: { ...poll, options: JSON.parse(poll.options) } }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
