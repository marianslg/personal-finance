import prisma from '../lib/prisma'
import { Request, Response } from 'express'

export async function listAccounts(_req: Request, res: Response) {
  const list = await prisma.account.findMany({ include: { currency: true } })
  res.json(list)
}

export async function upsertAccount(req: Request, res: Response) {
  const { name, type, currencyId } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const acc = await prisma.account.upsert({ where: { name }, update: { type, currencyId }, create: { name, type, currencyId } })
  res.json(acc)
}
