import { Router } from "express";
import { suggestCompanies } from "./companies.controller";

const router = Router();

/**
 * @openapi
 * /companies/suggest:
 *   get:
 *     tags: [Companies]
 *     summary: Suggest nearby ACTIVE companies for a service category (with base price)
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radiusKm
 *         required: false
 *         schema: { type: number, default: 10 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: number, default: 10 }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CompanySuggestResponse"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/suggest", suggestCompanies);


export default router;
