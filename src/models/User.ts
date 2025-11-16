// models/User.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "facebook"],
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password only if modified and not already hashed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);