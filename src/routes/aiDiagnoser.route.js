import express from "express";
import { generateAIResponse } from "../controllers/aiDoctor.controller.js";

const router = express.Router();

router.post("/", generateAIResponse);

export default router;
