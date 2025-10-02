-- Garmin Activity Data Storage Schema
-- This creates a unified table for storing activity data from Garmin Connect Activity API
-- The 'manual' boolean field distinguishes between regular activity details and manually updated activities

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.garmin_activities CASCADE;

-- Unified Activities Table
CREATE TABLE public.garmin_activities (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    activity_id BIGINT,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    activity_name VARCHAR(500),
    activity_type VARCHAR(100) NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    average_bike_cadence_in_rounds_per_minute DECIMAL(8,2),
    average_heart_rate_in_beats_per_minute INTEGER,
    average_run_cadence_in_steps_per_minute DECIMAL(8,2),
    average_push_cadence_in_pushes_per_minute DECIMAL(8,2),
    average_speed_in_meters_per_second DECIMAL(10,6),
    average_swim_cadence_in_strokes_per_minute DECIMAL(8,2),
    average_pace_in_minutes_per_kilometer DECIMAL(10,6),
    active_kilocalories INTEGER,
    device_name VARCHAR(200),
    distance_in_meters DECIMAL(12,3),
    max_bike_cadence_in_rounds_per_minute DECIMAL(8,2),
    max_heart_rate_in_beats_per_minute INTEGER,
    max_pace_in_minutes_per_kilometer DECIMAL(10,6),
    max_run_cadence_in_steps_per_minute DECIMAL(8,2),
    max_push_cadence_in_pushes_per_minute DECIMAL(8,2),
    max_speed_in_meters_per_second DECIMAL(10,6),
    number_of_active_lengths INTEGER,
    starting_latitude_in_degree DECIMAL(12,8),
    starting_longitude_in_degree DECIMAL(12,8),
    steps INTEGER,
    pushes INTEGER,
    total_elevation_gain_in_meters DECIMAL(8,2),
    total_elevation_loss_in_meters DECIMAL(8,2),
    is_parent BOOLEAN DEFAULT FALSE,
    parent_summary_id VARCHAR(255),
    manual BOOLEAN DEFAULT FALSE,
    samples JSONB DEFAULT '[]',
    laps JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_activities_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_garmin_activities_user_id ON public.garmin_activities(user_id);
CREATE INDEX idx_garmin_activities_activity_type ON public.garmin_activities(activity_type);
CREATE INDEX idx_garmin_activities_start_time ON public.garmin_activities(start_time_in_seconds);
CREATE INDEX idx_garmin_activities_created_at ON public.garmin_activities(created_at);
CREATE INDEX idx_garmin_activities_device_name ON public.garmin_activities(device_name);
CREATE INDEX idx_garmin_activities_manual ON public.garmin_activities(manual);

-- Create GIN indexes on JSONB columns for efficient JSON queries
CREATE INDEX idx_garmin_activities_samples_gin ON public.garmin_activities USING GIN(samples);
CREATE INDEX idx_garmin_activities_laps_gin ON public.garmin_activities USING GIN(laps);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_garmin_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER garmin_activities_updated_at_trigger
    BEFORE UPDATE ON public.garmin_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_activity_updated_at();

-- Grant permissions
ALTER TABLE public.garmin_activities OWNER TO postgres;

-- Comments for documentation
COMMENT ON TABLE public.garmin_activities IS 'Unified table for storing activity data from Garmin Connect Activity API. The manual field distinguishes between regular activity details and manually updated activities.';
