import type { UserCredential } from "../types/user.types.js";
import { hashPass, comparePasswords } from "../utils/hashing.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
} from "../repositories/user.repository.js";

interface ServiceResult {
  status: number;
  message: string;
  data?: Omit<UserCredential, "hashedPassword">;
  userId?: string;
}

async function registerUser(
  Email: string,
  password: string
): Promise<ServiceResult> {
  const alreadyExists = findUserByEmail(Email);
  if (alreadyExists) {
    return { status: 409, message: "This Email is already exist" };
  }
  const hashedPass = await hashPass(password);
  const user = createUser(Email, hashedPass);
  return {
    status: 201,
    message: "User registered successfully",
    data: { id: user.id, Email: user.Email },
  };
}

async function loginUser(
  Email: string,
  password: string
): Promise<ServiceResult> {
  const user: UserCredential | undefined = findUserByEmail(Email);
  const dataCorrect: boolean = user
    ? await comparePasswords(password, user.hashedPassword)
    : false;

  if (!user || !dataCorrect) {
    return { status: 401, message: "Invalid credentials" };
  }
  return {
    status: 200,
    message: "Logged in successfully",
    userId: user.id,
  };
}

function getUserById(id: string): ServiceResult {
  const user = findUserById(id);
  if (!user) {
    return { status: 404, message: "User not found" };
  }
  return {
    status: 200,
    message: "User found",
    data: { id: user.id, Email: user.Email },
  };
}

async function updateUserById(
  id: string,
  data: { Email?: string; password?: string }
): Promise<ServiceResult> {
  const user = findUserById(id);
  if (!user) {
    return { status: 404, message: "User not found" };
  }

  const updateData: Partial<Omit<UserCredential, "id">> = {};

  if (data.Email) {
    const emailTaken = findUserByEmail(data.Email);
    if (emailTaken && emailTaken.id !== id) {
      return { status: 409, message: "This Email is already exist" };
    }
    updateData.Email = data.Email;
  }

  if (data.password) {
    updateData.hashedPassword = await hashPass(data.password);
  }

  const updated = updateUser(id, updateData);
  if (!updated) {
    return { status: 500, message: "Failed to update user" };
  }

  return {
    status: 200,
    message: "User updated successfully",
    data: { id: updated.id, Email: updated.Email },
  };
}

function deleteUserById(id: string): ServiceResult {
  const user = findUserById(id);
  if (!user) {
    return { status: 404, message: "User not found" };
  }
  deleteUser(id);
  return { status: 200, message: "User deleted successfully" };
}

export {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
export type { ServiceResult };
