import { Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { RescueRequestModel } from "../requests/request.model";
import { CategoryModel } from "../categories/category.model"; // tên model ServiceCategory trong code bạn là CategoryModel
import mongoose from "mongoose";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function parseDateRange(req: Request) {
  const fromStr = (req.query.from as string) || "";
  const toStr = (req.query.to as string) || "";

  // mặc định: 30 ngày gần nhất
  let from = startOfDay(addDays(new Date(), -30));
  let to = startOfDay(new Date()); // today 00:00

  if (fromStr) from = startOfDay(new Date(fromStr));
  if (toStr) to = startOfDay(new Date(toStr));

  // toExclusive = đầu ngày hôm sau để query $lt
  const toExclusive = addDays(to, 1);

  return { from, to, toExclusive };
}

/**
 * GET /admin/reports/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function adminReportOverview(req: Request, res: Response) {
  const { from, to, toExclusive } = parseDateRange(req);

  const requestDateFilter = { createdAt: { $gte: from, $lt: toExclusive } };

  // 1) USERS
  const [
    totalUsers,
    totalCustomers,
    totalAdmins,
    totalCompanies,
    companyByStatusAgg,
  ] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ role: "CUSTOMER" }),
    UserModel.countDocuments({ role: "ADMIN" }),
    UserModel.countDocuments({ role: "COMPANY" }),
    UserModel.aggregate([
      { $match: { role: "COMPANY" } },
      {
        $group: {
          _id: { $ifNull: ["$companyStatus", "UNKNOWN"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const companyByStatus: Record<string, number> = {};
  for (const row of companyByStatusAgg) companyByStatus[row._id] = row.count;

  // 2) REQUESTS COUNTS (trong khoảng thời gian)
  const [totalRequestsInRange, requestsByStatusAgg] = await Promise.all([
    RescueRequestModel.countDocuments(requestDateFilter),
    RescueRequestModel.aggregate([
      { $match: requestDateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const requestsByStatus: Record<string, number> = {};
  for (const row of requestsByStatusAgg) requestsByStatus[row._id] = row.count;

  const pending = requestsByStatus["PENDING"] || 0;
  const assigned = requestsByStatus["ASSIGNED"] || 0;
  const inProgress = requestsByStatus["IN_PROGRESS"] || 0;
  const completed = requestsByStatus["COMPLETED"] || 0;
  const cancelled = requestsByStatus["CANCELLED"] || 0;

  // 3) RESPONSE RATE (định nghĩa thực tế theo code hiện tại)
  // PENDING = công ty chưa phản hồi (chưa set ETA)
  const respondedCount = totalRequestsInRange - pending;
  const responseRate =
    totalRequestsInRange > 0 ? respondedCount / totalRequestsInRange : 0;

  // 4) COMPLETION/CANCEL RATE
  const completionRate =
    totalRequestsInRange > 0 ? completed / totalRequestsInRange : 0;
  const cancelRate =
    totalRequestsInRange > 0 ? cancelled / totalRequestsInRange : 0;

  // 5) ETA (trung bình etaMinutes trong range)
  const avgEtaAgg = await RescueRequestModel.aggregate([
    { $match: { ...requestDateFilter, etaMinutes: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgEta: { $avg: "$etaMinutes" }, count: { $sum: 1 } } },
  ]);
  const avgEtaMinutes = avgEtaAgg[0]?.avgEta ?? null;
  const etaCount = avgEtaAgg[0]?.count ?? 0;

  // 6) SATISFACTION (rating)
  const ratingAgg = await RescueRequestModel.aggregate([
    { $match: { ...requestDateFilter, customerRating: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$customerRating" },
        ratedCount: { $sum: 1 },
      },
    },
  ]);
  const avgRating = ratingAgg[0]?.avgRating ?? null;
  const ratedCount = ratingAgg[0]?.ratedCount ?? 0;

  const ratingDistributionAgg = await RescueRequestModel.aggregate([
    { $match: { ...requestDateFilter, customerRating: { $exists: true, $ne: null } } },
    { $group: { _id: "$customerRating", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const ratingDistribution: Record<string, number> = {};
  for (const row of ratingDistributionAgg) ratingDistribution[String(row._id)] = row.count;

  // 7) TOP CATEGORIES (theo số request)
  const topCategoriesAgg = await RescueRequestModel.aggregate([
    { $match: requestDateFilter },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "servicecategories", // collection name thường là plural hóa của model ServiceCategory
        localField: "_id",
        foreignField: "_id",
        as: "cat",
      },
    },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        categoryName: "$cat.name",
        count: 1,
      },
    },
  ]);

  // 8) TOP COMPANIES (theo số request được gán)
  const topCompaniesAgg = await RescueRequestModel.aggregate([
    { $match: requestDateFilter },
    {
      $group: {
        _id: "$assignedCompanyId",
        totalAssigned: { $sum: 1 },
        responded: {
          $sum: { $cond: [{ $ne: ["$status", "PENDING"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
        },
        avgRating: { $avg: "$customerRating" },
      },
    },
    { $sort: { totalAssigned: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        companyId: "$_id",
        companyName: "$company.companyName",
        email: "$company.email",
        totalAssigned: 1,
        responded: 1,
        completed: 1,
        cancelled: 1,
        avgRating: 1,
      },
    },
  ]);

  // 9) TREND: requests per day
  const requestsPerDayAgg = await RescueRequestModel.aggregate([
    { $match: requestDateFilter },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.json({
    range: {
      from: from.toISOString(),
      to: to.toISOString(),
      toExclusive: toExclusive.toISOString(),
    },
    users: {
      total: totalUsers,
      customers: totalCustomers,
      admins: totalAdmins,
      companies: {
        total: totalCompanies,
        byStatus: companyByStatus, // PENDING/ACTIVE/REJECTED/UNKNOWN
      },
    },
    requests: {
      totalInRange: totalRequestsInRange,
      byStatus: requestsByStatus,
      respondedCount,
      responseRate, // 0..1
      completionRate, // 0..1
      cancelRate, // 0..1
      eta: {
        avgEtaMinutes,
        count: etaCount,
      },
      satisfaction: {
        ratedCount,
        avgRating,
        ratingDistribution, // { "1": x, "2": y, ... }
      },
      topCategories: topCategoriesAgg,
      topCompanies: topCompaniesAgg,
      requestsPerDay: requestsPerDayAgg.map((x) => ({ date: x._id, count: x.count })),
    },
  });
}
