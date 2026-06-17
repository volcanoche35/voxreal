import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, signJwt } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = signJwt({
      id: user.id,
      email: user.email,
      name: user.name || user.displayName,
    })

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.displayName,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
