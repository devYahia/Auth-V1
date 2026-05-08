import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";

const back = (req: Request) => req.header("Referer") || "/";

const renderHome = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = search
      ? {
          $or: [
            { firstName: new RegExp(search, "i") },
            { secondName: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
          ],
        }
      : {};

    const users = await userModel.find(filter).sort({ createdAt: -1 });
    res.render("index", { users, search });
  } catch (error) {
    next(error);
  }
};

const renderAddUser = (_req: Request, res: Response): void => {
  res.render("user/add");
};

const renderEditUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash("error", "Invalid user id");
      res.redirect("/");
      return;
    }

    const user = await userModel.findById(id);
    if (!user) {
      req.flash("error", "User not found");
      res.redirect("/");
      return;
    }
    res.render("user/edit", { user });
  } catch (error) {
    next(error);
  }
};

const renderViewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash("error", "Invalid user id");
      res.redirect("/");
      return;
    }

    const user = await userModel.findById(id);
    if (!user) {
      req.flash("error", "User not found");
      res.redirect("/");
      return;
    }
    res.render("user/view", { user });
  } catch (error) {
    next(error);
  }
};

const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, secondName, email, phoneNumber } = req.body;

    const exists = await userModel.exists({ email });
    if (exists) {
      req.flash("error", "Email already exists");
      res.redirect(back(req));
      return;
    }

    await userModel.create({ firstName, secondName, email, phoneNumber });

    req.flash("success", "User created successfully");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash("error", "Invalid user id");
      res.redirect(back(req));
      return;
    }

    const updateData = req.body;

    if (updateData.email) {
      const conflict = await userModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (conflict) {
        req.flash("error", "Email already exists");
        res.redirect(back(req));
        return;
      }
    }

    const updated = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      req.flash("error", "User not found");
      res.redirect(back(req));
      return;
    }

    req.flash("success", "User updated successfully");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash("error", "Invalid user id");
      res.redirect(back(req));
      return;
    }

    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) {
      req.flash("error", "User not found");
      res.redirect(back(req));
      return;
    }

    req.flash("success", "User deleted successfully");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

export {
  renderHome,
  renderAddUser,
  renderEditUser,
  renderViewUser,
  addUser,
  updateUser,
  deleteUser,
};
