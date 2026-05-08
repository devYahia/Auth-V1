import { Router } from "express";
import {
  renderHome,
  renderAddUser,
  renderEditUser,
  renderViewUser,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { isValid, isValidUpdate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", renderHome);
router.get("/user/add", renderAddUser);
router.get("/user/edit/:id", renderEditUser);
router.get("/user/view/:id", renderViewUser);

router.post("/users", isValid, addUser);
router.put("/users/:id", isValidUpdate, updateUser);
router.delete("/users/:id", deleteUser);

export default router;
