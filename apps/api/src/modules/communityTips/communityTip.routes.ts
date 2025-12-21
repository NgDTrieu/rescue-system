import { Router } from "express";
import { listTips, createTip } from "./communityTip.controller";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";

const router = Router();

/**
 * @openapi
 * /community/tips:
 *   get:
 *     tags: [Community]
 *     summary: List community tips (title + solution)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
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
router.get("/tips", listTips);

/**
 * @openapi
 * /community/tips:
 *   post:
 *     tags: [Community]
 *     summary: Create a new community tip (CUSTOMER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, solution]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Xe hết xăng giữa đường"
 *               solution:
 *                 type: string
 *                 example: "Bật đèn cảnh báo, dắt xe vào lề, gọi cứu hộ hoặc tìm cây xăng gần nhất..."
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post("/tips", authGuard, requireRole("CUSTOMER"), createTip);

export default router;
