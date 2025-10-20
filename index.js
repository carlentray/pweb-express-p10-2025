// index.js
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.json({ message: "Server running 🚀" });
});

// check database connection
app.get("/test-db", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Connected to database ✅" });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed ❌", details: err.message });
  } finally {
    await prisma.$disconnect();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
