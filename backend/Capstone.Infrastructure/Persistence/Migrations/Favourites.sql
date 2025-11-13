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

-- Index for faster queries by user (get all favourites for a user)
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);