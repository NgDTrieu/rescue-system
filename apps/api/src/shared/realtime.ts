import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "./jwt";

let io: Server | null = null;

export function initRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware: client gửi token khi connect
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));

      const payload = verifyAccessToken(token); // { sub, role, ... }
      (socket as any).user = payload;
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    const userRoom = `user:${user.sub}`;
    socket.join(userRoom);

    // có thể join theo role nếu muốn broadcast theo vai trò
    socket.join(`role:${user.role}`);

    console.log("[socket] connected", user.sub, user.role);

    socket.on("disconnect", () => {
      console.log("[socket] disconnected", user.sub);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
