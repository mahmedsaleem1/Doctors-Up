import {Router} from "express";
import { bookAppointment } from "../controllers/appointment.controller.js";
import { authPatient } from "../middlewares/auth.middleware.js";
import { doctorUpdateAppointment } from "../controllers/appointment.controller.js";
import { authDoctor } from "../middlewares/auth.middleware.js";
import { cancelAppointment } from "../controllers/appointment.controller.js";
import { getPatientAppointments } from "../controllers/appointment.controller.js";
import { getDoctorAppointments } from "../controllers/appointment.controller.js";
import { authDoctorOrPatient } from "../middlewares/auth.middleware.js";

const router = Router();

// Doctor ki ID ab `req.params` se ayegi
router.route(`/book/:doctor_id`).post(authPatient, bookAppointment);
router.route(`/update/:appointment_id`).put(authDoctor, doctorUpdateAppointment);
router.route(`/cancel/:appointment_id`).delete(authDoctorOrPatient, cancelAppointment);
router.route(`/patient`).get(authPatient, getPatientAppointments);
router.route(`/doctor`).get(authDoctor, getDoctorAppointments);

export default router;
