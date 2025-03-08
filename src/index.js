import app from "./app.js";
import dotenv from "dotenv";
import { prisma } from "../src/config/prismaDb.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await prisma.$connect();
});
