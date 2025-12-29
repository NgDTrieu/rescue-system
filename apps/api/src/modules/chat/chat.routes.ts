import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { listChatRooms, listRoomMessages, sendRoomMessage } from "./chat.controller";

const router = Router();

router.get("/rooms", authGuard, listChatRooms);
router.get("/rooms/:requestId/messages", authGuard, listRoomMessages);
router.post("/rooms/:requestId/messages", authGuard, sendRoomMessage);

export default router;
