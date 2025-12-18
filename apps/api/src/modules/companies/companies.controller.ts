import { Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { Types } from "mongoose";


export async function suggestCompanies(req: Request, res: Response) {
  const { categoryId, lat, lng, radiusKm = "10", limit = "10" } = req.query as any;

  if (!Types.ObjectId.isValid(String(categoryId))) {
    return res.status(400).json({ message: "categoryId is invalid" });
  }

  const categoryObjId = new Types.ObjectId(String(categoryId));

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const radiusNum = Number(radiusKm);
  const limitNum = Math.min(Number(limit) || 10, 50);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return res.status(400).json({ message: "lat/lng must be numbers" });
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ message: "lat/lng out of range" });
  }
  if (Number.isNaN(radiusNum) || radiusNum <= 0) {
    return res.status(400).json({ message: "radiusKm must be a positive number" });
  }

  const radiusMeters = radiusNum * 1000;

  // Geo query + filter service category
  const docs = await UserModel.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lngNum, latNum] },
        distanceField: "distanceMeters",
        maxDistance: radiusMeters,
        spherical: true,
        query: {
          role: "COMPANY",
          companyStatus: "ACTIVE",
          companyLocation: { $exists: true },
          companyServices: { $elemMatch: { categoryId: categoryObjId } },
        },
      },
    },
    {
      $project: {
        email: 1,
        name: 1,
        phone: 1,
        companyName: 1,
        companyStatus: 1,
        companyLocation: 1,
        companyServices: 1,
        distanceMeters: 1,
      },
    },
    { $limit: limitNum },
  ]);

  // Lấy basePrice đúng categoryId
  const items = docs.map((c: any) => {
    const svc = (c.companyServices || []).find(
      (s: any) => String(s.categoryId) === String(categoryId)
    );

    return {
      id: c._id,
      companyName: c.companyName ?? c.name,
      phone: c.phone,
      distanceKm: Math.round((c.distanceMeters / 1000) * 100) / 100,
      basePrice: svc?.basePrice ?? null,
      location: c.companyLocation
        ? { lng: c.companyLocation.coordinates?.[0], lat: c.companyLocation.coordinates?.[1] }
        : null,
    };
  });

  return res.json({ count: items.length, items });
}
