// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { firstName, lastName, email, password, confirmPassword } = await req.json();

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Let Mongoose pre("save") hook hash the password
    await User.create({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password, // plain text → will be hashed by schema
      provider: "credentials",
    });

    return NextResponse.json(
      { message: "Registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}