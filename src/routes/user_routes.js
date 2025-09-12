import e, { Router } from "express"
import { createUser, loginUser } from '../controllers/user.controller.js'

import { upload } from "../middlewares/multer_middleware.js"
import { verifyJWT } from "../middlewares/authmiddleware.js"

const router = Router()

router.route('/create').post(
    upload.fields([
        { name: 'avatar', maxCount: 2 },
        { name: 'coverImage', maxCount: 2 }
    ]),
    
    createUser

)
router.route('/login').post(loginUser)

//secure routes - verify JWT

router.route('/logout').post(logoutUser,verifyJWT)

export default router