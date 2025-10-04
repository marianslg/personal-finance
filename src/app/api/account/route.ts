import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const list = await prisma.account.findMany()
  return NextResponse.json(list)
}
export async function POST(request: NextRequest) {
  const { name, type, currencyId } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }
  const account = await prisma.account.upsert({
    where: { name },
    update: { type, currencyId },
    create: { name, type, currencyId },
  })
  return NextResponse.json(account)
}