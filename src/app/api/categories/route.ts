import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const HARDCODED_USER_ID = 'seed-admin-user'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { sortOrder: 'asc' }
  })
  return NextResponse.json({ success: true, data: categories })
}
