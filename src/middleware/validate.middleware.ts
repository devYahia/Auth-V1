import * as z from "zod";
import type { Request, Response, NextFunction } from "express";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{6,15}$/, "Phone number must be 6 to 15 digits");

const userSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  secondName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phoneNumber: phoneSchema,
});

const updateSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    secondName: z.string().trim().min(1).optional(),
    email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
    phoneNumber: phoneSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

function flashErrorAndRedirect(
  req: Request,
  res: Response,
  error: z.ZodError
): void {
  const flat = error.flatten();
  const fieldErrors = Object.values(flat.fieldErrors).flat();
  const formErrors = flat.formErrors;
  const message =
    [...formErrors, ...fieldErrors].join(", ") ||
    "Invalid data. Please review your inputs.";
  req.flash("error", message);
  res.redirect(req.header("Referer") || "/");
}

function isValid(req: Request, res: Response, next: NextFunction): void {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    flashErrorAndRedirect(req, res, result.error);
    return;
  }
  req.body = result.data;
  next();
}

function isValidUpdate(req: Request, res: Response, next: NextFunction): void {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(req.body ?? {})) {
    if (typeof value === "string" && value.trim() === "") continue;
    cleaned[key] = value;
  }

  const result = updateSchema.safeParse(cleaned);
  if (!result.success) {
    flashErrorAndRedirect(req, res, result.error);
    return;
  }
  req.body = result.data;
  next();
}

export { isValid, isValidUpdate };
