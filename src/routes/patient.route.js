import { Router } from "express";
import { registerPatient, loginPatient, logoutPatient, sendOtp
    , verifyOtp, getCurrentPatient, updatePatientInfo } from '../controllers/patient.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import { authPatient } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name : "profile_picture",
        maxCount : 1
    }
]), registerPatient);

router.route("/login").post(loginPatient);
router.route("/logout").post(authPatient, logoutPatient);

router.route("/send-otp").post(sendOtp); // Step 1: Email bhejo aur OTP pao
router.route("/reset-password").post(verifyOtp); 
router.route("/getCurrentPatient").get(authPatient, getCurrentPatient);
router.route("/updatePatientInfo").post(authPatient, updatePatientInfo)

export default router;
