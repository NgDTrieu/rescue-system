import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";
import { requireCompanyActive } from "../../middlewares/requireCompanyActive";
import { updateCompanyProfile } from "./company.controller";
import { listAssignedRequests } from "./company.requests.controller";
import { updateEta } from "./company.eta.controller";
import { updateRequestStatus } from "./company.status.controller";
import { companyRequestHistory } from "./company.history.controller";




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

/**
 * @openapi
 * /company/requests:
 *   get:
 *     tags: [Company]
 *     summary: List rescue requests assigned to this company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         example: PENDING
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (COMPANY must be ACTIVE)
 */
router.get(
  "/requests",
  authGuard,
  requireRole("COMPANY"),
  requireCompanyActive,
  listAssignedRequests
);

/**
 * @openapi
 * /company/requests/{id}/eta:
 *   patch:
 *     tags: [Company]
 *     summary: Update ETA for an assigned rescue request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [etaMinutes]
 *             properties:
 *               etaMinutes:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (COMPANY must be ACTIVE)
 *       404:
 *         description: Not found
 */
router.patch(
  "/requests/:id/eta",
  authGuard,
  requireRole("COMPANY"),
  requireCompanyActive,
  updateEta
);

/**
 * @openapi
 * /company/requests/{id}/status:
 *   patch:
 *     tags: [Company]
 *     summary: Update status for an assigned rescue request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [IN_PROGRESS, COMPLETED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch(
  "/requests/:id/status",
  authGuard,
  requireRole("COMPANY"),
  requireCompanyActive,
  updateRequestStatus
);

/**
 * @openapi
 * /company/requests/history:
 *   get:
 *     tags: [Company]
 *     summary: Company request history (includes rating/review)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         example: COMPLETED
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: number, default: 20 }
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/requests/history",
  authGuard,
  requireRole("COMPANY"),
  requireCompanyActive,
  companyRequestHistory
);


export default router;
