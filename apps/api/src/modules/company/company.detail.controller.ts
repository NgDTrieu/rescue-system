import { Request, Response } from "express";
import { RescueRequestModel } from "../requests/request.model";

export async function getAssignedRequestDetail(req: Request, res: Response) {
  const companyId = (req as any).user?.sub;
  const { id } = req.params;

  const r = await RescueRequestModel.findOne({
    _id: id,
    assignedCompanyId: companyId,
  })
    .populate("categoryId", "key name")
    .populate("customerId", "name phone email")
    .lean();

  if (!r) return res.status(404).json({ message: "Request not found" });

  const category: any = r.categoryId;
  const customer: any = r.customerId;

  return res.json({
    id: r._id,
    status: r.status,

    category: category
      ? { id: category._id, key: category.key, name: category.name }
      : { id: r.categoryId },

    customer: customer
      ? { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email }
      : { id: r.customerId },

    quotedBasePrice: r.quotedBasePrice,
    etaMinutes: r.etaMinutes ?? null,

    issueType: r.issueType,
    note: r.note ?? null,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    addressText: r.addressText ?? null,
    location: r.location
      ? { lng: r.location.coordinates?.[0], lat: r.location.coordinates?.[1] }
      : null,

    // hoàn tất / đánh giá
    completedAt: r.completedAt ?? null,
    customerConfirmedAt: r.customerConfirmedAt ?? null,
    customerRating: r.customerRating ?? null,
    customerReview: r.customerReview ?? null,

    // hủy
    cancelReason: r.cancelReason ?? null,
    cancelledAt: r.cancelledAt ?? null,
    cancelledBy: r.cancelledBy ?? null,

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}
