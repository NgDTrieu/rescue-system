import { Request, Response } from "express";
import mongoose from "mongoose";
import { RescueRequestModel } from "../requests/request.model";
import { UserModel } from "../users/user.model";
import { ChatMessageModel } from "./chatMessage.model";

function getAuth(req: Request) {
  const u = (req as any).user as { sub: string; role: string };
  return { userId: u?.sub, role: u?.role };
}

async function requireRoomAccess(requestId: string, userId: string, role: string) {
  if (!mongoose.isValidObjectId(requestId)) {
    return { ok: false as const, status: 400, message: "Invalid request id" };
  }

  const reqDoc: any = await RescueRequestModel.findById(requestId)
    .populate("customerId", "name email role")
    .populate("assignedCompanyId", "companyName name email role")
    .lean();

  if (!reqDoc) return { ok: false as const, status: 404, message: "Request not found" };

  // so sánh id khi populate
  const customerId = String(reqDoc.customerId?._id || reqDoc.customerId);
  const companyId = String(reqDoc.assignedCompanyId?._id || reqDoc.assignedCompanyId);

  const uid = String(userId);
  const isCustomer = role === "CUSTOMER" && customerId === uid;
  const isCompany = role === "COMPANY" && companyId === uid;

  if (!isCustomer && !isCompany) {
    return { ok: false as const, status: 403, message: "Forbidden" };
  }

  // ✅ Chưa mở chat khi PENDING
  if (reqDoc.status === "PENDING") {
    return {
      ok: false as const,
      status: 400,
      message: "Chat is not available until company responds (ASSIGNED).",
    };
  }

  // build peer meta để frontend hiển thị "đang chat với ai"
  const peer =
    role === "CUSTOMER"
      ? reqDoc.assignedCompanyId
        ? {
            id: String(reqDoc.assignedCompanyId._id),
            name: reqDoc.assignedCompanyId.companyName || reqDoc.assignedCompanyId.name,
            email: reqDoc.assignedCompanyId.email,
            role: "COMPANY",
          }
        : null
      : reqDoc.customerId
      ? {
          id: String(reqDoc.customerId._id),
          name: reqDoc.customerId.name,
          email: reqDoc.customerId.email,
          role: "CUSTOMER",
        }
      : null;

  // title/subtitle gợi ý dùng cho header
  const title =
    role === "CUSTOMER"
      ? peer?.name || "Công ty cứu hộ"
      : peer?.name || "Khách hàng";

  const subtitle =
    role === "COMPANY"
      ? (reqDoc.addressText ? `Địa chỉ: ${reqDoc.addressText}` : "")
      : (reqDoc.issueType ? `Sự cố: ${reqDoc.issueType}` : "");

  return {
    ok: true as const,
    reqDoc,
    isCustomer,
    isCompany,
    roomMeta: {
      requestId: String(reqDoc._id),
      status: reqDoc.status,
      issueType: reqDoc.issueType || "",
      addressText: reqDoc.addressText || "",
      peer,
      title,
      subtitle,
    },
  };
}


/**
 * GET /chat/rooms
 * List rooms = RescueRequests of current user (customer/company) + lastMessage
 */
export async function listChatRooms(req: Request, res: Response) {
  const { userId, role } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (role !== "CUSTOMER" && role !== "COMPANY") {
    return res.status(403).json({ message: "Only CUSTOMER/COMPANY can use chat" });
  }

  const filter =
    role === "CUSTOMER"
      ? { customerId: userId, status: { $ne: "PENDING" } }
      : { assignedCompanyId: userId, status: { $ne: "PENDING" } };


  // lấy các request làm “room”
  const rooms = await RescueRequestModel.find(filter)
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate("customerId", "name email")
    .populate("assignedCompanyId", "companyName name email")
    .lean();

  // lấy last message theo từng room (N+1 nhưng đơn giản và đủ dùng bài tập)
  const items = await Promise.all(
    rooms.map(async (r: any) => {
      const last = await ChatMessageModel.findOne({ requestId: r._id })
        .sort({ createdAt: -1 })
        .lean();

      const peer =
        role === "CUSTOMER"
          ? r.assignedCompanyId
            ? {
                id: r.assignedCompanyId._id,
                name: r.assignedCompanyId.companyName || r.assignedCompanyId.name,
                email: r.assignedCompanyId.email,
                role: "COMPANY",
              }
            : null
          : r.customerId
          ? {
              id: r.customerId._id,
              name: r.customerId.name,
              email: r.customerId.email,
              role: "CUSTOMER",
            }
          : null;

      return {
        requestId: String(r._id),
        status: r.status,
        issueType: r.issueType,
        addressText: r.addressText || "",
        updatedAt: r.updatedAt,
        peer,
        lastMessage: last
          ? { text: last.text, senderRole: last.senderRole, createdAt: last.createdAt }
          : null,
      };
    })
  );

  return res.json({ count: items.length, items });
}

/**
 * GET /chat/rooms/:requestId/messages?after=ISO&limit=50
 */
export async function listRoomMessages(req: Request, res: Response) {
  const { userId, role } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { requestId } = req.params;
  const access = await requireRoomAccess(requestId, userId, role);
  if (!access.ok) return res.status(access.status).json({ message: access.message });

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const after = (req.query.after as string) || "";

  const filter: any = { requestId };
  if (after) {
    const d = new Date(after);
    if (!isNaN(d.getTime())) filter.createdAt = { $gt: d };
  }

  // Nếu không có after: lấy last N message rồi đảo lại để hiển thị tăng dần
  let msgs: any[] = [];
  if (!after) {
    const latest = await ChatMessageModel.find({ requestId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    msgs = latest.reverse();
  } else {
    msgs = await ChatMessageModel.find(filter).sort({ createdAt: 1 }).limit(limit).lean();
  }

  return res.json({
    room: (access as any).roomMeta,     // ✅ thêm thông tin đối tác + title/subtitle
    requestId,
    count: msgs.length,
    items: msgs.map((m) => ({
      id: String(m._id),
      senderId: String(m.senderId),
      senderRole: m.senderRole,
      text: m.text,
      createdAt: m.createdAt,
    })),
    requestStatus: (access as any).reqDoc.status,
  });

}

/**
 * POST /chat/rooms/:requestId/messages
 * body: { text }
 */
export async function sendRoomMessage(req: Request, res: Response) {
  const { userId, role } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { requestId } = req.params;
  const access = await requireRoomAccess(requestId, userId, role);
  if (!access.ok) return res.status(access.status).json({ message: access.message });

  const reqDoc = (access as any).reqDoc;

  // khóa gửi khi kết thúc
  if (reqDoc.status === "COMPLETED" || reqDoc.status === "CANCELLED") {
    return res.status(400).json({ message: "Request ended. Chat is read-only." });
  }

  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ message: "text is required" });

  const senderRole = role === "CUSTOMER" ? "CUSTOMER" : "COMPANY";

  const msg = await ChatMessageModel.create({
    requestId,
    senderId: userId,
    senderRole,
    text,
  });

  return res.status(201).json({
    id: String(msg._id),
    requestId,
    senderId: String(msg.senderId),
    senderRole: msg.senderRole,
    text: msg.text,
    createdAt: msg.createdAt,
  });
}
