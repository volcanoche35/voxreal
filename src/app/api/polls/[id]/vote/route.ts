import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const payload = verifyJwt(authHeader.slice(7));
      userId = payload.id;
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: pollId } = await params;
    const body = await request.json();
    const { selectedOption } = body;

    if (!selectedOption) {
      return NextResponse.json(
        { success: false, error: "selectedOption is required" },
        { status: 400 }
      );
    }

    // Fetch poll
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    if (poll.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Poll is not active" },
        { status: 400 }
      );
    }

    if (new Date() > poll.expiresAt) {
      return NextResponse.json(
        { success: false, error: "Poll has expired" },
        { status: 400 }
      );
    }

    // Validate selectedOption is one of the poll options
    const options = JSON.parse(poll.options) as { id: string; text: string }[];
    const validOption = options.find((opt) => opt.id === selectedOption);
    if (!validOption) {
      return NextResponse.json(
        { success: false, error: `Invalid option: ${selectedOption}. Valid options: ${options.map((o) => o.id).join(", ")}` },
        { status: 400 }
      );
    }

    // Check for duplicate vote (pollId + userId unique constraint)
    const existingVote = await prisma.vote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
    if (existingVote) {
      return NextResponse.json(
        { success: false, error: "You have already voted on this poll" },
        { status: 409 }
      );
    }

    // Get user trust score
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    // Create vote and increment poll totalVotes in a transaction
    const [vote] = await prisma.$transaction([
      prisma.vote.create({
        data: {
          pollId,
          userId,
          selectedOption,
          userTrustScoreAtTime: user?.trustScore ?? 50,
        },
      }),
      prisma.poll.update({
        where: { id: pollId },
        data: { totalVotes: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(
      { success: true, data: vote },
      { status: 201 }
    );
  } catch (error) {
    // Handle unique constraint violation (race condition on duplicate vote)
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { success: false, error: "You have already voted on this poll" },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
