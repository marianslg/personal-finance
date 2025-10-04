import prisma from '../lib/prisma'
import { Request, Response } from 'express'

export async function listCurrencies(_req: Request, res: Response) {
  const list = await prisma.currency.findMany()
  res.json(list)
}

export async function upsertCurrency(req: Request, res: Response) {
  const { code, name } = req.body
  if (!code || !name) return res.status(400).json({ error: 'code and name required' })
  const c = await prisma.currency.upsert({ where: { code }, update: { name }, create: { code, name } })
  res.json(c)
}
