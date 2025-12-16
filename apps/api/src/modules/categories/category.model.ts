import { Schema, model, Document } from "mongoose";

export interface IServiceCategory extends Document {
  key: string;            // định danh ngắn, ví dụ: FUEL, TIRE...
  name: string;           // tên hiển thị
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    key: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceCategorySchema.index({ key: 1 }, { unique: true });

export const ServiceCategoryModel = model<IServiceCategory>(
  "ServiceCategory",
  ServiceCategorySchema
);
