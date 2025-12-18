import { Request, Response } from "express";
import { RescueRequestModel } from "../requests/request.model";

const ALLOWED: Record<string, string[]> = {
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};

export async function updateRequestStatus(req: Request, res: Response) {
  const companyId = (req as any).user?.sub;
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !["IN_PROGRESS", "COMPLETED"].includes(status)) {
    return res.status(400).json({ message: "status must be IN_PROGRESS or COMPLETED" });
  }

  const doc = await RescueRequestModel.findOne({ _id: id, assignedCompanyId: companyId });
  if (!doc) {
    return res.status(404).json({ message: "Request not found (or not assigned to this company)" });
  }

  if (doc.status === "CANCELLED") return res.status(400).json({ message: "Request is CANCELLED" });

  const allowedNext = ALLOWED[doc.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({ message: `Cannot move from ${doc.status} to ${status}` });
  }

  doc.status = status;

  if (status === "COMPLETED") {
    doc.completedAt = new Date();
  }

  await doc.save();

  return res.json({
    id: doc._id,
    status: doc.status,
    completedAt: doc.completedAt ?? null,
    updatedAt: doc.updatedAt,
  });
}
