import { Router } from "express";
import { listTopics, createTopic } from "./community.controller";
import { authGuard } from "../../middlewares/authGuard";

const router = Router();

/**
 * @openapi
 * /community/topics:
 *   get:
 *     tags: [Community]
 *     summary: List community topics (featured/top/new)
 *     parameters:
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [featured, top, new]
 *           default: featured
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         required: false
 *         schema: { type: string, example: "FUEL,TIRE" }
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: number, default: 10 }
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/topics", listTopics);

/**
 * @openapi
 * /community/topics:
 *   post:
 *     tags: [Community]
 *     summary: Create a new community topic (authenticated)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Xe chết máy khi trời mưa, xử lý thế nào?"
 *               content:
 *                 type: string
 *                 example: "Mình đi qua đoạn ngập nhẹ thì xe chết máy..."
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["RAIN", "ENGINE"]
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post("/topics", authGuard, createTopic);

export default router;
