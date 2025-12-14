import { Request, Response } from "express";
import { UserModel } from "../users/user.model";

export async function listCompanies(req: Request, res: Response) {
  const status = (req.query.status as string) || "PENDING";

  const companies = await UserModel.find({
    role: "COMPANY",
    companyStatus: status,
  }).select("-passwordHash");

  return res.json({
    status,
    count: companies.length,
    items: companies.map((u) => ({
      id: u._id,
      email: u.email,
      role: u.role,
      name: u.name,
      phone: u.phone,
      companyName: u.companyName,
      companyStatus: u.companyStatus,
      createdAt: u.createdAt,
    })),
  });
}

export async function updateCompanyStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { companyStatus } = req.body;

  if (!companyStatus || !["ACTIVE", "REJECTED"].includes(companyStatus)) {
    return res.status(400).json({ message: "companyStatus must be ACTIVE or REJECTED" });
  }

  const user = await UserModel.findById(id);
  if (!user) return res.status(404).json({ message: "Company not found" });

  if (user.role !== "COMPANY") {
    return res.status(400).json({ message: "User is not a COMPANY" });
  }

  user.companyStatus = companyStatus;
  await user.save();

  return res.json({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
    updatedAt: user.updatedAt,
  });
}
