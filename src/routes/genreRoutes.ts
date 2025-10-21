import express from "express";
import {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllGenres);
router.get("/:id", getGenreById);
router.post("/", authenticate, createGenre);
router.patch("/:id", authenticate, updateGenre);
router.delete("/:id", authenticate, deleteGenre);

export default router;
