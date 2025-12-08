import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const snapshots = await prisma.snapshot.findMany({
    include: {
      account: true,
      currency: true,
    },
    orderBy: { snapshotDate: 'desc' },
  })
  return NextResponse.json(snapshots)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { snapshots, snapshotDate } = body as {
      snapshots: { accountId: number; currencyId: number; quantity: number; pricePerUnitUSD: number }[]
      snapshotDate: string
    }

    const date = new Date(snapshotDate)

    const created = await prisma.snapshot.createMany({
      data: snapshots.map(s => ({
        accountId: s.accountId,
        currencyId: s.currencyId,
        quantity: s.quantity,
        pricePerUnitUSD: s.pricePerUnitUSD,
        snapshotDate: date,
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error('Error creating snapshots:', error)
    return NextResponse.json({ error: 'Failed to create snapshots' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { snapshots, snapshotDate } = body as {
      snapshots: { accountId: number; currencyId: number; quantity: number; pricePerUnitUSD: number }[]
      snapshotDate: string
    }

    const date = new Date(snapshotDate)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    // Eliminar snapshots existentes de esa fecha
    await prisma.snapshot.deleteMany({
      where: {
        snapshotDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    // Crear nuevos snapshots
    const created = await prisma.snapshot.createMany({
      data: snapshots.map(s => ({
        accountId: s.accountId,
        currencyId: s.currencyId,
        quantity: s.quantity,
        pricePerUnitUSD: s.pricePerUnitUSD,
        snapshotDate: new Date(snapshotDate),
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error('Error updating snapshots:', error)
    return NextResponse.json({ error: 'Failed to update snapshots' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { oldDate, newDate } = body as { oldDate: string; newDate: string }

    const oldDateObj = new Date(oldDate)
    const startOfDay = new Date(oldDateObj)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(oldDateObj)
    endOfDay.setHours(23, 59, 59, 999)

    // Actualizar la fecha de todos los snapshots de ese día
    const updated = await prisma.snapshot.updateMany({
      where: {
        snapshotDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      data: {
        snapshotDate: new Date(newDate),
      },
    })

    return NextResponse.json({ success: true, count: updated.count })
  } catch (error) {
    console.error('Error updating snapshot date:', error)
    return NextResponse.json({ error: 'Failed to update snapshot date' }, { status: 500 })
  }
}
