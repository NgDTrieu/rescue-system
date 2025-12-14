import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { connectDB } from "../shared/db";
import { UserModel } from "../modules/users/user.model";
import { hashPassword } from "../shared/password";

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Check apps/api/.env");
  }
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@rescue.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existed = await UserModel.findOne({ email });
  if (existed) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  await UserModel.create({
    email,
    passwordHash,
    role: "ADMIN",
    name: "System Admin",
  });

  console.log("Seeded admin:", email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
