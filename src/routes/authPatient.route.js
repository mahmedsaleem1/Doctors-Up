import express from "express";
import passport from "../config/passportPatient.js"; // Patient Passport
import {ApiResponse} from "../utils/apiResponse.js";

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
      res.json(new ApiResponse(200, "Patient authenticated successfully", req.user));
    }
  );

export default router;
