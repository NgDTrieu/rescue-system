import { Request, Response } from "express";
import { CommunityTipModel } from "./communityTip.model";

/**
 * GET /community/tips?q=&page=&limit=
 */
export async function listTips(req: Request, res: Response) {
  const q = (req.query.q as string) || "";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (q.trim()) filter.$text = { $search: q.trim() };

  const [items, total] = await Promise.all([
    CommunityTipModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
    })),
  });
}

/**
 * POST /community/tips
 * body: { title, solution }
 */
export async function createTip(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { title, solution } = req.body as { title?: string; solution?: string };

  if (!title || !solution) {
    return res.status(400).json({ message: "title and solution are required" });
  }

  const doc = await CommunityTipModel.create({
    title: String(title).trim(),
    solution: String(solution).trim(),
    createdBy: userId,
  });

  return res.status(201).json({
    id: doc._id,
    title: doc.title,
    solution: doc.solution,
    createdAt: doc.createdAt,
  });
}
