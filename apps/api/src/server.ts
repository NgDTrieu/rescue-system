import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";

import { connectDB } from "./shared/db";

import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import companyRoutes from "./modules/company/company.routes";
import requestRoutes from "./modules/requests/request.routes";
import categoryRoutes from "./modules/categories/category.routes";
import companiesRoutes from "./modules/companies/companies.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);

app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/admin", adminRoutes);
app.use("/company", companyRoutes);
app.use("/requests", requestRoutes);
app.use("/categories", categoryRoutes);
app.use("/companies", companiesRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

const port = Number(process.env.PORT || 4000);


(async () => {
  // IMPORTANT: fallback này chạy tốt trong Docker compose vì service tên là "mongo"
  const uri =
    process.env.MONGO_URI || "mongodb://mongo:27017/rescue_system";

  await connectDB(uri);

  app.listen(port, () => {
    console.log(`[api] listening on :${port}`);
  });
})();
