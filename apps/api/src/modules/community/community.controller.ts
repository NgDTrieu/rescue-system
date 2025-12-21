import { Request, Response } from "express";
import { CommunityTopicModel } from "./communityTopic.model";

function parseTags(tagParam?: string | string[]) {
  if (!tagParam) return undefined;
  const raw = Array.isArray(tagParam) ? tagParam.join(",") : tagParam;
  const tags = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

/**
 * GET /community/topics?sort=featured|top|new&q=...&tags=FUEL,TIRE&page=1&limit=10
 */
export async function listTopics(req: Request, res: Response) {
  const sort = (req.query.sort as string) || "featured";
  const q = (req.query.q as string) || "";
  const tags = parseTags(req.query.tags as any);

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (q.trim()) filter.$text = { $search: q.trim() };
  if (tags?.length) filter.tags = { $in: tags };

  let sortObj: any = { createdAt: -1 };
  if (sort === "featured") sortObj = { isFeatured: -1, upvotesCount: -1, advicesCount: -1, createdAt: -1 };
  if (sort === "top") sortObj = { upvotesCount: -1, advicesCount: -1, createdAt: -1 };
  if (sort === "new") sortObj = { createdAt: -1 };

  const [items, total] = await Promise.all([
    CommunityTopicModel.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name role")
      .lean(),
    CommunityTopicModel.countDocuments(filter),
  ]);

  res.json({
    page,
    limit,
    total,
    count: items.length,
    items: items.map((t: any) => ({
      id: t._id,
      title: t.title,
      contentPreview: t.content.slice(0, 200),
      tags: t.tags ?? [],
      isFeatured: t.isFeatured,
      viewsCount: t.viewsCount,
      advicesCount: t.advicesCount,
      upvotesCount: t.upvotesCount,
      createdBy: t.createdBy ? { id: t.createdBy._id, name: t.createdBy.name, role: t.createdBy.role } : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  });
}

/**
 * POST /community/topics
 * body: { title, content, tags? }
 */
export async function createTopic(req: Request, res: Response) {
  const userId = (req as any).user?.sub;

  const { title, content, tags } = req.body as {
    title?: string;
    content?: string;
    tags?: string[];
  };

  if (!title || !content) {
    return res.status(400).json({ message: "title and content are required" });
  }

  const cleanTags =
    Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toUpperCase()).filter(Boolean).slice(0, 10)
      : [];

  const doc = await CommunityTopicModel.create({
    title: String(title).trim(),
    content: String(content).trim(),
    tags: cleanTags,
    createdBy: userId,
  });

  return res.status(201).json({
    id: doc._id,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    isFeatured: doc.isFeatured,
    viewsCount: doc.viewsCount,
    advicesCount: doc.advicesCount,
    upvotesCount: doc.upvotesCount,
    createdAt: doc.createdAt,
  });
}
