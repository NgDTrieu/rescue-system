import { Request, Response } from "express";
import { RescueRequestModel } from "../requests/request.model";

export async function companyRequestHistory(req: Request, res: Response) {
  const companyId = (req as any).user?.sub;
  const status = (req.query.status as string) || "COMPLETED";
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const items = await RescueRequestModel.find({
    assignedCompanyId: companyId,
    status,
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  return res.json({
    status,
    count: items.length,
    items: items.map((r: any) => ({
      id: r._id,
      status: r.status,
      quotedBasePrice: r.quotedBasePrice,
      etaMinutes: r.etaMinutes ?? null,
      issueType: r.issueType,
      addressText: r.addressText,
      completedAt: r.completedAt ?? null,
      customerConfirmedAt: r.customerConfirmedAt ?? null,
      customerRating: r.customerRating ?? null,
      customerReview: r.customerReview ?? null,
      createdAt: r.createdAt,
    })),
  });
}
