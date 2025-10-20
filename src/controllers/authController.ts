import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username atau email sudah digunakan" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: { username, email, password: hashed },
    });

    const token = generateToken({ id: newUser.id, username: newUser.username });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
