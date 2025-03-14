-- Add permissions column to user_garmin_tokens table
ALTER TABLE user_garmin_tokens
ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for faster permission lookups
CREATE INDEX idx_user_garmin_tokens_permissions ON user_garmin_tokens USING GIN (permissions);

-- Add index for faster timestamp-based queries
CREATE INDEX idx_user_garmin_tokens_updated_at ON user_garmin_tokens (updated_at); 