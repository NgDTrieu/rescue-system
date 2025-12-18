import { Request, Response } from "express";
import { RescueRequestModel } from "./request.model";

export async function listMyRequests(req: Request, res: Response) {
  const customerId = (req as any).user?.sub;
  const status = (req.query.status as string) || undefined;

  const filter: any = { customerId };
  if (status) filter.status = status;

  const items = await RescueRequestModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    count: items.length,
    items: items.map((r: any) => ({
      id: r._id,
      status: r.status,
      categoryId: r.categoryId,
      assignedCompanyId: r.assignedCompanyId,
      quotedBasePrice: r.quotedBasePrice,
      etaMinutes: r.etaMinutes ?? null,
      issueType: r.issueType,
      addressText: r.addressText,
      createdAt: r.createdAt,
    })),
  });
}

export async function getMyRequestDetail(req: Request, res: Response) {
  const customerId = (req as any).user?.sub;
  const { id } = req.params;

  const r = await RescueRequestModel.findOne({ _id: id, customerId })
    .populate("assignedCompanyId", "companyName name phone companyStatus")
    .populate("categoryId", "key name")
    .lean();

  if (!r) return res.status(404).json({ message: "Request not found" });

  const company: any = r.assignedCompanyId;
  const category: any = r.categoryId;

  return res.json({
    id: r._id,
    status: r.status,

    category: category
      ? { id: category._id, key: category.key, name: category.name }
      : { id: r.categoryId },

    company: company
      ? {
          id: company._id,
          companyName: company.companyName ?? company.name,
          phone: company.phone,
          companyStatus: company.companyStatus,
        }
      : { id: r.assignedCompanyId },

    quotedBasePrice: r.quotedBasePrice,
    etaMinutes: r.etaMinutes ?? null,

    issueType: r.issueType,
    note: r.note,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    addressText: r.addressText,
    location: r.location
      ? { lng: r.location.coordinates?.[0], lat: r.location.coordinates?.[1] }
      : null,

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,

    completedAt: r.completedAt ?? null,
    customerConfirmedAt: r.customerConfirmedAt ?? null,
    customerRating: r.customerRating ?? null,
    customerReview: r.customerReview ?? null,

  });
}
