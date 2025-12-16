import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";
import { requireCompanyActive } from "../../middlewares/requireCompanyActive";
import { updateCompanyProfile } from "./company.controller";

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

/**
 * @openapi
 * /company/profile:
 *   patch:
 *     tags: [Company]
 *     summary: Update company profile (location + services + base prices)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateCompanyProfileRequest"
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UpdateCompanyProfileResponse"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Forbidden (COMPANY must be ACTIVE)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch("/profile", authGuard, requireRole("COMPANY"), requireCompanyActive, updateCompanyProfile);



export default router;
