This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Setup

This project uses **NextAuth v5** for authentication with the following providers:

### Providers
1. **Google OAuth** - Sign in with Google account
2. **Credentials** - Email/password authentication with the following fields:
   - First Name
   - Last Name
   - Email
   - Password

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_URL` - Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Database Schema

The User model includes:
- `firstname` (String, required)
- `lastname` (String, required)
- `email` (String, required, unique)
- `password` (String, optional - for credentials auth)
- `emailVerified` (Date, optional)
- `image` (String, optional)
- Timestamps (createdAt, updatedAt)

### Usage

```typescript
import { auth, signIn, signOut } from "@/lib/auth";

// Get session in Server Component
const session = await auth();

// Sign in with Google
await signIn("google");

// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
});

// Sign up with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  firstname: "John",
  lastname: "Doe",
  isSignUp: "true",
});

// Sign out
await signOut();
```

# project-fitness-nextjs
