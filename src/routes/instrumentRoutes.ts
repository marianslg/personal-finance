import { Router } from 'express'
import { listInstruments, upsertInstrument } from '../controllers/instrumentController'

const router = Router()
router.get('/', listInstruments)
router.post('/', upsertInstrument)
export default router
