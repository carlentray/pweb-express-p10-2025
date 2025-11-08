import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionStats,
} from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticate, createTransaction);
router.get("/", authenticate, getAllTransactions);
router.get("/statistics/top", authenticate, getTransactionStats);
router.get("/:id", authenticate, getTransactionById);

export default router;
