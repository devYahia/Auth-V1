import type { Request, Response, NextFunction } from "express";

function isAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ message: "not logged in" });
    return;
  }
  next();
}

export { isAuth };
