import express from "express";
import passport from "../config/passportDoctor.js"; // Doctor Passport

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
    if (req.user.UnRegistered){
      req.session.email = req.user.email;
      res.redirect("/api/v1/doctor/updateOAuthDoctor");
    }
  }
);

export default router;
