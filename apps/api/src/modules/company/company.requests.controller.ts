import { Request, Response } from "express";
import { RescueRequestModel } from "../requests/request.model";

export async function listAssignedRequests(req: Request, res: Response) {
  const companyId = (req as any).user?.sub;
  const status = (req.query.status as string) || "PENDING";

  const items = await RescueRequestModel.find({
    assignedCompanyId: companyId,
    status,
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    status,
    count: items.length,
    items: items.map((r: any) => ({
      id: r._id,
      status: r.status,
      categoryId: r.categoryId,
      quotedBasePrice: r.quotedBasePrice,
      issueType: r.issueType,
      note: r.note,
      contactName: r.contactName,
      contactPhone: r.contactPhone,
      addressText: r.addressText,
      location: r.location
        ? { lng: r.location.coordinates?.[0], lat: r.location.coordinates?.[1] }
        : null,
      createdAt: r.createdAt,
    })),
  });
}
