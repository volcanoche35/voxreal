import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJwt } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    let payload
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        image: true,
        trustScore: true,
        tokenBalance: true,
        isVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
