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

  categoryId: Types.ObjectId;
  quotedBasePrice: number; // giá cơ bản chốt tại thời điểm đặt

  etaMinutes?: number;

  customerRating?: number;
  customerReview?: string;
  customerConfirmedAt?: Date;
  completedAt?: Date;

  cancelReason?: string;
  cancelledAt?: Date;
  cancelledBy?: "CUSTOMER" | "COMPANY" | "ADMIN";



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
    categoryId: { type: Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
    quotedBasePrice: { type: Number, required: true, min: 0 },
    assignedCompanyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    etaMinutes: { type: Number, min: 0 },

    completedAt: { type: Date },
    customerConfirmedAt: { type: Date },

    customerRating: { type: Number, min: 1, max: 5 },
    customerReview: { type: String, trim: true },

    cancelReason: { type: String, trim: true },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ["CUSTOMER", "COMPANY", "ADMIN"] },


  },
  { timestamps: true }
);

// để sau này query "gần nhất"
RescueRequestSchema.index({ location: "2dsphere" });

// để query nhanh theo customer/status
RescueRequestSchema.index({ customerId: 1, status: 1, createdAt: -1 });

export const RescueRequestModel = model<IRescueRequest>("RescueRequest", RescueRequestSchema);
