import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        user: { select: { id: true, displayName: true } },
        votes: {
          select: { selectedOption: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    const options = JSON.parse(poll.options) as { id: string; text: string }[];
    const totalVotes = poll.votes.length;

    // Calculate percentages per option
    const voteCounts = new Map<string, number>();
    for (const vote of poll.votes) {
      voteCounts.set(vote.selectedOption, (voteCounts.get(vote.selectedOption) ?? 0) + 1);
    }

    const optionsWithPercentages = options.map((opt) => {
      const count = voteCounts.get(opt.id) ?? 0;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return { ...opt, count, percentage };
    });

    const data = {
      id: poll.id,
      question: poll.question,
      options: optionsWithPercentages,
      pollType: poll.pollType,
      status: poll.status,
      duration: poll.duration,
      totalVotes,
      createdAt: poll.createdAt,
      expiresAt: poll.expiresAt,
      category: poll.category,
      user: poll.user,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
