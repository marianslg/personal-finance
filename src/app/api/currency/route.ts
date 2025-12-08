import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const list = await prisma.currency.findMany({
    orderBy: [
      { snapshotPosition: 'asc' },
      { id: 'asc' }
    ]
  })
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

export async function PUT(request: NextRequest) {
  const body = await request.json()
  
  // Bulk update para posición y visibilidad
  if (Array.isArray(body)) {
    const updates = body.map(item => 
      prisma.currency.update({
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
  const { id, code, name, snapshotPosition, snapshotVisible } = body
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  const currency = await prisma.currency.update({
    where: { id },
    data: { 
      ...(name && { name }),
      ...(snapshotPosition !== undefined && { snapshotPosition }),
      ...(snapshotVisible !== undefined && { snapshotVisible }),
    },
  })
  return NextResponse.json(currency)
}
