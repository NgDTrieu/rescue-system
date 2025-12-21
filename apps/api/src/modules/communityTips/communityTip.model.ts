import { Schema, model, Document } from "mongoose";

export interface ICommunityTip extends Document {
  title: string;      // vấn đề
  solution: string;   // cách giải quyết
  createdBy: any;     // user _id
  createdAt: Date;
  updatedAt: Date;
}

const CommunityTipSchema = new Schema<ICommunityTip>(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    solution: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

CommunityTipSchema.index({ createdAt: -1 });
CommunityTipSchema.index({ title: "text", solution: "text" });

export const CommunityTipModel = model<ICommunityTip>("CommunityTip", CommunityTipSchema);
