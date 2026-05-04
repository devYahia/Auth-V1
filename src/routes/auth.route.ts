import { Router } from "express";
import {
  register,
  login,
  getUser,
  updateUser,
  removeUser,
} from "../controllers/auth.controller.js";
import { isValid, isValidUpdate } from "../middleware/validate.middleware.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", isValid, register);
router.post("/login", isValid, login);
router.get("/users/:id", isAuth, getUser);
router.put("/users/:id", isAuth, isValidUpdate, updateUser);
router.delete("/users/:id", isAuth, removeUser);

export default router;
