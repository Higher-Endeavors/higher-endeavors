# Garmin Connect Activity API Webhook

This webhook implementation receives pushed activity data from Garmin Connect Activity API v1.2.2. It handles Activity Details and Manually Updated Activities data types.

## Overview

The webhook receives real-time activity data from Garmin Connect and stores it in dedicated database tables for efficient querying and analysis.

### Supported Data Types

- **Activity Details** - Detailed fitness activity data including GPS samples, heart rate, and sensor data
- **Manually Updated Activities** - Activities that have been manually edited by users on Garmin Connect

## Webhook Configuration

### Endpoint URL
```
https://yourdomain.com/api/garmin-connect/activity
```

### Garmin Developer Portal Setup

1. Log in to [Garmin Developer Portal](https://apis.garmin.com/tools/endpoints/)
2. Navigate to Endpoint Configuration
3. Enable the following summary types:
   - **Activity Details** - Set to Push Service
   - **Manually Updated Activities** - Set to Push Service
4. Configure the webhook URL for each enabled type

## Database Schema

### Unified Activities Table
The system uses a single unified table to store both Activity Details and Manually Updated Activities. The `manual` boolean field distinguishes between the two data types:

- `manual = false`: Activity Details (regular fitness activities with GPS samples, heart rate, etc.)
- `manual = true`: Manually Updated Activities (activities edited by users on Garmin Connect)

```sql
CREATE TABLE garmin_activities (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    summary_id VARCHAR(255) NOT NULL,
    activity_id VARCHAR(255), -- Optional for manually updated activities
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
    manual BOOLEAN DEFAULT FALSE, -- Key field: false = Activity Details, true = Manually Updated
    samples JSONB DEFAULT '[]', -- GPS samples, heart rate data, etc. (Activity Details only)
    laps JSONB DEFAULT '[]', -- Lap markers (Activity Details only)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, summary_id)
);
```

## Data Types

The unified table stores both types of activity data, distinguished by the `manual` field:

### Activity Details (`manual = false`)
Regular fitness activities with comprehensive data:

- **Summary Data**: Basic activity information (type, duration, distance, calories, etc.)
- **Samples**: Detailed sensor data including GPS coordinates, heart rate, speed, etc.
- **Laps**: Lap markers for activities with lap functionality
- **Activity ID**: Unique identifier for the activity
- **Steps**: Step count (when applicable)

### Manually Updated Activities (`manual = true`)
Activities that have been manually edited by users on Garmin Connect:

- **Basic Activity Data**: Similar to activity details but without samples/laps
- **No Activity ID**: Manually updated activities don't have activity IDs
- **No Steps**: Steps field is not populated for manually updated activities
- **Simplified Data**: Focuses on core metrics without detailed sensor data

## Usage Examples

### Querying Activity Data

```typescript
import { getActivityData, getLatestActivityDataByType, getActivityDataById } from './lib/activity-data-utils';

// Get activity details for a user
const activityDetails = await getActivityData({
  userId: 123,
  dataType: 'activityDetails',
  limit: 10,
  activityType: 'RUNNING'
});

// Get latest data for each type
const latestData = await getLatestActivityDataByType(123);

// Get specific record by ID
const specificActivity = await getActivityDataById('activityDetails', 456);
```

### API Endpoints

```bash
# Get latest data for all types
GET /api/garmin-connect/activity/data?latest=true

# Get activity details for last 30 days
GET /api/garmin-connect/activity/data?type=activityDetails&days=30

# Get running activities only
GET /api/garmin-connect/activity/data?type=activityDetails&activityType=RUNNING

# Get specific record
GET /api/garmin-connect/activity/data?type=activityDetails&id=123

# Get summary statistics
GET /api/garmin-connect/activity/data?summary=true&days=30

# Get activity statistics by type
GET /api/garmin-connect/activity/data?stats=true&days=30

# Clean up old data (all types)
DELETE /api/garmin-connect/activity/data?olderThanDays=365

# Clean up old data (specific type)
DELETE /api/garmin-connect/activity/data?type=activityDetails&olderThanDays=180
```

### Processing Activity Data

```typescript
// Process Activity Details (manual = false)
const activityDetails = latestData.activityDetails?.data as ActivityData;

if (activityDetails && !activityDetails.manual) {
  // Access basic activity information
  console.log(`Activity: ${activityDetails.activityName}`);
  console.log(`Type: ${activityDetails.activityType}`);
  console.log(`Duration: ${activityDetails.durationInSeconds} seconds`);
  console.log(`Distance: ${activityDetails.distanceInMeters} meters`);
  console.log(`Calories: ${activityDetails.activeKilocalories}`);
  console.log(`Steps: ${activityDetails.steps}`);
  
  // Access detailed samples (GPS, heart rate, etc.)
  if (activityDetails.samples) {
    activityDetails.samples.forEach(sample => {
      console.log(`Time: ${sample.startTimeInSeconds}`);
      console.log(`Heart Rate: ${sample.heartRate} bpm`);
      console.log(`GPS: ${sample.latitudeInDegree}, ${sample.longitudeInDegree}`);
    });
  }
  
  // Access lap data
  if (activityDetails.laps) {
    activityDetails.laps.forEach(lap => {
      console.log(`Lap start: ${lap.startTimeInSeconds}`);
    });
  }
}

// Process Manually Updated Activities (manual = true)
const manualActivity = latestData.manuallyUpdatedActivities?.data as ActivityData;

if (manualActivity && manualActivity.manual) {
  // Access basic activity information (no samples/laps)
  console.log(`Manual Activity: ${manualActivity.activityType}`);
  console.log(`Duration: ${manualActivity.durationInSeconds} seconds`);
  console.log(`Distance: ${manualActivity.distanceInMeters} meters`);
  console.log(`Calories: ${manualActivity.activeKilocalories}`);
  console.log(`Pushes: ${manualActivity.pushes}`); // For wheelchair activities
}
```

## Activity Types

The system supports all Garmin activity types including:

### Running
- `RUNNING`, `INDOOR_RUNNING`, `TRAIL_RUNNING`, `TREADMILL_RUNNING`, etc.

### Cycling
- `CYCLING`, `MOUNTAIN_BIKING`, `ROAD_BIKING`, `INDOOR_CYCLING`, etc.

### Swimming
- `SWIMMING`, `LAP_SWIMMING`, `OPEN_WATER_SWIMMING`

### Fitness Equipment
- `FITNESS_EQUIPMENT`, `ELLIPTICAL`, `INDOOR_ROWING`, `STRENGTH_TRAINING`

### And many more...
See the complete list in `types.ts` for all supported activity types.

## Error Handling

The webhook implements comprehensive error handling:

- **Data Validation**: All incoming data is validated using TypeScript type guards
- **User Lookup**: Graceful handling of unknown users
- **Database Errors**: Proper error logging and recovery
- **Always Returns 200**: Prevents Garmin from retrying failed webhooks

## Security

- **Authentication Required**: All data retrieval endpoints require user authentication
- **User Isolation**: Users can only access their own activity data
- **Input Validation**: All inputs are validated and sanitized

## Monitoring

The webhook logs all important events:

- **Info**: Successful data storage, user lookups
- **Warn**: Invalid data, missing users, cleanup operations
- **Error**: Database errors, processing failures

## Performance

- **Optimized Indexes**: Database indexes on user_id, activity_type, start_time, created_at
- **JSONB Storage**: Efficient storage of samples and laps data
- **Pagination Support**: Limit and offset parameters for large datasets
- **Automatic Cleanup**: Tools to remove old data

## Troubleshooting

### Common Issues

1. **No Data Received**
   - Verify webhook URL is accessible via HTTPS
   - Check Garmin Developer Portal configuration
   - Ensure user has authorized the application

2. **Data Not Stored**
   - Check database connection
   - Verify user exists in system
   - Review error logs for validation failures

3. **Performance Issues**
   - Monitor database query performance
   - Consider data cleanup for old records
   - Check index usage

### Debugging

Enable detailed logging by checking the server logs for:
- Webhook receipt confirmations
- Data validation results
- Database operation outcomes
- Error details and stack traces

## Migration

To implement this webhook:

1. **Run Database Migration**:
   ```sql
   -- Execute schema.sql to create tables
   ```

2. **Configure Garmin Developer Portal**:
   - Enable Activity Details and Manually Updated Activities
   - Set webhook URL to your domain

3. **Test Integration**:
   - Use Garmin's Data Generator tool
   - Verify data storage and retrieval
   - Test error scenarios

## Support

For issues related to:
- **Garmin API**: Contact Garmin Developer Support
- **Webhook Implementation**: Check logs and error messages
- **Database Issues**: Verify schema and permissions
