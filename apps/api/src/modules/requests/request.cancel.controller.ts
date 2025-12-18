import { Request, Response } from "express";
import { RescueRequestModel } from "./request.model";



export async function cancelMyRequest(req: Request, res: Response) {
  const customerId = (req as any).user?.sub;
  const { id } = req.params;
  const { reason } = req.body as { reason?: string };

  const doc = await RescueRequestModel.findOne({ _id: id, customerId });
  if (!doc) return res.status(404).json({ message: "Request not found" });

  if (doc.status === "COMPLETED") {
    return res.status(400).json({ message: "Cannot cancel a COMPLETED request" });
  }
  if (doc.status === "CANCELLED") {
    return res.status(400).json({ message: "Request is already CANCELLED" });
  }

  doc.status = "CANCELLED";
  doc.cancelReason = (reason || "").trim() || "Customer cancelled";
  doc.cancelledAt = new Date();
  doc.cancelledBy = "CUSTOMER";

  await doc.save();

  return res.json({
    id: doc._id,
    status: doc.status,
    cancelReason: doc.cancelReason,
    cancelledAt: doc.cancelledAt,
  });
}
