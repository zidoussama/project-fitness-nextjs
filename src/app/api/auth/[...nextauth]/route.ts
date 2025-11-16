import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

// ✅ PROPER TYPE DEFINITIONS
interface CustomUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  image?: string | null;
}

interface CustomToken extends JWT {
  id?: string;
  firstName?: string;
  lastName?: string;
}

// ✅ TYPE-SAFE AUTH CONFIG
export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userDoc = await User.findOne({ 
          email: credentials.email 
        }).select("+password");

        if (!userDoc || !userDoc.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password, 
          userDoc.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: userDoc._id.toString(),
          email: userDoc.email,
          name: `${userDoc.firstName} ${userDoc.lastName}`,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          image: userDoc.image,
        } as CustomUser;
      },
    }),
  ],

  callbacks: {
    // ✅ TYPE-SAFE signIn
    async signIn({ user, account }: { 
      user: CustomUser; 
      account: any 
    }) {
      await dbConnect();

      if (account?.provider !== "credentials") {
        // OAuth flow
        const existingUser = await User.findOne({ email: user.email });
        const nameParts = (user.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

        if (existingUser) {
          if (user.image && existingUser.image !== user.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }
          return true;
        }

        await User.create({
          email: user.email,
          firstName,
          lastName,
          image: user.image || null,
          provider: account.provider,
        });
        return true;
      }

      return true;
    },

    // ✅ TYPE-SAFE jwt
    async jwt({ token, user }: { 
      token: CustomToken; 
      user?: CustomUser 
    }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },

    // ✅ TYPE-SAFE session
    async session({ session, token }: { 
      session: any; 
      token: CustomToken 
    }) {
      if (token) {
        session.user.id = token.id!;
        session.user.firstName = token.firstName!;
        session.user.lastName = token.lastName!;
        session.user.image = token.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ PROPER EXPORT
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };