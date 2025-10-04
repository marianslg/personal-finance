import { Router } from 'express'
import { listSnapshots, getSnapshot, createSnapshot } from '../controllers/snapshotController'

const router = Router()
router.get('/', listSnapshots)
router.get('/:id', getSnapshot)
router.post('/', createSnapshot)
export default router
