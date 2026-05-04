import crypto from "crypto";
import type { UserCredential } from "../types/user.types.js";

// userSchema and DB
const localDB: UserCredential[] = [];

function findUserByEmail(Email: string): UserCredential | undefined {
  return localDB.find((u) => u.Email === Email);
}

function findUserById(id: string): UserCredential | undefined {
  return localDB.find((u) => u.id === id);
}

function createUser(Email: string, hashedPass: string): UserCredential {
  const user: UserCredential = {
    id: crypto.randomUUID(),
    Email: Email,
    hashedPassword: hashedPass,
  };
  localDB.push(user);
  return user;
}

function updateUser(
  id: string,
  data: Partial<Omit<UserCredential, "id">>
): UserCredential | undefined {
  const index = localDB.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  localDB[index] = { ...localDB[index], ...data };
  return localDB[index];
}

function deleteUser(id: string): boolean {
  const index = localDB.findIndex((u) => u.id === id);
  if (index === -1) return false;
  localDB.splice(index, 1);
  return true;
}

export { createUser, findUserByEmail, findUserById, updateUser, deleteUser };
