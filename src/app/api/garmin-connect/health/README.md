# Garmin Connect Health API Webhook

This module handles incoming health data from Garmin Connect via webhook notifications.

## Overview

The webhook endpoint `/api/garmin-connect/health` receives push notifications from Garmin Connect containing health data for connected users. This implementation supports the following health data types:

- **Blood Pressure** - Blood pressure readings from Index BPM devices or manual entries
- **Body Composition** - Weight, BMI, body fat percentage, muscle mass, etc.
- **Heart Rate Variability (HRV)** - HRV data collected during sleep
- **Pulse Ox** - Blood oxygen saturation measurements
- **Respiration** - Breathing rate data throughout the day
- **Skin Temperature** - Sleep skin temperature changes
- **Sleep** - Sleep duration, stages, and quality metrics
- **Stress Details** - Stress levels and Body Battery data

## Files

- `route.ts` - Main webhook handler
- `types.ts` - TypeScript type definitions for all health data structures
- `lib/health-data-utils.ts` - Utility functions for querying stored health data
- `db/schema.sql` - Database schema for storing health data
- `README.md` - This documentation

## Webhook Configuration

### Endpoint URL
```
https://yourdomain.com/api/garmin-connect/health
```

### Supported Notification Types

1. **Health Data Notifications** - Contains actual health data
2. **Deregistration Notifications** - User has disconnected their Garmin account
3. **User Permission Changes** - User has modified their data sharing permissions

### Data Flow

1. Garmin sends POST request to webhook endpoint
2. Webhook validates and parses the payload
3. Health data is stored in `garmin_health_data` table
4. Deregistration/permission changes update user settings
5. Webhook responds with HTTP 200 to acknowledge receipt

## Database Schema

### Separate Tables for Each Health Data Type

The system uses individual tables for each health data type for better performance, data integrity, and easier querying:

#### Blood Pressure Table
```sql
CREATE TABLE garmin_blood_pressures (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
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
```

#### Body Composition Table
```sql
CREATE TABLE garmin_body_compositions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
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
```

#### Sleep Table
```sql
CREATE TABLE garmin_sleeps (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
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
    validation VARCHAR(50) NOT NULL,
    time_offset_sleep_respiration JSONB,
    time_offset_sleep_spo2 JSONB,
    overall_sleep_score JSONB,
    sleep_scores JSONB,
    naps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, summary_id)
);
```

#### Other Tables
- `garmin_hrv` - Heart Rate Variability data
- `garmin_pulse_ox` - Pulse Oximetry data  
- `garmin_respiration` - Respiration data
- `garmin_skin_temperature` - Skin temperature data
- `garmin_stress_details` - Stress and Body Battery data

Each table has:
- Proper indexing for performance
- Foreign key constraints to users table
- Unique constraints on (user_id, summary_id)
- Automatic timestamp updates
- JSONB columns for complex data structures

## Data Types

Each health data type has specific fields based on the Garmin Health API v1.2.0 specification:

### Blood Pressure
- `systolic`, `diastolic`, `pulse` - Blood pressure values
- `sourceType` - 'MANUAL' or 'DEVICE'
- `measurementTimeInSeconds` - When measurement was taken

### Body Composition
- `weightInGrams` - Weight in grams
- `bodyFatInPercent` - Body fat percentage
- `muscleMassInGrams` - Muscle mass
- `bodyWaterInPercent` - Body water percentage
- `bodyMassIndex` - BMI value

### Sleep
- `durationInSeconds` - Total sleep duration
- `deepSleepDurationInSeconds` - Deep sleep time
- `lightSleepDurationInSeconds` - Light sleep time
- `remSleepInSeconds` - REM sleep time
- `sleepLevelsMap` - Detailed sleep stage timing
- `validation` - How sleep data was collected

### Stress Details
- `timeOffsetStressLevelValues` - Stress levels over time
- `timeOffsetBodyBatteryValues` - Body Battery levels
- `bodyBatteryChargedValue` - Total charge gained
- `bodyBatteryDrainedValue` - Total charge lost

## Usage Examples

### Querying Health Data

```typescript
import { getHealthData, getLatestHealthDataByType, getHealthDataById } from './lib/health-data-utils';

// Get sleep data for a user
const sleepData = await getHealthData({
  userId: 123,
  dataType: 'sleeps',
  limit: 10
});

// Get latest data for each type
const latestData = await getLatestHealthDataByType(123);

// Get specific record by ID
const specificSleep = await getHealthDataById('sleeps', 456);
```

### API Endpoints

```bash
# Get latest data for all types
GET /api/garmin-connect/health/data?latest=true

# Get sleep data for last 30 days
GET /api/garmin-connect/health/data?type=sleeps&days=30

# Get specific record
GET /api/garmin-connect/health/data?type=sleeps&id=123

# Get summary statistics
GET /api/garmin-connect/health/data?summary=true&days=30

# Clean up old data (all types)
DELETE /api/garmin-connect/health/data?olderThanDays=365

# Clean up old data (specific type)
DELETE /api/garmin-connect/health/data?type=sleeps&olderThanDays=180
```

### Processing Sleep Data

```typescript
const sleepData = latestData.sleeps?.data as SleepSummary;
if (sleepData) {
  const totalSleepHours = sleepData.durationInSeconds / 3600;
  const deepSleepHours = sleepData.deepSleepDurationInSeconds / 3600;
  const sleepEfficiency = (sleepData.durationInSeconds - sleepData.awakeDurationInSeconds) / sleepData.durationInSeconds;
}
```

## Error Handling

The webhook always returns HTTP 200 to prevent Garmin from retrying failed requests. Errors are logged for debugging:

- Invalid data format
- User not found
- Database errors
- Missing required fields

## Security Considerations

1. **Authentication** - Webhook should be secured with HTTPS
2. **Data Validation** - All incoming data is validated before storage
3. **User Privacy** - Health data is stored securely and linked to authenticated users
4. **Rate Limiting** - Consider implementing rate limiting for the webhook endpoint

## Monitoring

Monitor the following metrics:

- Webhook request volume
- Data storage success rate
- User lookup failures
- Data validation failures
- Database performance

## Testing

Use the Garmin Developer Portal tools to test webhook integration:

1. **Data Generator** - Simulate user data sync
2. **Summary Resender** - Resend notifications for testing
3. **Partner Verification** - Verify webhook configuration

## Troubleshooting

### Common Issues

1. **User Not Found** - Check that user has completed Garmin authorization
2. **Invalid Data** - Verify data type validation logic
3. **Database Errors** - Check database connection and schema
4. **Missing Permissions** - Ensure user has granted necessary data permissions

### Logs

Check application logs for detailed error information:
- Webhook payload structure
- User lookup results
- Data validation failures
- Database operation results
