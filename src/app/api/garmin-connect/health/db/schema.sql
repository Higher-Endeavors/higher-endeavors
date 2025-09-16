-- Garmin Health API Database Schema
-- This file contains the database tables for storing Garmin Health API data

-- Daily Summaries Table
CREATE TABLE IF NOT EXISTS garmin_dailies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    steps INTEGER,
    pushes INTEGER,
    distance_in_meters DECIMAL(10,2),
    push_distance_in_meters DECIMAL(10,2),
    active_time_in_seconds INTEGER,
    active_kilocalories INTEGER,
    bmr_kilocalories INTEGER,
    moderate_intensity_duration_in_seconds INTEGER,
    vigorous_intensity_duration_in_seconds INTEGER,
    floors_climbed INTEGER,
    min_heart_rate_in_beats_per_minute INTEGER,
    average_heart_rate_in_beats_per_minute INTEGER,
    max_heart_rate_in_beats_per_minute INTEGER,
    resting_heart_rate_in_beats_per_minute INTEGER,
    time_offset_heart_rate_samples JSONB,
    average_stress_level INTEGER,
    max_stress_level INTEGER,
    stress_duration_in_seconds INTEGER,
    rest_stress_duration_in_seconds INTEGER,
    activity_stress_duration_in_seconds INTEGER,
    low_stress_duration_in_seconds INTEGER,
    medium_stress_duration_in_seconds INTEGER,
    high_stress_duration_in_seconds INTEGER,
    stress_qualifier VARCHAR(50),
    steps_goal INTEGER,
    pushes_goal INTEGER,
    intensity_duration_goal_in_seconds INTEGER,
    floors_climbed_goal INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Epoch Summaries Table
CREATE TABLE IF NOT EXISTS garmin_epochs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    active_time_in_seconds INTEGER,
    steps INTEGER,
    pushes INTEGER,
    distance_in_meters DECIMAL(10,2),
    push_distance_in_meters DECIMAL(10,2),
    active_kilocalories INTEGER,
    met DECIMAL(8,4),
    intensity VARCHAR(50),
    mean_motion_intensity DECIMAL(3,1),
    max_motion_intensity DECIMAL(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Health Snapshot Summaries Table
CREATE TABLE IF NOT EXISTS garmin_health_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    summaries JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- User Metrics Summaries Table
CREATE TABLE IF NOT EXISTS garmin_user_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    vo2_max DECIMAL(5,2),
    vo2_max_cycling DECIMAL(5,2),
    enhanced BOOLEAN,
    fitness_age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Blood Pressure Summaries Table
CREATE TABLE IF NOT EXISTS garmin_blood_pressures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    measurement_time_in_seconds BIGINT NOT NULL,
    measurement_time_offset_in_seconds INTEGER NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    pulse INTEGER NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('MANUAL', 'DEVICE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Body Composition Summaries Table
CREATE TABLE IF NOT EXISTS garmin_body_compositions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    measurement_time_in_seconds BIGINT NOT NULL,
    measurement_time_offset_in_seconds INTEGER NOT NULL,
    muscle_mass_in_grams INTEGER,
    bone_mass_in_grams INTEGER,
    body_water_in_percent DECIMAL(5,2),
    body_fat_in_percent DECIMAL(5,2),
    body_mass_index DECIMAL(5,2),
    weight_in_grams INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- HRV Summaries Table
CREATE TABLE IF NOT EXISTS garmin_hrv (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    last_night_avg INTEGER,
    last_night_5min_high INTEGER,
    hrv_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Pulse Ox Summaries Table
CREATE TABLE IF NOT EXISTS garmin_pulse_ox (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    time_offset_spo2_values JSONB,
    on_demand BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Respiration Summaries Table
CREATE TABLE IF NOT EXISTS garmin_respiration (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    time_offset_epoch_to_breaths JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Skin Temperature Summaries Table
CREATE TABLE IF NOT EXISTS garmin_skin_temperature (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE,
    avg_deviation_celsius DECIMAL(5,2),
    duration_in_seconds INTEGER NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Sleep Summaries Table
CREATE TABLE IF NOT EXISTS garmin_sleeps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    total_nap_duration_in_seconds INTEGER,
    unmeasurable_sleep_in_seconds INTEGER,
    deep_sleep_duration_in_seconds INTEGER,
    light_sleep_duration_in_seconds INTEGER,
    rem_sleep_in_seconds INTEGER,
    awake_duration_in_seconds INTEGER,
    sleep_levels_map JSONB,
    validation VARCHAR(50) CHECK (validation IN ('MANUAL', 'DEVICE', 'OFF_WRIST', 'AUTO_TENTATIVE', 'AUTO_FINAL', 'AUTO_MANUAL', 'ENHANCED_TENTATIVE', 'ENHANCED_FINAL')),
    time_offset_sleep_respiration JSONB,
    time_offset_sleep_spo2 JSONB,
    overall_sleep_score JSONB,
    sleep_scores JSONB,
    naps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Stress Details Summaries Table
CREATE TABLE IF NOT EXISTS garmin_stress_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    body_battery_charged_value INTEGER,
    body_battery_drained_value INTEGER,
    time_offset_stress_level_values JSONB,
    time_offset_body_battery_values JSONB,
    body_battery_dynamic_feedback_event JSONB,
    body_battery_activity_events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, summary_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_garmin_dailies_user_id ON garmin_dailies(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_dailies_calendar_date ON garmin_dailies(calendar_date);
CREATE INDEX IF NOT EXISTS idx_garmin_dailies_start_time ON garmin_dailies(start_time_in_seconds);

CREATE INDEX IF NOT EXISTS idx_garmin_epochs_user_id ON garmin_epochs(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_epochs_start_time ON garmin_epochs(start_time_in_seconds);
CREATE INDEX IF NOT EXISTS idx_garmin_epochs_activity_type ON garmin_epochs(activity_type);

CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshots_user_id ON garmin_health_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshots_calendar_date ON garmin_health_snapshots(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_user_metrics_user_id ON garmin_user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_user_metrics_calendar_date ON garmin_user_metrics(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_blood_pressures_user_id ON garmin_blood_pressures(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_blood_pressures_measurement_time ON garmin_blood_pressures(measurement_time_in_seconds);

CREATE INDEX IF NOT EXISTS idx_garmin_body_compositions_user_id ON garmin_body_compositions(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_body_compositions_measurement_time ON garmin_body_compositions(measurement_time_in_seconds);

CREATE INDEX IF NOT EXISTS idx_garmin_hrv_user_id ON garmin_hrv(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_hrv_calendar_date ON garmin_hrv(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_pulse_ox_user_id ON garmin_pulse_ox(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_pulse_ox_calendar_date ON garmin_pulse_ox(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_respiration_user_id ON garmin_respiration(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_respiration_start_time ON garmin_respiration(start_time_in_seconds);

CREATE INDEX IF NOT EXISTS idx_garmin_skin_temperature_user_id ON garmin_skin_temperature(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_skin_temperature_calendar_date ON garmin_skin_temperature(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_sleeps_user_id ON garmin_sleeps(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_sleeps_calendar_date ON garmin_sleeps(calendar_date);

CREATE INDEX IF NOT EXISTS idx_garmin_stress_details_user_id ON garmin_stress_details(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_stress_details_calendar_date ON garmin_stress_details(calendar_date);
