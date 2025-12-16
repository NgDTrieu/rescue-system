import { Router } from "express";
import { listCategories } from "./category.controller";

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List active service categories
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CategoryListResponse"
 */
router.get("/", listCategories);


export default router;
