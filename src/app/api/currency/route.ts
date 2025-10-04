import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const list = await prisma.currency.findMany()
  return NextResponse.json(list)
}

export async function POST(request: NextRequest) {
  const { code, name } = await request.json()
  if (!code || !name) {
    return NextResponse.json({ error: 'code and name required' }, { status: 400 })
  }
  const currency = await prisma.currency.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  })
  return NextResponse.json(currency)
}
