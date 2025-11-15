import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { dbConnectMongo, dbConnectMongoose } from "@/lib/db";
import { User } from "@/lib/models/User";

export const authConfig: NextAuthConfig = {
  adapter: MongoDBAdapter(dbConnectMongo()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          firstname: profile.given_name || "",
          lastname: profile.family_name || "",
          email: profile.email,
          emailVerified: profile.email_verified ? new Date() : null,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firstname: { label: "First Name", type: "text" },
        lastname: { label: "Last Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnectMongoose();

        const isSignUp = credentials.isSignUp === "true";

        if (isSignUp) {
          // Sign up flow
          if (!credentials.firstname || !credentials.lastname) {
            throw new Error("First name and last name are required for sign up");
          }

          // Check if user already exists
          const existingUser = await User.findOne({
            email: credentials.email,
          });

          if (existingUser) {
            throw new Error("User with this email already exists");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(credentials.password as string, 10);

          // Create new user
          const newUser = await User.create({
            firstname: credentials.firstname,
            lastname: credentials.lastname,
            email: credentials.email,
            password: hashedPassword,
          });

          return {
            id: newUser._id.toString(),
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            emailVerified: newUser.emailVerified,
            image: newUser.image,
          };
        } else {
          // Sign in flow
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
          };
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.firstname = token.firstname as string;
        session.user.lastname = token.lastname as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
      }
      if (account?.provider === "google" && user) {
        // For Google OAuth, ensure we have firstname and lastname
        token.firstname = user.firstname || "";
        token.lastname = user.lastname || "";
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
