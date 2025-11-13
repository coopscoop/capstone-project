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

-- Index for faster queries by tag name (get all posts with a specific tag)
CREATE INDEX IF NOT EXISTS idx_tags_tag_name ON tags(tag_name);