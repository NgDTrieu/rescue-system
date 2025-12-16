import { Request, Response } from "express";
import { ServiceCategoryModel } from "./category.model";

export async function listCategories(_req: Request, res: Response) {
  const items = await ServiceCategoryModel.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  res.json({
    count: items.length,
    items: items.map((c) => ({
      id: c._id,
      key: c.key,
      name: c.name,
      description: c.description,
    })),
  });
}
