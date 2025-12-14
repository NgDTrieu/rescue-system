import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../shared/jwt";

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }

  const token = auth.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    // payload: { sub, role, iat, exp }
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
