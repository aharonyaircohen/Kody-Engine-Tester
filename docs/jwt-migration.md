# JWT Migration Guide: HS256 to RS256

This guide covers the migration from JWT v1 (HS256) to JWT v2 (RS256) authentication.

## Overview

The authentication system has been upgraded to use RS256 (RSA Signature with SHA-256) instead of HS256 (HMAC with SHA-256). RS256 uses asymmetric key pairs (RSA) instead of a shared secret, providing better security and enabling features like key rotation without service downtime.

## Key Differences

| Aspect | HS256 (v1) | RS256 (v2) |
|--------|------------|------------|
| Key Type | Symmetric (shared secret) | Asymmetric (RSA key pair) |
| Private Key | Shared secret stored in env | RSA private key (PEM format) |
| Public Key | Derived from secret | RSA public key (PEM format) |
| Token Format | `header.body.signature` | Same format, different algorithm |
| Algorithm | HMAC-SHA256 | RSA-PKCS1-v1_5 with SHA-256 |

## Migration Modes

The system supports three authentication modes via `AUTH_MODE` environment variable:

- **`legacy`** (default): Use only HS256 (v1) tokens - existing behavior
- **`v2`**: Use only RS256 (v2) tokens - new behavior only
- **`dual`**: Support both HS256 and RS256 tokens during migration

## Step-by-Step Migration

### Step 1: Generate RSA Key Pair

Generate a 2048-bit RSA key pair for RS256 signing:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to base64 for environment variables
export JWT_V2_PRIVATE_KEY=$(cat private.pem | base64 | tr -d '\n')
export JWT_V2_PUBLIC_KEY=$(cat public.pem | base64 | tr -d '\n')
```

### Step 2: Configure Environment Variables

Add the following environment variables:

```bash
# New RS256 keys (required for v2 mode)
JWT_V2_PRIVATE_KEY=<base64-encoded-private-key>
JWT_V2_PUBLIC_KEY=<base64-encoded-public-key>

# Authentication mode
AUTH_MODE=dual  # Start with dual mode for gradual migration
```

### Step 3: Enable Dual Mode

Set `AUTH_MODE=dual` to enable both HS256 and RS256 token verification:

```bash
AUTH_MODE=dual
```

In dual mode:
- New tokens are signed with RS256 (v2)
- Existing HS256 (v1) tokens continue to work
- The system automatically detects token type and verifies accordingly

### Step 4: Monitor and Verify

Monitor authentication logs to ensure:
- Both v1 and v2 tokens are being verified successfully
- No authentication errors are occurring
- Token verification latency is acceptable

### Step 5: Switch to v2-Only Mode

After the migration period (recommended: 30 days), switch to v2-only mode:

```bash
AUTH_MODE=v2
```

This will:
- Reject all HS256 (v1) tokens
- Only accept RS256 (v2) tokens
- Provide improved security via asymmetric cryptography

## Rollback Procedure

If you need to roll back to the legacy authentication system:

### Option 1: Quick Rollback (Immediate)

```bash
AUTH_MODE=legacy
```

This immediately:
- Disables RS256 (v2) token verification
- Reverts to HS256 (v1) only
- All existing v1 tokens continue to work

### Option 2: Disable v2 Tokens Only

If you want to issue v1 tokens but still accept v2 tokens:

```bash
AUTH_MODE=legacy
```

Note: In `legacy` mode, only v1 tokens are issued, but v2 tokens may still be verified if they were issued before the switch.

### Option 3: Disable v2 Without Clearing Keys

```bash
AUTH_MODE=legacy
# Keep JWT_V2_PRIVATE_KEY and JWT_V2_PUBLIC_KEY set for future use
```

This preserves your v2 keys for when you're ready to migrate again.

## Token Format

### HS256 (v1) Token Structure
```
base64url(header).base64url(body).base64url(signature)
```

Example header: `{"alg":"HS256","typ":"JWT"}`

### RS256 (v2) Token Structure
```
base64url(header).base64url(body).base64url(signature)
```

Example header: `{"alg":"RS256","typ":"JWT"}`

The JWT library automatically detects the algorithm from the token header.

## Impact on API Routes

### Routes Using `withAuth` HOC

The `withAuth` higher-order function automatically handles both token types in dual mode:

```typescript
import { withAuth } from '@/auth/withAuth'

// Works with both HS256 and RS256 tokens in dual mode
export const GET = withAuth(async (req, { user }) => {
  return Response.json({ user })
}, { roles: ['admin'] })
```

### Routes Using `verifyToken` Directly

Use the `verifyToken` function which automatically selects the correct verifier:

```typescript
import { verifyToken } from '@/auth/_auth'

const token = extractBearerToken(authHeader)
const payload = await verifyToken(token)
```

### Routes Using `dualVerify`

For explicit control over token version detection:

```typescript
import { dualVerify } from '@/auth/_auth'

const { payload, version } = await dualVerify(token)
console.log(`Token verified using ${version}`) // 'v1' or 'v2'
```

## RBAC Middleware

The RBAC middleware supports both legacy and new role types:

```typescript
import { createRbacMiddleware } from '@/middleware/rbac'

const rbac = createRbacMiddleware({ roles: ['admin', 'editor'] })
const error = await rbac(context, nextHandler)
```

### Legacy Role Mapping

During migration, legacy roles are automatically mapped:

| Legacy Role | New RbacRole | Notes |
|------------|--------------|-------|
| admin | admin | Direct mapping |
| user | viewer | 'user' maps to 'viewer' |
| guest | (denied) | Not mapped - access denied |
| student | viewer | Students get viewer access |
| instructor | editor | Instructors get editor access |

## Security Considerations

### Private Key Protection

- Store `JWT_V2_PRIVATE_KEY` securely (secret management system, not in git)
- The private key should never be committed to version control
- Consider using a secrets manager like Vault, AWS Secrets Manager, or similar

### Key Rotation

With RS256, key rotation is simpler:
1. Generate a new key pair
2. Deploy new public key
3. Continue using old private key for a grace period
4. Switch to new private key
5. Old tokens signed with old key can still be verified if needed

### Algorithm Security

RS256 is considered more secure than HS256 for several reasons:
- The private key never needs to be shared or transmitted
- Compromise of public key doesn't allow token forgery
-符合 industry standards and RFC 7518

## Troubleshooting

### "Token verification failed for both v1 and v2"

This error occurs in dual mode when:
1. Token is malformed
2. Token is expired
3. Token signature is invalid for both algorithms

Solution: Check token format and ensure it's a valid JWT.

### "Unsupported key usage for a RSA key"

This error indicates Web Crypto API issues:
- Ensure Node.js version is 18+ (required for RSASSA-PKCS1-v1_5)
- Verify key pair was generated correctly with proper key usages

### "Invalid token signature"

Check that:
1. Keys are correctly base64-encoded
2. Keys are in correct PEM format
3. Public key matches the private key used for signing
4. Token hasn't been tampered with

## References

- [RFC 7518 - JSON Web Algorithms](https://tools.ietf.org/html/rfc7518)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
