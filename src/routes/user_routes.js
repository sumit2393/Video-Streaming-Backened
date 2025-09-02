import e, { Router } from "express"
import { createUser } from '../controllers/user.controller.js'

import { upload } from "../middlewares/multer_middleware.js"

const router = Router()

router.route('/create').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    
    createUser

)


export default router