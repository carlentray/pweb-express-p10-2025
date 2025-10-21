import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = req.body;

    if (!title || !writer || !publisher || !publication_year || !price || !stock_quantity || !genre_id)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    const existingBook = await prisma.books.findUnique({ where: { title } });
    if (existingBook) return res.status(400).json({ message: "Judul buku sudah ada" });

    const genre = await prisma.genres.findUnique({ where: { id: genre_id } });
    if (!genre) return res.status(404).json({ message: "Genre tidak ditemukan" });

    const newBook = await prisma.books.create({
      data: { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id },
    });

    res.status(201).json({ message: "Buku berhasil ditambahkan", book: newBook });
  } catch {
    res.status(500).json({ message: "Gagal menambahkan buku" });
  }
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, title, genre_id } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filters: any = { deleted_at: null };
    if (title) filters.title = { contains: String(title), mode: "insensitive" };
    if (genre_id) filters.genre_id = String(genre_id);

    const books = await prisma.books.findMany({
      where: filters,
      skip,
      take: Number(limit),
      include: { genre: true },
    });

    res.status(200).json(books);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data buku" });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.books.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book || book.deleted_at) return res.status(404).json({ message: "Buku tidak ditemukan" });
    res.status(200).json(book);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data buku" });
  }
};

export const getBooksByGenre = async (req: Request, res: Response) => {
  try {
    const { genre_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const books = await prisma.books.findMany({
      where: { genre_id, deleted_at: null },
      skip,
      take: Number(limit),
      include: { genre: true },
    });

    res.status(200).json(books);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data buku berdasarkan genre" });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const book = await prisma.books.findUnique({ where: { id } });
    if (!book || book.deleted_at) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const updatedBook = await prisma.books.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: "Buku berhasil diperbarui", book: updatedBook });
  } catch {
    res.status(500).json({ message: "Gagal memperbarui buku" });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book = await prisma.books.findUnique({ where: { id } });
    if (!book || book.deleted_at) return res.status(404).json({ message: "Buku tidak ditemukan" });

    await prisma.books.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    res.status(200).json({ message: "Buku berhasil dihapus" });
  } catch {
    res.status(500).json({ message: "Gagal menghapus buku" });
  }
};
