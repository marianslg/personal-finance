import { Router } from 'express'
import { listCurrencies, upsertCurrency } from '../controllers/currencyController'

const router = Router()
router.get('/', listCurrencies)
router.post('/', upsertCurrency)
export default router
