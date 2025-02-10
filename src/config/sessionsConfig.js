import session from "express-session";

export default session({
  secret: process.env.SESSION_SECRET_KEY, // Ensure secret exists
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.SESSION_SECURE === "true", // Convert string to boolean
    httpOnly: true,
    maxAge: parseInt(process.env.CHAT_SESSION_EXPIRY, 10) || 3600000, // Convert to number
  },
});
