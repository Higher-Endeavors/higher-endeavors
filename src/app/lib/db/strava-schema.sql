-- 1) Table
CREATE TABLE IF NOT EXISTS strava_connections (
  strava_connections_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               INTEGER NOT NULL,
  strava_athlete_id     BIGINT  NOT NULL UNIQUE,
  access_token          TEXT    NOT NULL,
  refresh_token         TEXT    NOT NULL,
  token_expires_at      TIMESTAMPTZ NOT NULL,
  scope                 TEXT    NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at          TIMESTAMPTZ,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,

  CONSTRAINT fk_strava_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- 2) Keep updated_at fresh on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_strava_connections_updated_at ON strava_connections;
CREATE TRIGGER trg_strava_connections_updated_at
BEFORE UPDATE ON strava_connections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Updated Strava activities table with ALL fields from Strava API
CREATE TABLE IF NOT EXISTS strava_activities (
  strava_activities_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- FK must match your connections table PK
  strava_connection_id BIGINT NOT NULL
    REFERENCES strava_connections(strava_connections_id)
    ON UPDATE CASCADE ON DELETE CASCADE,

  -- Strava identifiers
  strava_activity_id   BIGINT  NOT NULL UNIQUE,
  external_id          TEXT,
  upload_id            BIGINT,
  upload_id_str        TEXT,

  -- Core descriptors
  name                 TEXT,
  sport_type           TEXT,           -- e.g., Run, Ride, MountainBikeRide, WeightTraining, etc.
  type                 TEXT,           -- legacy ActivityType

  -- Timing
  start_date           TIMESTAMPTZ NOT NULL,   -- UTC
  start_date_local     TIMESTAMPTZ NOT NULL,   -- local time from API
  timezone             TEXT,
  utc_offset           INTEGER,        -- seconds offset from UTC

  -- Distances / elevation / speeds (Strava returns floats)
  distance             DOUBLE PRECISION CHECK (distance        IS NULL OR distance        >= 0),  -- meters
  moving_time          INTEGER          CHECK (moving_time     IS NULL OR moving_time     >= 0),  -- seconds
  elapsed_time         INTEGER          CHECK (elapsed_time    IS NULL OR elapsed_time    >= 0),  -- seconds
  total_elevation_gain DOUBLE PRECISION,
  elev_high            DOUBLE PRECISION,
  elev_low             DOUBLE PRECISION,
  average_speed        DOUBLE PRECISION,  -- m/s
  max_speed            DOUBLE PRECISION,  -- m/s
  average_cadence      DOUBLE PRECISION,
  average_temp         DOUBLE PRECISION,  -- °C stream units
  average_watts        DOUBLE PRECISION,
  weighted_average_watts DOUBLE PRECISION,
  max_watts            INTEGER,
  kilojoules           DOUBLE PRECISION,  -- rides only
  calories             DOUBLE PRECISION,  -- kilocalories

  -- Heart rate data
  has_heartrate        BOOLEAN,
  average_heartrate    DOUBLE PRECISION,
  max_heartrate        DOUBLE PRECISION,
  heartrate_opt_out    BOOLEAN,
  display_hide_heartrate_option BOOLEAN,

  -- Location data
  location_city        TEXT,
  location_state       TEXT,
  location_country     TEXT,
  start_latlng         JSONB,           -- [lat, lng] array
  end_latlng           JSONB,           -- [lat, lng] array

  -- Map data
  map_id               TEXT,
  summary_polyline     TEXT,

  -- Flags & metadata
  device_watts         BOOLEAN,
  trainer              BOOLEAN,
  commute              BOOLEAN,
  manual               BOOLEAN,
  private              BOOLEAN,
  visibility           TEXT,            -- "everyone", "followers_only", "only_me"
  flagged              BOOLEAN,
  hide_from_home       BOOLEAN,
  workout_type         INTEGER,
  gear_id              TEXT,

  -- Social features
  achievement_count    INTEGER,
  kudos_count          INTEGER,
  comment_count        INTEGER,
  athlete_count        INTEGER,
  photo_count          INTEGER,
  total_photo_count    INTEGER,
  has_kudoed           BOOLEAN,

  -- Performance metrics
  pr_count             INTEGER,
  suffer_score         INTEGER,
  from_accepted_tag    BOOLEAN,

  -- Additional metadata
  description          TEXT,
  raw_data             JSONB,            -- full API response for future-proofing

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_conn_start
  ON strava_activities (strava_connection_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_activities_sport_type
  ON strava_activities (sport_type);

CREATE INDEX IF NOT EXISTS idx_activities_map_id
  ON strava_activities (map_id);

CREATE INDEX IF NOT EXISTS idx_activities_has_heartrate
  ON strava_activities (has_heartrate);

CREATE INDEX IF NOT EXISTS idx_activities_visibility
  ON strava_activities (visibility);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW(); RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_strava_activities_updated_at ON strava_activities;
CREATE TRIGGER trg_strava_activities_updated_at
BEFORE UPDATE ON strava_activities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
