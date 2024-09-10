-- Users table (minimal, as most auth will be handled by AWS Cognito)
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(user_id),
    preferred_unit VARCHAR(3) CHECK (preferred_unit IN ('kg', 'lbs')),
    preferred_reps INTEGER
);

-- Reference lifts table
CREATE TABLE reference_lifts (
    lift_id SERIAL PRIMARY KEY,
    lift_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_master_lift BOOLEAN DEFAULT FALSE
);

-- User lift logs table
CREATE TABLE user_lift_logs (
    log_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    lift_id INTEGER REFERENCES reference_lifts(lift_id),
    weight DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    date_performed DATE NOT NULL
);

-- Structural balance calculations table
CREATE TABLE structural_balance_calculations (
    calculation_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    master_lift_id INTEGER REFERENCES reference_lifts(lift_id),
    master_lift_weight DECIMAL(6,2) NOT NULL,
    master_lift_reps INTEGER NOT NULL,
    date_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Structural balance results table
CREATE TABLE structural_balance_results (
    result_id SERIAL PRIMARY KEY,
    calculation_id INTEGER REFERENCES structural_balance_calculations(calculation_id),
    lift_id INTEGER REFERENCES reference_lifts(lift_id),
    calculated_weight DECIMAL(6,2) NOT NULL
);
