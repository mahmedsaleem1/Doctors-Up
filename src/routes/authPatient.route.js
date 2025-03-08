import express from "express";
import passport from "../config/passportPatient.js"; // Patient Passport

const router = express.Router();
import dotenv from "dotenv";
dotenv.config();  // ✅ Load environment variables

router.get(
  "/google",
  (req, res, next) => {
    next();
  },
  passport.authenticate("patient-google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    (req, res, next) => {
      next();
    },
    passport.authenticate("patient-google", { failureRedirect: "/login" }),
    (req, res) => {
      if (req.user.UnRegistered){
        req.session.email = req.user.email;
        res.redirect("/api/v1/patient/updateOAuthPatient");
      }
    }
  );

export default router;
