import express from "express";
import {
  getAllBooks,
  createBook,
  getBookById,
  getBooksByGenre,
  updateBook,
  deleteBook,
} from "../controllers/bookController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.get("/genre/:genre_id", getBooksByGenre);
router.post("/", authenticate, createBook);
router.patch("/:id", authenticate, updateBook);
router.delete("/:id", authenticate, deleteBook);

export default router;

