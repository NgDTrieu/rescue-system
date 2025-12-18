import { Request, Response } from "express";
import { RescueRequestModel } from "../requests/request.model";
import { getIO } from "../../shared/realtime";

export async function updateEta(req: Request, res: Response) {
  const companyId = (req as any).user?.sub;
  const { id } = req.params;
  const { etaMinutes } = req.body;

  const etaNum = Number(etaMinutes);
  if (Number.isNaN(etaNum) || etaNum < 0) {
    return res.status(400).json({ message: "etaMinutes must be a non-negative number" });
  }

  // Chỉ update nếu request đúng công ty được gán
  const reqDoc = await RescueRequestModel.findOne({
    _id: id,
    assignedCompanyId: companyId,
  });

  if (!reqDoc) {
    return res.status(404).json({ message: "Request not found (or not assigned to this company)" });
  }

  // Không cho update ETA nếu đã completed/cancelled
  if (reqDoc.status === "COMPLETED" || reqDoc.status === "CANCELLED") {
    return res.status(400).json({ message: `Cannot update ETA when status is ${reqDoc.status}` });
  }

  reqDoc.etaMinutes = etaNum;

  // Khi company phản hồi ETA => coi như đã tiếp nhận
  if (reqDoc.status === "PENDING") {
    reqDoc.status = "ASSIGNED";
  }

  await reqDoc.save();

  getIO().to(`user:${String(reqDoc.customerId)}`).emit("request:eta", {
    requestId: String(reqDoc._id),
    status: reqDoc.status,
    etaMinutes: reqDoc.etaMinutes,
    updatedAt: reqDoc.updatedAt,
  });

  return res.json({
    id: reqDoc._id,
    status: reqDoc.status,
    etaMinutes: reqDoc.etaMinutes,
    updatedAt: reqDoc.updatedAt,
  });
}
