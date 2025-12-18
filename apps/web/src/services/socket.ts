import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

  socket = io(url, {
    transports: ["websocket"], // dev ổn định hơn
    auth: { token },
  });

  socket.on("connect", () => console.log("[socket] connected", socket?.id));
  socket.on("disconnect", () => console.log("[socket] disconnected"));

  // Company nhận request mới
  socket.on("request:new", (data) => {
    console.log("[socket] request:new", data);
    // TODO: update state / toast / refetch list
  });

  // Customer nhận ETA
  socket.on("request:eta", (data) => {
    console.log("[socket] request:eta", data);
  });

  // Customer nhận status update
  socket.on("request:status", (data) => {
    console.log("[socket] request:status", data);
  });

  // Company nhận customer confirm + rating
  socket.on("request:confirmed", (data) => {
    console.log("[socket] request:confirmed", data);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
