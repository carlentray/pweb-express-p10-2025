import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.books.findMany({
      include: { genre: true },
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data buku" });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = req.body;

    const newBook = await prisma.books.create({
      data: { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id },
    });

    res.status(201).json({ message: "Buku berhasil ditambahkan", book: newBook });
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan buku" });
  }
};
