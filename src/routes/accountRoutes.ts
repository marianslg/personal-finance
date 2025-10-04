import { Router } from 'express'
import { listAccounts, upsertAccount } from '../controllers/accountController'

const router = Router()
router.get('/', listAccounts)
router.post('/', upsertAccount)
export default router
