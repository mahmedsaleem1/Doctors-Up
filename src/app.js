import express from "express";
import sessionConfig from "./config/sessionsConfig.js";
import diagnoserRoutes from "./routes/aiDiagnoser.route.js";

const app = express();

// Middleware
app.use(sessionConfig);
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => res.render("landingPage"));
app.use("/diagnoser", diagnoserRoutes);

export default app;
