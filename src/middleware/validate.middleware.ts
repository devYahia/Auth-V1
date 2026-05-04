import * as z from "zod";
import type { Request, Response, NextFunction } from "express";

const authSchema = z.object({
  Email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const updateSchema = z
  .object({
    Email: z.string().email().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .optional(),
  })
  .refine((data) => data.Email || data.password, {
    message: "At least one field (Email or password) must be provided",
  });

function isValid(req: Request, res: Response, next: NextFunction): void {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: result.error.flatten(),
    });
    return;
  }
  next();
}

function isValidUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: result.error.flatten(),
    });
    return;
  }
  next();
}

export { isValid, isValidUpdate };
