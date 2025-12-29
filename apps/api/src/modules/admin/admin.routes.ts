import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";
import { listCompanies, updateCompanyStatus } from "./admin.controller";
import {
  adminListCommunityTips,
  adminUpdateCommunityTip,
  adminDeleteCommunityTip,
} from "./admin.communityTips.controller";
import { adminReportOverview } from "./admin.reports.controller";


const router = Router();

/**
 * @openapi
 * /admin/companies:
 *   get:
 *     tags: [Admin]
 *     summary: List company accounts by status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, REJECTED]
 *         required: false
 *         example: PENDING
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CompanyListResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Forbidden (ADMIN only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/companies", authGuard, requireRole("ADMIN"), listCompanies);

/**
 * @openapi
 * /admin/companies/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve or reject a company account
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
 *             $ref: "#/components/schemas/UpdateCompanyStatusRequest"
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserPublic"
 *       400:
 *         description: Bad request
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
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch("/companies/:id/status", authGuard, requireRole("ADMIN"), updateCompanyStatus);

/**
 * @openapi
 * /admin/community-tips:
 *   get:
 *     tags: [Admin]
 *     summary: List community tips (ADMIN)
 *     security:
 *       - bearerAuth: []
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
router.get("/community-tips", authGuard, requireRole("ADMIN"), adminListCommunityTips);

/**
 * @openapi
 * /admin/community-tips/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a community tip (ADMIN)
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
 *             properties:
 *               title: { type: string }
 *               solution: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch("/community-tips/:id", authGuard, requireRole("ADMIN"), adminUpdateCommunityTip);

/**
 * @openapi
 * /admin/community-tips/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a community tip (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/community-tips/:id", authGuard, requireRole("ADMIN"), adminDeleteCommunityTip);

/**
 * @openapi
 * /admin/reports/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Admin overview report (users, requests, response rate, satisfaction...)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string, example: "2025-12-01" }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string, example: "2025-12-31" }
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/reports/overview", authGuard, requireRole("ADMIN"), adminReportOverview);


export default router;
