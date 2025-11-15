import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  firstname: string;
  lastname: string;
  email: string;
  password?: string; // Optional for OAuth users
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    emailVerified: {
      type: Date,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reload
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
