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
-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_time_created ON users(time_created DESC);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    number_of_likes INTEGER DEFAULT 0,
    code CHARACTER VARYING(500) NOT NULL,
    created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created DESC);
CREATE INDEX IF NOT EXISTS idx_posts_last_edited ON posts(last_edited DESC);
CREATE INDEX IF NOT EXISTS idx_posts_number_of_likes ON posts(number_of_likes DESC);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    post_id INTEGER NOT NULL,
    tag_name CHARACTER VARYING(50) NOT NULL,
    PRIMARY KEY (post_id, tag_name),
    CONSTRAINT fk_tags_post
        FOREIGN KEY (post_id)
        REFERENCES posts(post_id)
        ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_tag_name ON tags(tag_name);

-- Favourites table
CREATE TABLE IF NOT EXISTS favourites (
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_favourites_post
        FOREIGN KEY (post_id)
        REFERENCES posts(post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_favourites_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);

-- PasswordReset table
CREATE TABLE IF NOT EXISTS password_reset (
    user_id INTEGER PRIMARY KEY,
    reset_code CHARACTER VARYING(255) NOT NULL,
    time_created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset(reset_code);

-- RefreshToken table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token CHARACTER VARYING(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITHOUT TIME ZONE,
    replaced_by_token CHARACTER VARYING(500),
    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);