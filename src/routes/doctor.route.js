import { Router } from "express";
import { registerDoctor, loginDoctor, logoutDoctor } from '../controllers/doctor.controller.js'
import { upload } from "../middlewares/multer.middleware.js"
import { authDoctor } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(upload.fields([
    {
        name : "profile_picture",
        maxCount : 1
    },
    {
        name : "video_intro",
        maxCount : 1
    }
]), registerDoctor)

router.route("/login").post(loginDoctor)
router.route("/logout").post(authDoctor, logoutDoctor)

export default router