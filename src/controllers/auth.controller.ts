import type { Request, Response } from "express";

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

import {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../services/auth.service.js";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Email, password } = req.body;
    const result = await registerUser(Email, password);
    res.status(result.status).json({ message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Email, password } = req.body;
    const result = await loginUser(Email, password);
    if (result.userId) {
      req.session.userId = result.userId;
    }
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, "id");
    const result = getUserById(id);
    res.status(result.status).json({ message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, "id");
    const { Email, password } = req.body;
    const result = await updateUserById(id, { Email, password });
    res.status(result.status).json({ message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, "id");
    const result = deleteUserById(id);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export { register, login, getUser, updateUser, removeUser };
