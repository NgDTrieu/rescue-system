import { Request, Response, NextFunction } from "express";
import { UserModel } from "../modules/users/user.model";

export async function requireCompanyActive(req: Request, res: Response, next: NextFunction) {
  const payload = (req as any).user;
  if (!payload?.sub) return res.status(401).json({ message: "Unauthorized" });

  // chỉ check khi role là COMPANY
  if (payload.role !== "COMPANY") return next();

  const user = await UserModel.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (user.companyStatus !== "ACTIVE") {
    return res.status(403).json({
      message: `Company is ${user.companyStatus || "PENDING"}`,
      companyStatus: user.companyStatus || "PENDING",
    });
  }

  next();
}
