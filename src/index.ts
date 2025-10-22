import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import transactionRoutes from "./routes/transactionRoutes"; // ✅ tambahan

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/transactions", transactionRoutes); // ✅ tambahan

app.get("/", (req, res) => {
  res.send("🚀 IT Literature Shop API is running");
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

startServer();
