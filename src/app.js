import express from "express";
import sessionConfig from "./config/sessionsConfig.js";
import diagnoserRoutes from "./routes/aiDiagnoser.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import patientRoutes from "./routes/patient.route.js";
import cookieParser from "cookie-parser";
import hospitalRoutes from "./routes/hospital.routes.js";
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import './config/passportDoctor.js'; 
import './config/passportPatient.js'; 
import authDoctorRoutes from './routes/authDoctor.route.js';
import authPatientRoutes from './routes/authPatient.route.js';
import appointmentRoute from "./routes/appointment.route.js";
import reviewRoute from "./routes/review.route.js";


dotenv.config();

const app = express();

// Middleware
app.use(sessionConfig);
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())
app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
    })
  );
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => res.render("landingPage"));
app.use("/api/v1/diagnoser", diagnoserRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/hospital", hospitalRoutes);
app.use("/auth/doctor", authDoctorRoutes);
app.use("/auth/patient", authPatientRoutes);
app.use("/api/v1/appointment", appointmentRoute)
app.use("/api/v1/review", reviewRoute)


export default app;
