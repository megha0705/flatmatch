-- =============================================================================
-- V1__init_schema.sql
-- Initial database schema for Flatmate Finder
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    domain_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- 2. Profiles (1-to-1 with User, shares user_id as PK)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age SMALLINT NOT NULL,
    gender VARCHAR(32) NOT NULL,
    city VARCHAR(100) NOT NULL,
    occupation VARCHAR(32) NOT NULL,
    organization VARCHAR(255),
    bio TEXT,
    photo_url VARCHAR(512),
    work_label VARCHAR(255),
    work_lat DOUBLE PRECISION,
    work_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_gender ON profiles(gender);

-- 3. Preferences (1-to-1 with User, shares user_id as PK)
CREATE TABLE preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    looking_for VARCHAR(32) NOT NULL,
    sleep_schedule VARCHAR(32) NOT NULL,
    cleanliness SMALLINT NOT NULL,
    noise_level SMALLINT NOT NULL,
    diet VARCHAR(32) NOT NULL,
    smoking VARCHAR(32) NOT NULL,
    drinking VARCHAR(32) NOT NULL,
    guests VARCHAR(32) NOT NULL,
    work_mode VARCHAR(32) NOT NULL,
    budget_min INTEGER NOT NULL,
    budget_max INTEGER NOT NULL,
    gender_preference VARCHAR(32) NOT NULL DEFAULT 'ANY',
    move_in_date DATE,
    deal_breakers TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    address_hint VARCHAR(255),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    rent_per_person INTEGER NOT NULL,
    deposit INTEGER,
    room_type VARCHAR(32) NOT NULL,
    furnishing VARCHAR(32) NOT NULL DEFAULT 'SEMI_FURNISHED',
    gender_allowed VARCHAR(32) NOT NULL DEFAULT 'ANY',
    current_flatmates SMALLINT NOT NULL DEFAULT 0,
    spots_available SMALLINT NOT NULL DEFAULT 1,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    available_from DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_locality ON listings(locality);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_rent ON listings(rent_per_person);

-- 5. Listing Photos
CREATE TABLE listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url VARCHAR(512) NOT NULL,
    position SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id, position);

-- 6. Households
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_households_created_by ON households(created_by);

-- 7. Household Members (composite PK)
CREATE TABLE household_members (
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (household_id, user_id)
);

CREATE INDEX idx_household_members_user ON household_members(user_id);

-- 8. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    paid_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'OTHER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_household ON expenses(household_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);

-- 9. Expense Splits (composite PK)
CREATE TABLE expense_splits (
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_paise BIGINT NOT NULL,
    PRIMARY KEY (expense_id, user_id)
);

CREATE INDEX idx_expense_splits_user ON expense_splits(user_id);

-- 10. Match Requests
CREATE TABLE match_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    intro_message TEXT,
    match_score SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX idx_match_requests_from_user ON match_requests(from_user_id);
CREATE INDEX idx_match_requests_to_user ON match_requests(to_user_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_match_requests_listing ON match_requests(listing_id);

-- 11. Messages
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES match_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_request_id ON messages(request_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- 12. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES match_requests(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- 13. Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(32) NOT NULL,
    details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);

-- 14. Blocks (composite PK)
CREATE TABLE blocks (
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- 15. Refresh Tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 16. Email Verification Tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_hash ON email_verification_tokens(token_hash);

-- 17. Trust Scores (1-to-1 with User, shares user_id as PK)
CREATE TABLE trust_scores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL DEFAULT 0,
    breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
