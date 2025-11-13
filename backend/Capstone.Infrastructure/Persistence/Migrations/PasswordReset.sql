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

-- Index for faster reset code lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset(reset_code);