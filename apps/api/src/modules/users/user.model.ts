import { Schema, model, Document } from "mongoose";

export type UserRole = "CUSTOMER" | "COMPANY" | "ADMIN";
export type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;

  name: string;          // CUSTOMER/ADMIN name
  phone?: string;        // optional

  // COMPANY fields
  companyName?: string;
  companyStatus?: CompanyStatus;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["CUSTOMER", "COMPANY", "ADMIN"] },

    name: { type: String, required: true, trim: true },
    phone: { type: String },

    companyName: { type: String },
    companyStatus: { type: String, enum: ["PENDING", "ACTIVE", "REJECTED"], default: undefined },
  },
  { timestamps: true }
);


export const UserModel = model<IUser>("User", UserSchema);
