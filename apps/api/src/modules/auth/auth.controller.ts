import { Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { hashPassword } from "../../shared/password";
import { comparePassword } from "../../shared/password";
import { signAccessToken } from "../../shared/jwt";
import { Request, Response } from "express";

export async function register(req: Request, res: Response) {
  const { email, password, role, name, phone, companyName } = req.body;

  // 1) Không cho tự đăng ký ADMIN
  if (role === "ADMIN") {
    return res.status(403).json({ message: "ADMIN cannot be registered publicly" });
  }

  // 2) Validate tối thiểu
  if (!email || !password || !role || !name) {
    return res.status(400).json({ message: "email, password, role, name are required" });
  }
  if (!["CUSTOMER", "COMPANY"].includes(role)) {
    return res.status(400).json({ message: "role must be CUSTOMER or COMPANY" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: "password must be at least 6 chars" });
  }

  // 3) COMPANY cần companyName
  if (role === "COMPANY" && !companyName) {
    return res.status(400).json({ message: "companyName is required for COMPANY" });
  }

  // 4) Check tồn tại
  const existed = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (existed) return res.status(409).json({ message: "Email already exists" });

  // 5) Create user
  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    name,
    phone,
    companyName: role === "COMPANY" ? companyName : undefined,
    companyStatus: role === "COMPANY" ? "PENDING" : undefined,
  });

  // 6) Response (không trả passwordHash)
  return res.status(201).json({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
    createdAt: user.createdAt,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const ok = await comparePassword(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Rule cho COMPANY chưa duyệt:
  // Cách đơn giản (khuyên dùng): vẫn cho login, nhưng báo trạng thái để UI xử lý
  // Nếu bạn muốn CHẶN login khi PENDING thì đổi sang return 403 ở đây.
  // if (user.role === "COMPANY" && user.companyStatus !== "ACTIVE") {
  //   return res.status(403).json({ message: `Company is ${user.companyStatus}` });
  // }

  const accessToken = signAccessToken({
    sub: String(user._id),
    role: user.role,
  });

  return res.json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      companyStatus: user.companyStatus,
    },
  });
}

export async function me(req: any, res: any) {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    companyName: user.companyName,
    companyStatus: user.companyStatus,
    createdAt: user.createdAt,
  });
}

export async function logout(_req: Request, res: Response) {
  // JWT stateless: backend không giữ session để "xoá"
  // Sau này nếu có refresh token cookie -> clear tại đây
  return res.json({ message: "Logged out" });
}
