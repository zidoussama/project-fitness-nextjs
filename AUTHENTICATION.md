# NextAuth v5 Implementation Documentation

## Overview
This implementation provides secure authentication using NextAuth v5 with two authentication methods:
1. **Google OAuth** - Third-party authentication via Google
2. **Credentials** - Traditional email/password authentication with user registration

## Architecture

### Database Layer
The implementation uses a dual MongoDB connection approach:
- **Mongoose**: For custom User model operations (credentials auth)
- **Native MongoDB Client**: For NextAuth adapter operations (sessions, accounts, etc.)

Both connections are cached globally to prevent connection pooling issues in serverless environments.

### User Schema
```typescript
{
  firstname: string (required)
  lastname: string (required)
  email: string (required, unique, lowercase, trimmed)
  password: string (optional, excluded from queries by default)
  emailVerified: Date (optional)
  image: string (optional)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## Security Considerations

### Implemented Security Measures

1. **Password Security**
   - Passwords are hashed using bcryptjs with 10 salt rounds
   - Passwords are excluded from query results by default (`select: false`)
   - Must explicitly request password field with `.select("+password")`

2. **Input Validation**
   - Email and password required for all credential operations
   - First name and last name required for sign up
   - Duplicate email check before user creation
   - Error messages don't reveal whether email exists (generic "Invalid credentials")

3. **Session Management**
   - JWT-based sessions (no database session storage)
   - Session data includes only necessary user information
   - Token includes user ID, firstname, and lastname

4. **Database Security**
   - Connection URI stored in environment variables
   - Connection pooling with caching to prevent exhaustion
   - Mongoose bufferCommands disabled for immediate connection errors

5. **OAuth Security**
   - Google OAuth credentials stored in environment variables
   - Profile data properly mapped to user fields
   - Email verification status preserved from OAuth provider

### Security Best Practices Applied

- ✅ No sensitive data in client-side code
- ✅ Environment variables for all secrets
- ✅ Password hashing before storage
- ✅ Password field excluded from default queries
- ✅ Proper error handling without information leakage
- ✅ HTTPS required (via NextAuth configuration)
- ✅ CSRF protection (built into NextAuth)
- ✅ Type safety with TypeScript

### Potential Security Enhancements

While not implemented in this minimal version, consider adding:

1. **Rate Limiting**
   - Implement login attempt rate limiting
   - Use packages like `express-rate-limit` or custom Redis-based solution

2. **Password Requirements**
   - Enforce minimum password length (8+ characters)
   - Require password complexity (uppercase, lowercase, numbers, symbols)
   - Check against common password lists

3. **Email Verification**
   - Send verification email after signup
   - Require email verification before allowing login
   - Add email verification flow

4. **Two-Factor Authentication (2FA)**
   - TOTP-based 2FA
   - SMS-based verification
   - Backup codes

5. **Account Security**
   - Password reset flow
   - Account lockout after multiple failed attempts
   - Session invalidation on password change
   - Activity logging

6. **Data Protection**
   - PII encryption at rest
   - Audit logs for sensitive operations
   - GDPR compliance features (data export, deletion)

## Dependencies

### Production Dependencies
- `next-auth@5.0.0-beta.30` - Authentication framework
- `@auth/mongodb-adapter@3.11.1` - MongoDB adapter for NextAuth
- `bcryptjs@3.0.3` - Password hashing
- `mongoose@8.19.4` - MongoDB ODM (no known vulnerabilities)
- `mongodb@6.21.0` - MongoDB native driver

### Development Dependencies
- `@types/bcryptjs@2.4.6` - TypeScript types for bcryptjs

### Vulnerability Status
All dependencies have been checked against the GitHub Advisory Database and are free of known security vulnerabilities.

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fitness-app

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Your app URL
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Generating NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Usage Examples

### Server-Side Authentication Check
```typescript
import { auth } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  return <div>Welcome {session.user.firstname}!</div>;
}
```

### Sign In (Client Action)
```typescript
import { signIn } from "@/lib/auth";

// Google OAuth
await signIn("google", { redirectTo: "/" });

// Credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  isSignUp: "false",
  redirectTo: "/",
});
```

### Sign Up (Client Action)
```typescript
import { signIn } from "@/lib/auth";

await signIn("credentials", {
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  password: "securepassword123",
  isSignUp: "true",
  redirectTo: "/",
});
```

### Sign Out
```typescript
import { signOut } from "@/lib/auth";

await signOut({ redirectTo: "/auth/signin" });
```

## API Routes

NextAuth automatically creates the following API routes:

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Sign in with provider
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - Get available providers
- `GET /api/auth/callback/:provider` - OAuth callback

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API route handler
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx              # Sign in page
│   │   └── signup/
│   │       └── page.tsx              # Sign up page
│   └── home/
│       └── page.tsx                  # Example protected page
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── db.ts                         # MongoDB connections
│   └── models/
│       └── User.ts                   # User model
├── types/
│   └── next-auth.d.ts                # NextAuth type extensions
└── middleware.ts                     # Auth middleware

.env.example                          # Environment variables template
```

## Testing Setup

To test the authentication system:

1. Set up MongoDB (local or Atlas)
2. Copy `.env.example` to `.env.local`
3. Fill in environment variables
4. Set up Google OAuth credentials at https://console.cloud.google.com
5. Run `npm run dev`
6. Visit http://localhost:3000/auth/signin

## Troubleshooting

### Common Issues

1. **"MONGODB_URI is not defined"**
   - Ensure `.env.local` exists with MONGODB_URI

2. **"Error: No response from server"**
   - Check MongoDB is running and accessible
   - Verify MONGODB_URI connection string

3. **"Invalid credentials" on sign in**
   - Verify email/password are correct
   - Check user exists in database
   - Ensure password was hashed during signup

4. **Google OAuth not working**
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Check authorized redirect URIs in Google Console
   - Ensure NEXTAUTH_URL matches your application URL

## Production Deployment

Before deploying to production:

1. ✅ Set all environment variables in production environment
2. ✅ Use strong NEXTAUTH_SECRET (32+ random bytes)
3. ✅ Configure proper NEXTAUTH_URL (with HTTPS)
4. ✅ Set up MongoDB with authentication enabled
5. ✅ Use connection pooling limits appropriate for your tier
6. ⚠️ Consider implementing rate limiting
7. ⚠️ Add email verification flow
8. ⚠️ Implement password reset functionality
9. ⚠️ Add logging and monitoring
10. ⚠️ Set up error tracking (e.g., Sentry)

## License & Compliance

Ensure compliance with:
- GDPR (if serving EU users)
- CCPA (if serving California users)
- OAuth provider terms of service
- Data protection regulations in your jurisdiction
