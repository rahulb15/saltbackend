import mongoose from "mongoose";
import { IUser } from "../interfaces/user/user.interface";
import { hashPassword } from "../utils/hash.password";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true, trim: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;

// Initialize super admin if it doesn't exist
async function initSuperAdmin() {
  try {
    const superAdmin = await User.findOne({ role: "superadmin" });
    if (!superAdmin) {
      const newSuperAdmin = new User({
        name: "Super Admin",
        email: "superadmin@yopmail.com",
        phone: "1234567890",
        password: await hashPassword("superadmin"),
        role: "superadmin",
      });
      await newSuperAdmin.save();
      console.log("Super admin user created successfully.");
    } else {
      console.log("Super admin user already exists.");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
}

initSuperAdmin();
