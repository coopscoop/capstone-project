-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email CHARACTER VARYING(255) UNIQUE NOT NULL,
    password CHARACTER VARYING(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    display_name CHARACTER VARYING(100),
    bio TEXT,
    time_created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for faster queries by creation time
CREATE INDEX IF NOT EXISTS idx_users_time_created ON users(time_created DESC);