# Resistance Training Database Optimization

## Performance Indexes
- Program Discovery and Management
- Performance Analysis
- Navigation and Retrieval

## Common Query Patterns
- Program Management
- Progress Tracking
- Volume Analysis

### Program Discovery and Management

sql
-- Optimizes program search by user, name, type, and date range
-- Used when users are browsing their programs or filtering by date/type
CREATE INDEX idx_resistance_programs_search
ON public.resistance_programs (user_id, program_name, periodization_type, start_date, end_date);
-- Enables efficient template searches by name and type
-- Used when users are browsing available templates
CREATE INDEX idx_program_templates_search
ON public.resistance_program_templates (template_name, periodization_type);
-- Improves user exercise lookup performance
-- Critical for users with many custom exercises
CREATE INDEX idx_user_exercises_search
ON public.user_exercises (user_id, exercise_name);

### Performance Analysis
```sql
-- Optimizes session querying by user and date
-- Essential for analyzing training history and progress
CREATE INDEX idx_user_actual_sessions_analysis
ON public.user_actual_sessions (user_id, session_date);

-- Partial index for library exercise performance tracking
-- Improves queries that analyze progress on standard exercises
CREATE INDEX idx_program_day_exercises_analysis
ON public.program_day_exercises (exercise_library_id, exercise_source)
WHERE exercise_source = 'library';

-- Enables efficient planned vs actual comparisons
-- Used for adherence tracking and progress analysis
CREATE INDEX idx_actual_exercise_sets_comparison
ON public.user_actual_exercise_sets (user_actual_session_id, program_day_exercise_set_id);

-- Optimizes load progression analysis
-- Partial index to improve performance tracking queries
CREATE INDEX idx_exercise_sets_load_tracking
ON public.program_day_exercise_sets (program_day_exercise_id, planned_load)
WHERE planned_load IS NOT NULL;

-- Improves personal record (PR) tracking
-- Partial index for analyzing max loads across different rep ranges
CREATE INDEX idx_actual_sets_pr_tracking
ON public.user_actual_exercise_sets (user_actual_session_id, actual_load, actual_reps)
WHERE actual_load IS NOT NULL;

-- Enhances exercise frequency analysis
-- Includes exercise_source for faster filtering
CREATE INDEX idx_exercise_frequency
ON public.program_day_exercises (exercise_library_id, program_day_id)
INCLUDE (exercise_source);

-- Compound index for time-based analysis
-- Improves performance of date-range queries with user filtering
CREATE INDEX idx_session_exercise_analysis
ON public.user_actual_sessions (user_id, session_date, program_day_id);
```

## Navigation and Retrieval

### Program Management
```sql
-- Find programs by type and date range
-- Used in program search/filter functionality
SELECT * FROM resistance_programs
WHERE user_id = $1 
  AND periodization_type = $2
  AND start_date BETWEEN $3 AND $4;

-- Find similar program templates
-- Used for program recommendations
SELECT * FROM resistance_program_templates
WHERE periodization_type = $1;
```

### Progress Tracking
```sql
-- Track progression of specific exercises
-- Used in performance charts and progress reports
SELECT 
    e.exercise_library_id,
    s.planned_load,
    aes.actual_load,
    uas.session_date
FROM program_day_exercises e
JOIN program_day_exercise_sets s ON e.id = s.program_day_exercise_id
JOIN user_actual_exercise_sets aes ON s.id = aes.program_day_exercise_set_id
JOIN user_actual_sessions uas ON aes.user_actual_session_id = uas.id
WHERE e.exercise_library_id = $1
  AND uas.user_id = $2
ORDER BY uas.session_date;

-- Find Personal Records (PRs) for specific exercises
-- Used in PR tracking and achievement displays
SELECT 
    el.exercise_name,
    MAX(aes.actual_load) as max_load,
    aes.actual_reps,
    uas.session_date
FROM user_actual_exercise_sets aes
JOIN user_actual_sessions uas ON aes.user_actual_session_id = uas.id
JOIN program_day_exercises pde ON aes.program_day_exercise_set_id = pde.id
JOIN exercise_library el ON pde.exercise_library_id = el.id
WHERE uas.user_id = $1
    AND pde.exercise_library_id = $2
GROUP BY el.exercise_name, aes.actual_reps, uas.session_date
ORDER BY aes.actual_reps, max_load DESC;
```

### Volume Analysis
```sql
-- Compare volume across programs
-- Used for program comparison and analysis
SELECT 
    rp.id as program_id,
    rp.program_name,
    COUNT(DISTINCT uas.id) as total_sessions,
    AVG(aes.actual_load * aes.actual_reps) as avg_volume
FROM resistance_programs rp
JOIN program_weeks pw ON rp.id = pw.resistance_program_id
JOIN program_days pd ON pw.id = pd.program_week_id
JOIN user_actual_sessions uas ON pd.id = uas.program_day_id
JOIN user_actual_exercise_sets aes ON uas.id = aes.user_actual_session_id
WHERE rp.user_id = $1
GROUP BY rp.id, rp.program_name;

-- Analyze exercise frequency and volume trends
-- Used for weekly volume tracking and trend analysis
SELECT 
    DATE_TRUNC('week', uas.session_date) as training_week,
    COUNT(DISTINCT uas.id) as sessions_per_week,
    SUM(aes.actual_load * aes.actual_reps) as total_volume
FROM user_actual_sessions uas
JOIN user_actual_exercise_sets aes ON uas.id = aes.user_actual_session_id
WHERE uas.user_id = $1
    AND uas.session_date BETWEEN $2 AND $3
GROUP BY DATE_TRUNC('week', uas.session_date)
ORDER BY training_week;

-- Compare planned vs actual volume
-- Used for adherence tracking and program effectiveness analysis
WITH planned_volume AS (
    SELECT 
        pd.id as day_id,
        SUM(pdes.planned_load * pdes.planned_reps) as planned_volume
    FROM program_days pd
    JOIN program_day_exercises pde ON pd.id = pde.program_day_id
    JOIN program_day_exercise_sets pdes ON pde.id = pdes.program_day_exercise_id
    GROUP BY pd.id
),
actual_volume AS (
    SELECT 
        uas.program_day_id,
        SUM(aes.actual_load * aes.actual_reps) as actual_volume
    FROM user_actual_sessions uas
    JOIN user_actual_exercise_sets aes ON uas.id = aes.user_actual_session_id
    GROUP BY uas.program_day_id
)
SELECT 
    pw.week_number,
    pd.day_number,
    pv.planned_volume,
    av.actual_volume,
    ROUND((av.actual_volume - pv.planned_volume) / pv.planned_volume * 100, 2) as volume_difference_percent
FROM program_days pd
JOIN program_weeks pw ON pd.program_week_id = pw.id
LEFT JOIN planned_volume pv ON pd.id = pv.day_id
LEFT JOIN actual_volume av ON pd.id = av.program_day_id
WHERE pw.resistance_program_id = $1
ORDER BY pw.week_number, pd.day_number;
```

### Navigation and Retrieval
-- Optimizes weekly program retrieval
CREATE INDEX idx_program_weeks_lookup...

-- Improves daily workout retrieval
CREATE INDEX idx_program_days_lookup...

-- Enhances exercise order retrieval
CREATE INDEX idx_exercise_order...