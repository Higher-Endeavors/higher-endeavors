-- Body Composition Measurements Table
CREATE TABLE body_composition_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 500), -- in kg
    manual_body_fat_percentage DECIMAL(4,1) CHECK (manual_body_fat_percentage >= 0 AND manual_body_fat_percentage <= 100),
    calculated_body_fat_percentage DECIMAL(4,1) CHECK (calculated_body_fat_percentage >= 0 AND calculated_body_fat_percentage <= 100),
    fat_mass DECIMAL(5,2) CHECK (fat_mass >= 0),
    fat_free_mass DECIMAL(5,2) CHECK (fat_free_mass >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Skinfold Measurements Table
CREATE TABLE skinfold_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measurement_id UUID NOT NULL REFERENCES body_composition_measurements(id) ON DELETE CASCADE,
    chest DECIMAL(4,1) NOT NULL CHECK (chest >= 0),
    abdomen DECIMAL(4,1) NOT NULL CHECK (abdomen >= 0),
    thigh DECIMAL(4,1) NOT NULL CHECK (thigh >= 0),
    triceps DECIMAL(4,1) NOT NULL CHECK (triceps >= 0),
    axilla DECIMAL(4,1) NOT NULL CHECK (axilla >= 0),
    subscapula DECIMAL(4,1) NOT NULL CHECK (subscapula >= 0),
    suprailiac DECIMAL(4,1) NOT NULL CHECK (suprailiac >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Circumference Measurements Table
CREATE TABLE circumference_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    measurement_id UUID NOT NULL REFERENCES body_composition_measurements(id) ON DELETE CASCADE,
    neck DECIMAL(4,1) CHECK (neck >= 0),
    shoulders DECIMAL(4,1) CHECK (shoulders >= 0),
    chest DECIMAL(4,1) CHECK (chest >= 0),
    waist DECIMAL(4,1) CHECK (waist >= 0),
    hips DECIMAL(4,1) CHECK (hips >= 0),
    left_bicep_relaxed DECIMAL(4,1) CHECK (left_bicep_relaxed >= 0),
    left_bicep_flexed DECIMAL(4,1) CHECK (left_bicep_flexed >= 0),
    right_bicep_relaxed DECIMAL(4,1) CHECK (right_bicep_relaxed >= 0),
    right_bicep_flexed DECIMAL(4,1) CHECK (right_bicep_flexed >= 0),
    left_forearm DECIMAL(4,1) CHECK (left_forearm >= 0),
    right_forearm DECIMAL(4,1) CHECK (right_forearm >= 0),
    left_thigh DECIMAL(4,1) CHECK (left_thigh >= 0),
    right_thigh DECIMAL(4,1) CHECK (right_thigh >= 0),
    left_calf DECIMAL(4,1) CHECK (left_calf >= 0),
    right_calf DECIMAL(4,1) CHECK (right_calf >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_body_composition_user_date ON body_composition_measurements(user_id, date);
CREATE INDEX idx_skinfold_measurement_id ON skinfold_measurements(measurement_id);
CREATE INDEX idx_circumference_measurement_id ON circumference_measurements(measurement_id); 