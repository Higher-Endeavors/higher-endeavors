-- Garmin Health Data Storage Schema - Separate Tables
-- This creates individual tables for each health data type for better performance and data integrity

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.garmin_blood_pressures CASCADE;
DROP TABLE IF EXISTS public.garmin_body_compositions CASCADE;
DROP TABLE IF EXISTS public.garmin_hrv CASCADE;
DROP TABLE IF EXISTS public.garmin_pulse_ox CASCADE;
DROP TABLE IF EXISTS public.garmin_respiration CASCADE;
DROP TABLE IF EXISTS public.garmin_skin_temperature CASCADE;
DROP TABLE IF EXISTS public.garmin_sleeps CASCADE;
DROP TABLE IF EXISTS public.garmin_stress_details CASCADE;

-- Blood Pressure Table
CREATE TABLE public.garmin_blood_pressures (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    measurement_time_in_seconds BIGINT NOT NULL,
    measurement_time_offset_in_seconds INTEGER NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    pulse INTEGER NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('MANUAL', 'DEVICE')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_blood_pressures_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Body Composition Table
CREATE TABLE public.garmin_body_compositions (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    measurement_time_in_seconds BIGINT NOT NULL,
    measurement_time_offset_in_seconds INTEGER NOT NULL,
    muscle_mass_in_grams INTEGER,
    bone_mass_in_grams INTEGER,
    body_water_in_percent DECIMAL(5,2),
    body_fat_in_percent DECIMAL(5,2),
    body_mass_index DECIMAL(5,2),
    weight_in_grams INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_body_compositions_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Heart Rate Variability (HRV) Table
CREATE TABLE public.garmin_hrv (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    last_night_avg INTEGER NOT NULL,
    last_night_5min_high INTEGER NOT NULL,
    hrv_values JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_hrv_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Pulse Ox Table
CREATE TABLE public.garmin_pulse_ox (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    time_offset_spo2_values JSONB NOT NULL DEFAULT '{}',
    on_demand BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_pulse_ox_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Respiration Table
CREATE TABLE public.garmin_respiration (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    time_offset_epoch_to_breaths JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_respiration_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Skin Temperature Table
CREATE TABLE public.garmin_skin_temperature (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    avg_deviation_celsius DECIMAL(5,2) NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_skin_temperature_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Sleep Table
CREATE TABLE public.garmin_sleeps (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
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
    validation VARCHAR(50) NOT NULL CHECK (validation IN (
        'MANUAL', 'DEVICE', 'OFF_WRIST', 'AUTO_TENTATIVE', 
        'AUTO_FINAL', 'AUTO_MANUAL', 'ENHANCED_TENTATIVE', 'ENHANCED_FINAL'
    )),
    time_offset_sleep_respiration JSONB,
    time_offset_sleep_spo2 JSONB,
    overall_sleep_score JSONB,
    sleep_scores JSONB,
    naps JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_sleeps_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Stress Details Table
CREATE TABLE public.garmin_stress_details (
    id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    summary_id VARCHAR(255) NOT NULL,
    calendar_date DATE NOT NULL,
    start_time_in_seconds BIGINT NOT NULL,
    start_time_offset_in_seconds INTEGER NOT NULL,
    duration_in_seconds INTEGER NOT NULL,
    body_battery_charged_value INTEGER,
    body_battery_drained_value INTEGER,
    time_offset_stress_level_values JSONB NOT NULL DEFAULT '{}',
    time_offset_body_battery_values JSONB,
    body_battery_dynamic_feedback_event JSONB,
    body_battery_activity_events JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT garmin_stress_details_user_summary_uk UNIQUE (user_id, summary_id)
);

-- Create indexes for better query performance
-- Blood Pressure indexes
CREATE INDEX idx_garmin_blood_pressures_user_id ON public.garmin_blood_pressures(user_id);
CREATE INDEX idx_garmin_blood_pressures_measurement_time ON public.garmin_blood_pressures(measurement_time_in_seconds);
CREATE INDEX idx_garmin_blood_pressures_created_at ON public.garmin_blood_pressures(created_at);

-- Body Composition indexes
CREATE INDEX idx_garmin_body_compositions_user_id ON public.garmin_body_compositions(user_id);
CREATE INDEX idx_garmin_body_compositions_measurement_time ON public.garmin_body_compositions(measurement_time_in_seconds);
CREATE INDEX idx_garmin_body_compositions_created_at ON public.garmin_body_compositions(created_at);

-- HRV indexes
CREATE INDEX idx_garmin_hrv_user_id ON public.garmin_hrv(user_id);
CREATE INDEX idx_garmin_hrv_calendar_date ON public.garmin_hrv(calendar_date);
CREATE INDEX idx_garmin_hrv_start_time ON public.garmin_hrv(start_time_in_seconds);
CREATE INDEX idx_garmin_hrv_created_at ON public.garmin_hrv(created_at);

-- Pulse Ox indexes
CREATE INDEX idx_garmin_pulse_ox_user_id ON public.garmin_pulse_ox(user_id);
CREATE INDEX idx_garmin_pulse_ox_calendar_date ON public.garmin_pulse_ox(calendar_date);
CREATE INDEX idx_garmin_pulse_ox_start_time ON public.garmin_pulse_ox(start_time_in_seconds);
CREATE INDEX idx_garmin_pulse_ox_created_at ON public.garmin_pulse_ox(created_at);

-- Respiration indexes
CREATE INDEX idx_garmin_respiration_user_id ON public.garmin_respiration(user_id);
CREATE INDEX idx_garmin_respiration_start_time ON public.garmin_respiration(start_time_in_seconds);
CREATE INDEX idx_garmin_respiration_created_at ON public.garmin_respiration(created_at);

-- Skin Temperature indexes
CREATE INDEX idx_garmin_skin_temperature_user_id ON public.garmin_skin_temperature(user_id);
CREATE INDEX idx_garmin_skin_temperature_calendar_date ON public.garmin_skin_temperature(calendar_date);
CREATE INDEX idx_garmin_skin_temperature_start_time ON public.garmin_skin_temperature(start_time_in_seconds);
CREATE INDEX idx_garmin_skin_temperature_created_at ON public.garmin_skin_temperature(created_at);

-- Sleep indexes
CREATE INDEX idx_garmin_sleeps_user_id ON public.garmin_sleeps(user_id);
CREATE INDEX idx_garmin_sleeps_calendar_date ON public.garmin_sleeps(calendar_date);
CREATE INDEX idx_garmin_sleeps_start_time ON public.garmin_sleeps(start_time_in_seconds);
CREATE INDEX idx_garmin_sleeps_created_at ON public.garmin_sleeps(created_at);

-- Stress Details indexes
CREATE INDEX idx_garmin_stress_details_user_id ON public.garmin_stress_details(user_id);
CREATE INDEX idx_garmin_stress_details_calendar_date ON public.garmin_stress_details(calendar_date);
CREATE INDEX idx_garmin_stress_details_start_time ON public.garmin_stress_details(start_time_in_seconds);
CREATE INDEX idx_garmin_stress_details_created_at ON public.garmin_stress_details(created_at);

-- Create GIN indexes on JSONB columns for efficient JSON queries
CREATE INDEX idx_garmin_hrv_hrv_values_gin ON public.garmin_hrv USING GIN(hrv_values);
CREATE INDEX idx_garmin_pulse_ox_spo2_values_gin ON public.garmin_pulse_ox USING GIN(time_offset_spo2_values);
CREATE INDEX idx_garmin_respiration_breaths_gin ON public.garmin_respiration USING GIN(time_offset_epoch_to_breaths);
CREATE INDEX idx_garmin_sleeps_levels_map_gin ON public.garmin_sleeps USING GIN(sleep_levels_map);
CREATE INDEX idx_garmin_sleeps_respiration_gin ON public.garmin_sleeps USING GIN(time_offset_sleep_respiration);
CREATE INDEX idx_garmin_sleeps_spo2_gin ON public.garmin_sleeps USING GIN(time_offset_sleep_spo2);
CREATE INDEX idx_garmin_sleeps_scores_gin ON public.garmin_sleeps USING GIN(sleep_scores);
CREATE INDEX idx_garmin_sleeps_naps_gin ON public.garmin_sleeps USING GIN(naps);
CREATE INDEX idx_garmin_stress_details_stress_values_gin ON public.garmin_stress_details USING GIN(time_offset_stress_level_values);
CREATE INDEX idx_garmin_stress_details_body_battery_values_gin ON public.garmin_stress_details USING GIN(time_offset_body_battery_values);
CREATE INDEX idx_garmin_stress_details_activity_events_gin ON public.garmin_stress_details USING GIN(body_battery_activity_events);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_garmin_health_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at for all tables
CREATE TRIGGER garmin_blood_pressures_updated_at_trigger
    BEFORE UPDATE ON public.garmin_blood_pressures
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_body_compositions_updated_at_trigger
    BEFORE UPDATE ON public.garmin_body_compositions
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_hrv_updated_at_trigger
    BEFORE UPDATE ON public.garmin_hrv
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_pulse_ox_updated_at_trigger
    BEFORE UPDATE ON public.garmin_pulse_ox
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_respiration_updated_at_trigger
    BEFORE UPDATE ON public.garmin_respiration
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_skin_temperature_updated_at_trigger
    BEFORE UPDATE ON public.garmin_skin_temperature
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_sleeps_updated_at_trigger
    BEFORE UPDATE ON public.garmin_sleeps
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

CREATE TRIGGER garmin_stress_details_updated_at_trigger
    BEFORE UPDATE ON public.garmin_stress_details
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_health_updated_at();

-- Grant permissions
ALTER TABLE public.garmin_blood_pressures OWNER TO postgres;
ALTER TABLE public.garmin_body_compositions OWNER TO postgres;
ALTER TABLE public.garmin_hrv OWNER TO postgres;
ALTER TABLE public.garmin_pulse_ox OWNER TO postgres;
ALTER TABLE public.garmin_respiration OWNER TO postgres;
ALTER TABLE public.garmin_skin_temperature OWNER TO postgres;
ALTER TABLE public.garmin_sleeps OWNER TO postgres;
ALTER TABLE public.garmin_stress_details OWNER TO postgres;

-- Comments for documentation
COMMENT ON TABLE public.garmin_blood_pressures IS 'Stores blood pressure data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_body_compositions IS 'Stores body composition data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_hrv IS 'Stores heart rate variability data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_pulse_ox IS 'Stores pulse oximetry data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_respiration IS 'Stores respiration data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_skin_temperature IS 'Stores skin temperature data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_sleeps IS 'Stores sleep data from Garmin Connect Health API';
COMMENT ON TABLE public.garmin_stress_details IS 'Stores stress and body battery data from Garmin Connect Health API';
