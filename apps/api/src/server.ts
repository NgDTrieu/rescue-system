import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './shared/db';
import authRoutes from "./modules/auth/auth.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger";
import adminRoutes from "./modules/admin/admin.routes";
import companyRoutes from "./modules/company/company.routes";
import requestRoutes from "./modules/requests/request.routes";


const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use("/auth", authRoutes);
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/admin", adminRoutes);
app.use("/company", companyRoutes);
app.use("/requests", requestRoutes);
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// TODO: mount routers here: /auth, /requests, /services, /messages, /feedbacks, /admin

const port = Number(process.env.PORT || 4000);
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || true }
});

io.on('connection', (socket) => {
  socket.on('join', (roomId: string) => socket.join(roomId));
  socket.on('message', (payload: { roomId: string; text: string }) => {
    io.to(payload.roomId).emit('message', payload);
  });
});

(async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/rescue_system');
  httpServer.listen(port, () => {
    console.log(`[api] listening on :${port}`);
  });
})();
