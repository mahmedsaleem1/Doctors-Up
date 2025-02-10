import express from "express";
import { renderDiagnoser, handleUserInput } from "../controllers/aiDoctor.controller.js";

const router = express.Router();

router.get("/", renderDiagnoser);
router.post("/submit", handleUserInput);

export default router;
