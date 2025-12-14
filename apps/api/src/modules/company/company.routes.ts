import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";
import { requireCompanyActive } from "../../middlewares/requireCompanyActive";

const router = Router();

/**
 * @openapi
 * /company/ping:
 *   get:
 *     tags: [Company]
 *     summary: Test endpoint (COMPANY must be ACTIVE)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company is ACTIVE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PingResponse"
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Company is not ACTIVE (PENDING/REJECTED) or wrong role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/ping", authGuard, requireRole("COMPANY"), requireCompanyActive, (_req, res) => {
  res.json({ ok: true, message: "company active" });
});

export default router;
