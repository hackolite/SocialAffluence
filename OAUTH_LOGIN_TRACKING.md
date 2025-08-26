# OAuth Login Tracking

This document describes the OAuth login tracking functionality implemented in SocialAffluence.

## Overview

The application now tracks Google OAuth login events in a dedicated database table for audit and debugging purposes. This functionality is implemented in addition to the existing session management and does not interfere with the authentication flow.

## Features

- **Login Event Tracking**: Records each Google OAuth login with user details, timestamp, and IP address
- **Database Storage**: Uses PostgreSQL table `logins` to store login events
- **Debug Logging**: Structured logging for troubleshooting authentication issues
- **Non-blocking**: Login tracking failures do not prevent successful authentication

## Database Schema

### Logins Table

```sql
CREATE TABLE logins (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR NOT NULL,
    name VARCHAR,
    email VARCHAR,
    login_time TIMESTAMP DEFAULT NOW() NOT NULL,
    ip VARCHAR
);
```

**Indexes:**
- `idx_logins_google_id` - For user lookup queries
- `idx_logins_login_time` - For chronological queries  
- `idx_logins_email` - For email-based lookups

## Implementation Details

### Files Modified

1. **`shared/schema.ts`** - Added `logins` table schema and types
2. **`server/db.ts`** - New utility module with `saveLoginEvent` function
3. **`server/routes.ts`** - Modified Google OAuth callback to track login events
4. **`migrations/001_add_logins_table.sql`** - Database migration script

### Function: `saveLoginEvent`

Located in `server/db.ts`, this function saves login events to the database.

**Parameters:**
```typescript
{
  googleId: string;    // Google user ID
  name?: string;       // User's full name
  email?: string;      // User's email address
  ip?: string;         // User's IP address
}
```

**Features:**
- Structured debug logging
- Error handling that doesn't break authentication flow
- Console logging for immediate debugging
- Timestamp automatically added

### OAuth Callback Enhancement

The Google OAuth callback (`/auth/google/callback`) now:

1. Extracts user IP address from request headers
2. Calls `saveLoginEvent` with user information
3. Logs the event with structured debugging
4. Continues normal authentication flow even if tracking fails

## Usage Examples

### Querying Login Events

```sql
-- Get all logins for a specific user
SELECT * FROM logins 
WHERE google_id = 'user_google_id' 
ORDER BY login_time DESC;

-- Get recent logins (last 24 hours)
SELECT google_id, name, email, login_time, ip 
FROM logins 
WHERE login_time >= NOW() - INTERVAL '24 hours'
ORDER BY login_time DESC;

-- Count logins by user
SELECT google_id, name, COUNT(*) as login_count
FROM logins 
GROUP BY google_id, name
ORDER BY login_count DESC;
```

### Debug Logging

Set environment variables to enable debug logging:

```bash
DEBUG=true
LOG_LEVEL=DEBUG
DEBUG_COMPONENTS=Routes,LoginTracker
```

## Security Considerations

- **IP Address Logging**: User IP addresses are logged for security analysis
- **No Sensitive Data**: Passwords and access tokens are not stored
- **Audit Trail**: Provides complete login history for security investigations

## Future Enhancements

- Add login failure tracking
- Implement login analytics dashboard
- Add geolocation data for IP addresses
- Email notifications for suspicious login patterns