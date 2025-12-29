import { Request, Response } from "express";
import mongoose from "mongoose";
import { CommunityTipModel } from "../communityTips/communityTip.model";

/**
 * GET /admin/community-tips?q=&page=&limit=
 * Admin list tips (kèm createdBy)
 */
export async function adminListCommunityTips(req: Request, res: Response) {
  const q = (req.query.q as string) || "";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (q.trim()) filter.$text = { $search: q.trim() };

  const [items, total] = await Promise.all([
    CommunityTipModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "email name role")
      .lean(),
    CommunityTipModel.countDocuments(filter),
  ]);

  return res.json({
    page,
    limit,
    total,
    count: items.length,
    items: items.map((t: any) => ({
      id: t._id,
      title: t.title,
      solution: t.solution,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      createdBy: t.createdBy
        ? {
            id: t.createdBy._id,
            email: t.createdBy.email,
            name: t.createdBy.name,
            role: t.createdBy.role,
          }
        : null,
    })),
  });
}

/**
 * PATCH /admin/community-tips/:id
 * body: { title?, solution? }
 */
export async function adminUpdateCommunityTip(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid tip id" });
  }

  const { title, solution } = req.body as { title?: string; solution?: string };

  if (title === undefined && solution === undefined) {
    return res.status(400).json({ message: "title or solution is required" });
  }

  const tip = await CommunityTipModel.findById(id);
  if (!tip) return res.status(404).json({ message: "Tip not found" });

  if (title !== undefined) tip.title = String(title).trim();
  if (solution !== undefined) tip.solution = String(solution).trim();

  // mongoose sẽ validate minlength/maxlength theo schema
  await tip.save();

  return res.json({
    id: tip._id,
    title: tip.title,
    solution: tip.solution,
    createdAt: tip.createdAt,
    updatedAt: tip.updatedAt,
  });
}

/**
 * DELETE /admin/community-tips/:id
 */
export async function adminDeleteCommunityTip(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid tip id" });
  }

  const deleted = await CommunityTipModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Tip not found" });

  return res.json({ ok: true, id });
}
