import { Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { ServiceCategoryModel } from "../categories/category.model";

export async function updateCompanyProfile(req: Request, res: Response) {
  const userId = (req as any).user?.sub;

  const { lat, lng, services } = req.body as {
    lat?: number;
    lng?: number;
    services?: Array<{ categoryId: string; basePrice: number }>;
  };

  // Validate location
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "lat and lng are required" });
  }
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return res.status(400).json({ message: "lat/lng must be numbers" });
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ message: "lat/lng out of range" });
  }

  // Validate services
  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ message: "services must be a non-empty array" });
  }
  for (const s of services) {
    if (!s?.categoryId) return res.status(400).json({ message: "categoryId is required" });
    const price = Number(s.basePrice);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ message: "basePrice must be a non-negative number" });
    }
  }

  // Check categoryId tồn tại (để tránh lưu rác)
  const categoryIds = services.map((s) => s.categoryId);
  const count = await ServiceCategoryModel.countDocuments({ _id: { $in: categoryIds }, isActive: true });
  if (count !== categoryIds.length) {
    return res.status(400).json({ message: "Some categoryId is invalid/inactive" });
  }

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: "Company not found" });

  // Update
  user.companyLocation = { type: "Point", coordinates: [lngNum, latNum] };

  user.companyServices = services.map((s) => ({
    categoryId: s.categoryId as any,
    basePrice: Number(s.basePrice),
  })) as any;

  await user.save();

  return res.json({
    id: user._id,
    companyLocation: { lat: latNum, lng: lngNum },
    companyServices: user.companyServices,
    updatedAt: user.updatedAt,
  });
}
