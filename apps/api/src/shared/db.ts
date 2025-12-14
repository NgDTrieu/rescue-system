import mongoose from "mongoose";

export async function connectDB(uri?: string) {
  const mongoUri = uri ?? process.env.MONGO_URI; // đọc tại thời điểm gọi

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment");
  }

  await mongoose.connect(mongoUri);
  console.log("[api] MongoDB connected");
}
