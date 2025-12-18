import { Request, Response } from "express";
import { RescueRequestModel } from "./request.model";


export async function confirmAndReview(req: Request, res: Response) {
  const customerId = (req as any).user?.sub;
  const { id } = req.params;
  const { rating, review } = req.body as { rating?: number; review?: string };

  const rateNum = Number(rating);
  if (Number.isNaN(rateNum) || rateNum < 1 || rateNum > 5) {
    return res.status(400).json({ message: "rating must be 1..5" });
  }

  const doc = await RescueRequestModel.findOne({ _id: id, customerId });
  if (!doc) return res.status(404).json({ message: "Request not found" });

  if (doc.status !== "COMPLETED") {
    return res.status(400).json({ message: "Only COMPLETED requests can be confirmed/reviewed" });
  }

  // không cho confirm 2 lần
  if (doc.customerConfirmedAt) {
    return res.status(400).json({ message: "Already confirmed" });
  }

  doc.customerRating = rateNum;
  doc.customerReview = (review || "").trim() || undefined;
  doc.customerConfirmedAt = new Date();

  await doc.save();

  return res.json({
    id: doc._id,
    status: doc.status,
    customerRating: doc.customerRating,
    customerReview: doc.customerReview ?? null,
    customerConfirmedAt: doc.customerConfirmedAt,
  });
}
