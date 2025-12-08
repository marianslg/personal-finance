import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const list = await prisma.account.findMany({
    orderBy: [
      { snapshotPosition: 'asc' },
      { id: 'asc' }
    ]
  })
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

export async function PUT(request: NextRequest) {
  const body = await request.json()
  
  // Bulk update para posición y visibilidad
  if (Array.isArray(body)) {
    const updates = body.map(item => 
      prisma.account.update({
        where: { id: item.id },
        data: {
          snapshotPosition: item.snapshotPosition,
          snapshotVisible: item.snapshotVisible,
        },
      })
    )
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  }
  
  // Single update
  const { id, name, snapshotPosition, snapshotVisible } = body
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  const account = await prisma.account.update({
    where: { id },
    data: { 
      ...(name && { name }),
      ...(snapshotPosition !== undefined && { snapshotPosition }),
      ...(snapshotVisible !== undefined && { snapshotVisible }),
    },
  })
  return NextResponse.json(account)
}