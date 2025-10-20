import express from "express";
import { getAllBooks, createBook } from "../controllers/bookController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllBooks);
router.post("/", authenticate, createBook);

export default router;
