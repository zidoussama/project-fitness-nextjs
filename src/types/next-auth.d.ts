import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    firstname: string;
    lastname: string;
  }
}
