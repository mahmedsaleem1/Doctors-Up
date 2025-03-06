import express from "express";
import sessionConfig from "./config/sessionsConfig.js";
import diagnoserRoutes from "./routes/aiDiagnoser.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import patientRoutes from "./routes/patient.route.js";
import cookieParser from "cookie-parser";
import hospitalRoutes from "./routes/hospital.routes.js";

const app = express();

// Middleware
app.use(sessionConfig);
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

// Routes
app.get("/", (req, res) => res.render("landingPage"));
app.use("/api/v1/diagnoser", diagnoserRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/hospital", hospitalRoutes);


export default app;
