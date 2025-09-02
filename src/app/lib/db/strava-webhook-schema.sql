-- Strava webhook subscriptions table
CREATE TABLE IF NOT EXISTS strava_webhook_subscriptions (
  strava_webhook_subscriptions_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscription_id INTEGER NOT NULL UNIQUE,
  callback_url TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW(); RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_strava_webhook_subscriptions_updated_at ON strava_webhook_subscriptions;
CREATE TRIGGER trg_strava_webhook_subscriptions_updated_at
BEFORE UPDATE ON strava_webhook_subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
