ALTER TABLE email_verification_tokens
    ADD COLUMN IF NOT EXISTS attempts SMALLINT NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS uq_email_tokens_hash;