import e, { Router } from "express"
import { createUser, loginUser, logoutUser } from '../controllers/user.controller.js'

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

router.route('/logout').post(verifyJWT, logoutUser)
// router.route('/forgotpassword').post(forgotPassword)
// router.route('/resetpassword/:token').put(resetPassword)

export default router
