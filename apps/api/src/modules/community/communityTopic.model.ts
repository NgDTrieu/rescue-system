import { Schema, model, Document } from "mongoose";

export interface ICommunityTopic extends Document {
  title: string;
  content: string;        // mô tả sự cố/vấn đề
  tags: string[];         // ví dụ: ["FUEL", "TIRE", "HONDA", "RAIN"]
  createdBy: any;         // User _id
  isFeatured: boolean;    // admin có thể “ghim/nổi bật” sau
  viewsCount: number;
  advicesCount: number;   // số mẹo/giải pháp
  upvotesCount: number;   // (MVP để 0, sau thêm vote)
  createdAt: Date;
  updatedAt: Date;
}

const CommunityTopicSchema = new Schema<ICommunityTopic>(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    content: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    tags: [{ type: String, trim: true, uppercase: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0, min: 0 },
    advicesCount: { type: Number, default: 0, min: 0 },
    upvotesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Search nhanh
CommunityTopicSchema.index({ createdAt: -1 });
CommunityTopicSchema.index({ isFeatured: -1, upvotesCount: -1, advicesCount: -1, createdAt: -1 });
CommunityTopicSchema.index({ title: "text", content: "text" });

export const CommunityTopicModel = model<ICommunityTopic>(
  "CommunityTopic",
  CommunityTopicSchema
);
