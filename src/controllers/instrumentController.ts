import prisma from '../lib/prisma'
import { Request, Response } from 'express'

export async function listInstruments(_req: Request, res: Response) {
  const list = await prisma.instrument.findMany({ include: { quoteCurrency: true } })
  res.json(list)
}

export async function upsertInstrument(req: Request, res: Response) {
  const { symbol, name, quoteCurrencyId } = req.body
  if (!symbol) return res.status(400).json({ error: 'symbol required' })
  const inst = await prisma.instrument.upsert({ where: { symbol }, update: { name, quoteCurrencyId }, create: { symbol, name, quoteCurrencyId } })
  res.json(inst)
}
