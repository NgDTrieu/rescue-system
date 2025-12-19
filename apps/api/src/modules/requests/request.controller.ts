import { Request, Response } from "express";
import { Types } from "mongoose";
import { RescueRequestModel } from "./request.model";
import { UserModel } from "../users/user.model";


export async function createRequest(req: Request, res: Response) {
  const customerId = (req as any).user?.sub;

  const {
    categoryId,
    companyId,
    issueType,
    note,
    contactName,
    contactPhone,
    lat,
    lng,
    addressText,
  } = req.body;

  // validate required fields
  if (!categoryId || !companyId) {
    return res.status(400).json({ message: "categoryId and companyId are required" });
  }
  if (!issueType || !contactName || !contactPhone) {
    return res.status(400).json({ message: "issueType, contactName, contactPhone are required" });
  }
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  // validate ObjectId
  if (!Types.ObjectId.isValid(String(categoryId))) {
    return res.status(400).json({ message: "categoryId is invalid" });
  }
  if (!Types.ObjectId.isValid(String(companyId))) {
    return res.status(400).json({ message: "companyId is invalid" });
  }

  // validate location
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return res.status(400).json({ message: "lat/lng must be numbers" });
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ message: "lat/lng out of range" });
  }

  // Validate company exists + ACTIVE + has service category
  const company = await UserModel.findOne({
    _id: companyId,
    role: "COMPANY",
    companyStatus: "ACTIVE",
    companyServices: { $elemMatch: { categoryId: new Types.ObjectId(String(categoryId)) } },
  }).lean();

  if (!company) {
    return res.status(400).json({ message: "Selected company is invalid or does not provide this service" });
  }

  const svc = (company.companyServices || []).find(
    (s: any) => String(s.categoryId) === String(categoryId)
  );
  const quotedBasePrice = Number(svc?.basePrice ?? 0);

  const doc = await RescueRequestModel.create({
    customerId,
    categoryId: new Types.ObjectId(String(categoryId)),
    assignedCompanyId: new Types.ObjectId(String(companyId)),
    quotedBasePrice,

    issueType,
    note,
    contactName,
    contactPhone,
    addressText,
    location: { type: "Point", coordinates: [lngNum, latNum] },

    status: "PENDING",
  });

  return res.status(201).json({
    id: doc._id,
    status: doc.status,
    categoryId: doc.categoryId,
    assignedCompanyId: doc.assignedCompanyId,
    quotedBasePrice: doc.quotedBasePrice,

    issueType: doc.issueType,
    note: doc.note,
    contactName: doc.contactName,
    contactPhone: doc.contactPhone,
    addressText: doc.addressText,
    location: { lat: latNum, lng: lngNum },
    createdAt: doc.createdAt,
  });
}
