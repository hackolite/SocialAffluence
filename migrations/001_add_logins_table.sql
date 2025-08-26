-- Migration: Add logins table for OAuth login tracking
-- Created: $(date)
-- Description: Creates a table to track Google OAuth login events for audit and debugging purposes

CREATE TABLE IF NOT EXISTS logins (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR NOT NULL,
    name VARCHAR,
    email VARCHAR,
    login_time TIMESTAMP DEFAULT NOW() NOT NULL,
    ip VARCHAR
);

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_logins_google_id ON logins(google_id);

-- Create index on login_time for chronological queries
CREATE INDEX IF NOT EXISTS idx_logins_login_time ON logins(login_time);

-- Create index on email for user lookup queries
CREATE INDEX IF NOT EXISTS idx_logins_email ON logins(email);