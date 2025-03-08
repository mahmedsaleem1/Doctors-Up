import express from "express";
import passport from "../config/passportDoctor.js"; // Doctor Passport
import {ApiResponse} from "../utils/apiResponse.js";

const router = express.Router();

// Route to initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("doctor-google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback", // 🔥 Match this with Google Cloud Console
  passport.authenticate("doctor-google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.json(new ApiResponse(200, "Doctor authenticated successfully", req.user));
  }
);

export default router;
