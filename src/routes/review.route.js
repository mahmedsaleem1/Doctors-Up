import { Router } from "express";
import { createReview, getReviewsOfDoctor, getReviewsOfPatient } from "../controllers/review.controller.js";
import { authPatient } from "../middlewares/auth.middleware.js";

const router = Router();

router.route(`/create/:appointment_id`).post(authPatient, createReview);
router.route(`/doctor/:doctor_id`).get(getReviewsOfDoctor);
router.route(`/patient/:patient_id`).get(getReviewsOfPatient);

export default router;