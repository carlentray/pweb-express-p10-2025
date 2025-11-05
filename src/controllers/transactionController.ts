import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Item pesanan wajib diisi" });
    }

    const ids = items.map((i) => i.book_id);
    if (new Set(ids).size !== ids.length) {
      return res
        .status(400)
        .json({ message: "Tidak boleh ada buku yang sama dalam satu transaksi" });
    }

    for (const item of items) {
      if (!item.book_id || typeof item.quantity !== "number") {
        return res.status(400).json({ message: "Format item tidak valid" });
      }

      if (item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Jumlah pembelian harus lebih dari 0" });
      }
    }

    const createdOrder = await prisma.orders.create({
      data: {
        user_id: user.id,
        order_items: {
          create: await Promise.all(
            items.map(async (item) => {
              const book = await prisma.books.findUnique({
                where: { id: item.book_id },
              });

              if (!book || book.deleted_at)
                throw new Error(`Buku ${item.book_id} tidak ditemukan`);

              if (book.stock_quantity < item.quantity)
                throw new Error(`Stok buku ${book.title} tidak cukup`);

              await prisma.books.update({
                where: { id: item.book_id },
                data: {
                  stock_quantity: book.stock_quantity - item.quantity,
                },
              });

              return { book_id: item.book_id, quantity: item.quantity };
            })
          ),
        },
      },
      include: { order_items: { include: { book: true } } },
    });

    res
      .status(201)
      .json({ message: "Transaksi berhasil dibuat", order: createdOrder });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Gagal membuat transaksi" });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const orders = await prisma.orders.findMany({
      where: { user_id: user.id },
      include: {
        order_items: { include: { book: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(orders);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const order = await prisma.orders.findUnique({
      where: { id },
      include: { order_items: { include: { book: true } } },
    });

    if (!order || order.user_id !== user.id)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    res.status(200).json(order);
  } catch {
    res.status(500).json({ message: "Gagal mengambil detail transaksi" });
  }
};

export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.order_items.groupBy({
      by: ["book_id"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const books = await prisma.books.findMany({
      where: { id: { in: stats.map((s) => s.book_id) } },
      select: { id: true, title: true },
    });

    const result = stats.map((s) => ({
      book: books.find((b) => b.id === s.book_id)?.title || "Tidak diketahui",
      total_terjual: s._sum.quantity,
    }));

    res.status(200).json({ message: "Statistik transaksi", result });
  } catch {
    res.status(500).json({ message: "Gagal mengambil statistik transaksi" });
  }
};
