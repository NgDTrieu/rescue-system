import { Schema, model, Document, Types } from "mongoose";

export type RequestStatus =
  | "PENDING"      // khách vừa tạo, chưa có công ty nhận
  | "ASSIGNED"     // đã gán/được công ty nhận
  | "IN_PROGRESS"  // đang xử lý
  | "COMPLETED"    // hoàn thành
  | "CANCELLED";   // khách hủy

export interface IRescueRequest extends Document {
  customerId: Types.ObjectId;

  // thông tin sự cố
  issueType: string;         // ví dụ: "Hết xăng", "Thủng lốp", "Hết điện", ...
  note?: string;

  // liên hệ
  contactName: string;
  contactPhone: string;

  // vị trí (GeoJSON Point)
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  addressText?: string;

  status: RequestStatus;

  // sau này dùng cho company
  assignedCompanyId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const RescueRequestSchema = new Schema<IRescueRequest>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    issueType: { type: String, required: true, trim: true },
    note: { type: String },

    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },

    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    addressText: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },

    assignedCompanyId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// để sau này query "gần nhất"
RescueRequestSchema.index({ location: "2dsphere" });

// để query nhanh theo customer/status
RescueRequestSchema.index({ customerId: 1, status: 1, createdAt: -1 });

export const RescueRequestModel = model<IRescueRequest>("RescueRequest", RescueRequestSchema);
