import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { requireRole } from "../../middlewares/requireRole";
import { createRequest } from "./request.controller";
import { listMyRequests, getMyRequestDetail } from "./request.query.controller";
import { confirmAndReview } from "./request.confirm.controller";


const router = Router();

/**
 * @openapi
 * /requests:
 *   post:
 *     tags: [Requests]
 *     summary: Create a rescue request (CUSTOMER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateRescueRequest"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RescueRequestResponse"
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
 *         description: Forbidden (CUSTOMER only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/", authGuard, requireRole("CUSTOMER"), createRequest);

/**
 * @openapi
 * /requests/my:
 *   get:
 *     tags: [Requests]
 *     summary: List my rescue requests (CUSTOMER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MyRequestListResponse"
 */
router.get("/my", authGuard, requireRole("CUSTOMER"), listMyRequests);

/**
 * @openapi
 * /requests/{id}:
 *   get:
 *     tags: [Requests]
 *     summary: Get my rescue request detail (CUSTOMER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MyRequestDetailResponse"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/:id", authGuard, requireRole("CUSTOMER"), getMyRequestDetail);

/**
 * @openapi
 * /requests/{id}/confirm:
 *   patch:
 *     tags: [Requests]
 *     summary: Customer confirms completion and rates the service
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Đến nhanh, hỗ trợ tốt"
 *     responses:
 *       200:
 *         description: Confirmed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch("/:id/confirm", authGuard, requireRole("CUSTOMER"), confirmAndReview);


export default router;
