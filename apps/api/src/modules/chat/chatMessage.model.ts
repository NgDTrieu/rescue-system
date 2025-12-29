import { Schema, model, Document, Types } from "mongoose";

export type SenderRole = "CUSTOMER" | "COMPANY";

export interface IChatMessage extends Document {
  requestId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: SenderRole;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "RescueRequest", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["CUSTOMER", "COMPANY"], required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// tối ưu query theo phòng chat
ChatMessageSchema.index({ requestId: 1, createdAt: 1 });

export const ChatMessageModel = model<IChatMessage>("ChatMessage", ChatMessageSchema);
