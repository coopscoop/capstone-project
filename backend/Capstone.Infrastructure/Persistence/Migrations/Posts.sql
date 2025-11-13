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

-- Lots of indexes for faster queries as this is the primary table the user will interact with
-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Index for faster queries by creation time
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created DESC);

-- Index for faster queries by last edited time
CREATE INDEX IF NOT EXISTS idx_posts_last_edited ON posts(last_edited DESC);

-- Index for faster queries by likes (for trending/popular posts)
CREATE INDEX IF NOT EXISTS idx_posts_number_of_likes ON posts(number_of_likes DESC);