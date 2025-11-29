-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    number_of_likes INTEGER DEFAULT 0,
    code CHARACTER VARYING(500) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Lots of indexes for faster queries as this is the primary table the user will interact with
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created DESC);
CREATE INDEX IF NOT EXISTS idx_posts_last_edited ON posts(last_edited DESC);
CREATE INDEX IF NOT EXISTS idx_posts_number_of_likes ON posts(number_of_likes DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_visible ON posts(is_visible);