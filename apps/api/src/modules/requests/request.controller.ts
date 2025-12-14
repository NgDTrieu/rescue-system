import { Request, Response } from "express";
import { RescueRequestModel } from "./request.model";

export async function createRequest(req: Request, res: Response) {
  const userId = (req as any).user?.sub;

  const { issueType, note, contactName, contactPhone, lat, lng, addressText } = req.body;

  // validate tối thiểu
  if (!issueType || !contactName || !contactPhone) {
    return res.status(400).json({ message: "issueType, contactName, contactPhone are required" });
  }
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

  const doc = await RescueRequestModel.create({
    customerId: userId,
    issueType,
    note,
    contactName,
    contactPhone,
    addressText,
    location: {
      type: "Point",
      coordinates: [lngNum, latNum], // [lng, lat]
    },
    status: "PENDING",
  });

  return res.status(201).json({
    id: doc._id,
    status: doc.status,
    issueType: doc.issueType,
    note: doc.note,
    contactName: doc.contactName,
    contactPhone: doc.contactPhone,
    addressText: doc.addressText,
    location: { lat: latNum, lng: lngNum },
    createdAt: doc.createdAt,
  });
}
