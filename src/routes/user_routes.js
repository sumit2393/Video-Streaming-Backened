import e, { Router } from "express"
import { createUser } from '../controllers/user.controller.js'
const router = Router()

router.route('/create').post(createUser)


export default router