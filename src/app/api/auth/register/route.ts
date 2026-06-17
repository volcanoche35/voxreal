import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signJwt } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        displayName: name,
        passwordHash,
        trustScore: 50,
        tokenBalance: 0,
        isVerified: false,
      },
    })

    const token = signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
