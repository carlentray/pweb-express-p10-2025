import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Nama genre wajib diisi" });

    const existing = await prisma.genres.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ message: "Genre sudah ada" });

    const genre = await prisma.genres.create({ data: { name } });
    res.status(201).json({ message: "Genre berhasil ditambahkan", genre });
  } catch {
    res.status(500).json({ message: "Gagal menambahkan genre" });
  }
};

export const getAllGenres = async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genres.findMany({ where: { deleted_at: null } });
    res.status(200).json(genres);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data genre" });
  }
};

export const getGenreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const genre = await prisma.genres.findUnique({ where: { id } });
    if (!genre || genre.deleted_at) return res.status(404).json({ message: "Genre tidak ditemukan" });
    res.status(200).json(genre);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data genre" });
  }
};

export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Nama genre wajib diisi" });

    const genre = await prisma.genres.findUnique({ where: { id } });
    if (!genre || genre.deleted_at) return res.status(404).json({ message: "Genre tidak ditemukan" });

    const updated = await prisma.genres.update({ where: { id }, data: { name } });
    res.status(200).json({ message: "Genre berhasil diperbarui", genre: updated });
  } catch {
    res.status(500).json({ message: "Gagal memperbarui genre" });
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const genre = await prisma.genres.findUnique({ where: { id } });
    if (!genre || genre.deleted_at) return res.status(404).json({ message: "Genre tidak ditemukan" });

    await prisma.genres.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    res.status(200).json({ message: "Genre berhasil dihapus" });
  } catch {
    res.status(500).json({ message: "Gagal menghapus genre" });
  }
};
