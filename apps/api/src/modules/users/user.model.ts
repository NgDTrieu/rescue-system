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


  companyLocation?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  companyServices?: Array<{
    categoryId: any;     // ObjectId
    basePrice: number;   // giá cơ bản
  }>;

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
  
    companyLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
    },

    companyServices: [
      {
        categoryId: { type: Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
        basePrice: { type: Number, required: true, min: 0 },
      },
    ],

  },
  { timestamps: true }
);

UserSchema.index({ companyLocation: "2dsphere" });

export const UserModel = model<IUser>("User", UserSchema);
