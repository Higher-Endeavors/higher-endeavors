CREATE TABLE public.body_composition_entries (
    id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Foreign key reference using integer
    entry_data JSONB NOT NULL, -- JSONB for flexible storage of additional metrics
    weight DECIMAL(5,2) CHECK (weight > 0 AND weight < 500), -- Frequently queried metric
    body_fat_percentage DECIMAL(4,1) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100), -- For analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL -- Record creation timestamp
);

-- Index for JSONB queries
CREATE INDEX idx_body_composition_entry_data ON public.body_composition_entries USING gin (entry_data);

-- Composite index for querying user records chronologically
CREATE INDEX idx_body_composition_user_date ON public.body_composition_entries (user_id, created_at);

-- Index for querying by weight
CREATE INDEX idx_body_composition_weight ON public.body_composition_entries (weight);

-- Index for querying by body fat percentage
CREATE INDEX idx_body_composition_body_fat_percentage ON public.body_composition_entries (body_fat_percentage);