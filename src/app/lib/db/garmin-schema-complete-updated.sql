-- Daily Summaries Table
CREATE TABLE IF NOT EXISTS garmin_daily_summaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  steps INTEGER,
  distance_meters DOUBLE PRECISION,
  active_calories INTEGER,
  total_calories INTEGER,
  floors_climbed INTEGER,
  floors_descended INTEGER,
  minutes_sedentary INTEGER,
  minutes_lightly_active INTEGER,
  minutes_moderately_active INTEGER,
  minutes_intensely_active INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_daily_summaries_user_id ON garmin_daily_summaries (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_daily_summaries_date ON garmin_daily_summaries (calendar_date);

-- Sleep Data Table
CREATE TABLE IF NOT EXISTS garmin_sleep_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  duration_seconds INTEGER,
  validation_type VARCHAR(50),
  deep_sleep_seconds INTEGER,
  light_sleep_seconds INTEGER,
  rem_sleep_seconds INTEGER,
  awake_sleep_seconds INTEGER,
  unmeasurable_sleep_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_sleep_data_user_id ON garmin_sleep_data (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_sleep_data_date ON garmin_sleep_data (calendar_date);

-- Enhanced Activities Table with full fields from Activity API
CREATE TABLE IF NOT EXISTS garmin_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  activity_id VARCHAR(255),
  activity_type VARCHAR(100) NOT NULL,
  activity_name VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  distance_meters DOUBLE PRECISION,
  avg_speed_mps DOUBLE PRECISION,
  max_speed_mps DOUBLE PRECISION,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  calories INTEGER,
  device_name VARCHAR(255),
  manual BOOLEAN DEFAULT FALSE,
  is_parent BOOLEAN DEFAULT FALSE,
  parent_summary_id VARCHAR(255),
  is_web_upload BOOLEAN DEFAULT FALSE,
  
  -- Additional fields from Activity API
  average_bike_cadence DOUBLE PRECISION,
  average_run_cadence DOUBLE PRECISION,
  average_swim_cadence DOUBLE PRECISION,
  average_pace_minutes_per_km DOUBLE PRECISION,
  max_bike_cadence DOUBLE PRECISION,
  max_run_cadence DOUBLE PRECISION,
  max_pace_minutes_per_km DOUBLE PRECISION,
  number_of_active_lengths INTEGER,
  starting_latitude DOUBLE PRECISION,
  starting_longitude DOUBLE PRECISION,
  total_elevation_gain DOUBLE PRECISION,
  total_elevation_loss DOUBLE PRECISION,
  
  -- Wheelchair-specific fields
  pushes INTEGER,
  average_push_cadence DOUBLE PRECISION,
  max_push_cadence DOUBLE PRECISION,
  steps INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_activities_user_id ON garmin_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_activities_start_time ON garmin_activities (start_time);
CREATE INDEX IF NOT EXISTS idx_garmin_activities_activity_type ON garmin_activities (activity_type);

-- Activity file table for storing FIT, TCX, and GPX files
CREATE TABLE IF NOT EXISTS garmin_activity_files (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES garmin_activities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL, -- FIT, TCX, or GPX
  file_data BYTEA, -- Binary file content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_activity_files_activity_id ON garmin_activity_files (activity_id);
CREATE INDEX IF NOT EXISTS idx_garmin_activity_files_user_id ON garmin_activity_files (user_id);

-- Activity details for storing detailed metrics
CREATE TABLE IF NOT EXISTS garmin_activity_details (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES garmin_activities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_activity_details_activity_id ON garmin_activity_details (activity_id);
CREATE INDEX IF NOT EXISTS idx_garmin_activity_details_user_id ON garmin_activity_details (user_id);

-- Activity samples for storing time-series data
CREATE TABLE IF NOT EXISTS garmin_activity_samples (
  id SERIAL PRIMARY KEY,
  activity_details_id INTEGER NOT NULL REFERENCES garmin_activity_details(id) ON DELETE CASCADE,
  start_time_seconds INTEGER NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  elevation_meters DOUBLE PRECISION,
  heart_rate INTEGER,
  speed_meters_per_second DOUBLE PRECISION,
  steps_per_minute DOUBLE PRECISION,
  total_distance_meters DOUBLE PRECISION,
  timer_duration_seconds INTEGER,
  clock_duration_seconds INTEGER,
  moving_duration_seconds INTEGER,
  power_watts DOUBLE PRECISION,
  bike_cadence_rpm DOUBLE PRECISION,
  wheelchair_cadence DOUBLE PRECISION,
  swim_cadence DOUBLE PRECISION,
  air_temperature_celsius DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_activity_samples_activity_details_id ON garmin_activity_samples (activity_details_id);
CREATE INDEX IF NOT EXISTS idx_garmin_activity_samples_start_time ON garmin_activity_samples (start_time_seconds);

-- Activity laps
CREATE TABLE IF NOT EXISTS garmin_activity_laps (
  id SERIAL PRIMARY KEY,
  activity_details_id INTEGER NOT NULL REFERENCES garmin_activity_details(id) ON DELETE CASCADE,
  start_time_seconds INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_activity_laps_activity_details_id ON garmin_activity_laps (activity_details_id);

-- Move IQ events (automatically detected activities)
CREATE TABLE IF NOT EXISTS garmin_moveiq_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  activity_type VARCHAR(100) NOT NULL,
  activity_sub_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_moveiq_events_user_id ON garmin_moveiq_events (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_moveiq_events_date ON garmin_moveiq_events (calendar_date);
CREATE INDEX IF NOT EXISTS idx_garmin_moveiq_events_start_time ON garmin_moveiq_events (start_time);

-- Training Status Table
CREATE TABLE IF NOT EXISTS garmin_training_status (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  timestamp TIMESTAMP NOT NULL,
  status VARCHAR(50),
  load_level VARCHAR(50),
  vo2max INTEGER,
  load_value DOUBLE PRECISION,
  recovery_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_training_status_user_id ON garmin_training_status (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_training_status_timestamp ON garmin_training_status (timestamp);

-- Body Composition Table
CREATE TABLE IF NOT EXISTS garmin_body_composition (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  timestamp TIMESTAMP NOT NULL,
  weight_kg DOUBLE PRECISION,
  bmi DOUBLE PRECISION,
  body_fat_percentage DOUBLE PRECISION,
  bone_mass_kg DOUBLE PRECISION,
  muscle_mass_kg DOUBLE PRECISION,
  water_percentage DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_body_composition_user_id ON garmin_body_composition (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_body_composition_timestamp ON garmin_body_composition (timestamp);

-- Epoch Summaries (15-minute intervals)
CREATE TABLE IF NOT EXISTS garmin_epochs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  activity_type VARCHAR(50) NOT NULL,
  duration_seconds INTEGER,
  active_time_seconds INTEGER,
  steps INTEGER,
  pushes INTEGER,
  distance_meters DOUBLE PRECISION,
  push_distance_meters DOUBLE PRECISION,
  active_calories INTEGER,
  met DOUBLE PRECISION,
  intensity VARCHAR(50),
  mean_motion_intensity DOUBLE PRECISION,
  max_motion_intensity DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_epochs_user_id ON garmin_epochs (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_epochs_start_time ON garmin_epochs (start_time);

-- Stress Details Summaries
CREATE TABLE IF NOT EXISTS garmin_stress_details (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  average_stress_level INTEGER,
  max_stress_level INTEGER,
  stress_duration_seconds INTEGER,
  rest_stress_duration_seconds INTEGER,
  activity_stress_duration_seconds INTEGER,
  low_stress_duration_seconds INTEGER,
  medium_stress_duration_seconds INTEGER,
  high_stress_duration_seconds INTEGER,
  stress_qualifier VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_stress_details_user_id ON garmin_stress_details (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_stress_details_date ON garmin_stress_details (calendar_date);

-- User Metrics (VO2 Max, Fitness Age)
CREATE TABLE IF NOT EXISTS garmin_user_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  vo2_max DOUBLE PRECISION,
  vo2_max_cycling DOUBLE PRECISION,
  enhanced BOOLEAN,
  fitness_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_user_metrics_user_id ON garmin_user_metrics (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_user_metrics_date ON garmin_user_metrics (calendar_date);

-- Pulse Ox (Blood Oxygen) Summaries
CREATE TABLE IF NOT EXISTS garmin_pulse_ox (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  on_demand BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garmin_pulse_ox_readings (
  id SERIAL PRIMARY KEY,
  pulse_ox_id INTEGER NOT NULL REFERENCES garmin_pulse_ox(id) ON DELETE CASCADE,
  time_offset_seconds INTEGER NOT NULL,
  spo2_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_pulse_ox_user_id ON garmin_pulse_ox (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_pulse_ox_date ON garmin_pulse_ox (calendar_date);
CREATE INDEX IF NOT EXISTS idx_garmin_pulse_ox_readings_pulse_ox_id ON garmin_pulse_ox_readings (pulse_ox_id);

-- Respiration Summaries
CREATE TABLE IF NOT EXISTS garmin_respiration (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garmin_respiration_readings (
  id SERIAL PRIMARY KEY,
  respiration_id INTEGER NOT NULL REFERENCES garmin_respiration(id) ON DELETE CASCADE,
  time_offset_seconds INTEGER NOT NULL,
  breaths_per_minute DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_respiration_user_id ON garmin_respiration (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_respiration_start_time ON garmin_respiration (start_time);
CREATE INDEX IF NOT EXISTS idx_garmin_respiration_readings_respiration_id ON garmin_respiration_readings (respiration_id);

-- Health Snapshot Summaries
CREATE TABLE IF NOT EXISTS garmin_health_snapshot (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garmin_health_snapshot_metrics (
  id SERIAL PRIMARY KEY,
  health_snapshot_id INTEGER NOT NULL REFERENCES garmin_health_snapshot(id) ON DELETE CASCADE,
  summary_type VARCHAR(50) NOT NULL,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garmin_health_snapshot_readings (
  id SERIAL PRIMARY KEY,
  health_snapshot_metrics_id INTEGER NOT NULL REFERENCES garmin_health_snapshot_metrics(id) ON DELETE CASCADE,
  time_offset_seconds INTEGER NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshot_user_id ON garmin_health_snapshot (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshot_date ON garmin_health_snapshot (calendar_date);
CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshot_metrics_snapshot_id ON garmin_health_snapshot_metrics (health_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_garmin_health_snapshot_readings_metrics_id ON garmin_health_snapshot_readings (health_snapshot_metrics_id);

-- Heart Rate Variability (HRV) Summaries
CREATE TABLE IF NOT EXISTS garmin_hrv (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  last_night_avg INTEGER,
  last_night_5min_high INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garmin_hrv_readings (
  id SERIAL PRIMARY KEY,
  hrv_id INTEGER NOT NULL REFERENCES garmin_hrv(id) ON DELETE CASCADE,
  time_offset_seconds INTEGER NOT NULL,
  hrv_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_hrv_user_id ON garmin_hrv (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_hrv_date ON garmin_hrv (calendar_date);
CREATE INDEX IF NOT EXISTS idx_garmin_hrv_readings_hrv_id ON garmin_hrv_readings (hrv_id);

-- Blood Pressure Summaries
CREATE TABLE IF NOT EXISTS garmin_blood_pressure (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  measurement_time TIMESTAMP NOT NULL,
  measurement_time_offset_seconds INTEGER,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  pulse INTEGER,
  source_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_blood_pressure_user_id ON garmin_blood_pressure (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_blood_pressure_time ON garmin_blood_pressure (measurement_time);

-- Skin Temperature
CREATE TABLE IF NOT EXISTS garmin_skin_temperature (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_user_id VARCHAR(255) NOT NULL,
  summary_id VARCHAR(255) NOT NULL UNIQUE,
  calendar_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  start_time_offset_seconds INTEGER,
  duration_seconds INTEGER,
  avg_deviation_celsius DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_skin_temp_user_id ON garmin_skin_temperature (user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_skin_temp_date ON garmin_skin_temperature (calendar_date);

-- Garmin Workouts Table (from Training API)
CREATE TABLE IF NOT EXISTS garmin_workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  garmin_workout_id BIGINT UNIQUE,
  garmin_owner_id BIGINT,
  workout_name VARCHAR(255) NOT NULL,
  description TEXT,
  updated_date TIMESTAMP,
  created_date TIMESTAMP,
  sport VARCHAR(50) NOT NULL,
  estimated_duration_in_secs INTEGER,
  estimated_distance_in_meters DOUBLE PRECISION,
  pool_length DOUBLE PRECISION,
  pool_length_unit VARCHAR(10),
  workout_provider VARCHAR(255),
  workout_source_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_workouts_user_id ON garmin_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_workouts_sport ON garmin_workouts(sport);

-- Garmin Workout Steps Table (from Training API)
CREATE TABLE IF NOT EXISTS garmin_workout_steps (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES garmin_workouts(id) ON DELETE CASCADE,
  step_id BIGINT,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL, -- WorkoutStep or WorkoutRepeatStep
  repeat_type VARCHAR(50), -- For WorkoutRepeatStep
  repeat_value DOUBLE PRECISION, -- For WorkoutRepeatStep
  skip_last_rest_step BOOLEAN DEFAULT TRUE, -- For LAP_SWIMMING workouts
  intensity VARCHAR(50),
  description TEXT,
  duration_type VARCHAR(50),
  duration_value DOUBLE PRECISION,
  duration_value_type VARCHAR(50),
  target_type VARCHAR(50),
  target_value DOUBLE PRECISION,
  target_value_low DOUBLE PRECISION,
  target_value_high DOUBLE PRECISION,
  target_value_type VARCHAR(50),
  secondary_target_type VARCHAR(50), -- For swimming workouts or secondary targets
  secondary_target_value DOUBLE PRECISION,
  secondary_target_value_low DOUBLE PRECISION,
  secondary_target_value_high DOUBLE PRECISION,
  secondary_target_value_type VARCHAR(50),
  stroke_type VARCHAR(50), -- For swimming workouts
  drill_type VARCHAR(50), -- For swimming workouts
  equipment_type VARCHAR(50), -- For swimming workouts
  exercise_category VARCHAR(50), -- For strength, cardio, yoga workouts
  exercise_name VARCHAR(255), -- For strength, cardio, yoga workouts
  weight_value DOUBLE PRECISION, -- For strength workouts
  weight_display_unit VARCHAR(20), -- For strength workouts
  parent_step_id INTEGER REFERENCES garmin_workout_steps(id) ON DELETE CASCADE, -- For repeat steps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_workout_steps_workout_id ON garmin_workout_steps(workout_id);
CREATE INDEX IF NOT EXISTS idx_garmin_workout_steps_parent_id ON garmin_workout_steps(parent_step_id);
CREATE INDEX IF NOT EXISTS idx_garmin_workout_steps_order ON garmin_workout_steps(step_order);

-- Garmin Workout Schedules Table (from Training API)
CREATE TABLE IF NOT EXISTS garmin_workout_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id BIGINT UNIQUE,
  workout_id INTEGER NOT NULL REFERENCES garmin_workouts(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garmin_workout_schedules_user_id ON garmin_workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_garmin_workout_schedules_workout_id ON garmin_workout_schedules(workout_id);
CREATE INDEX IF NOT EXISTS idx_garmin_workout_schedules_date ON garmin_workout_schedules(scheduled_date); 