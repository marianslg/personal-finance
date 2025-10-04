import prisma from '../lib/prisma'
import { Request, Response } from 'express'

export async function listSnapshots(_req: Request, res: Response) {
  const snaps = await prisma.snapshot.findMany({
    include: { items: { include: { account: true, instrument: true } } },
    orderBy: { takenAt: 'desc' },
  })
  res.json(snaps)
}

export async function getSnapshot(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' })
  const snap = await prisma.snapshot.findUnique({ where: { id }, include: { items: { include: { account: true, instrument: true } } } })
  if (!snap) return res.status(404).json({ error: 'not found' })
  res.json(snap)
}

export async function createSnapshot(req: Request, res: Response) {
  try {
    const { name, items } = req.body
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items array required' })

    const preparedItems = await Promise.all(
      items.map(async (it: any) => {
        let accountId = it.accountId
        if (!accountId && it.accountName) {
          const a = await prisma.account.upsert({ where: { name: it.accountName }, update: {}, create: { name: it.accountName, type: it.accountType || null, currencyId: it.accountCurrencyId || null } })
          accountId = a.id
        }
        let instrumentId = it.instrumentId
        if (!instrumentId && it.instrumentSymbol) {
          const ins = await prisma.instrument.upsert({ where: { symbol: it.instrumentSymbol }, update: {}, create: { symbol: it.instrumentSymbol, name: it.instrumentName || null, quoteCurrencyId: it.quoteCurrencyId || null } })
          instrumentId = ins.id
        }
        if (!accountId || !instrumentId) throw new Error('accountId/instrumentId missing for an item')
        return { accountId, instrumentId, quantity: String(it.quantity ?? '0'), pricePerUnitUSD: String(it.pricePerUnitUSD ?? '0'), notes: it.notes ?? null }
      })
    )

    const snapshot = await prisma.snapshot.create({ data: { name: name ?? null, items: { create: preparedItems } }, include: { items: { include: { account: true, instrument: true } } } })

    res.status(201).json(snapshot)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'server error' })
  }
}
