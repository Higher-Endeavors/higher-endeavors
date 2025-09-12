# Garmin Connect Integration

This directory contains the Garmin Connect OAuth2 PKCE integration for the Higher Endeavors application.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Garmin Connect OAuth2 Configuration
# Get these from https://developer.garmin.com/
GARMIN_CONNECT_CLIENT_ID=your_garmin_client_id_here
GARMIN_CONNECT_CLIENT_SECRET=your_garmin_client_secret_here
GARMIN_REDIRECT_URI=http://localhost:3000/api/garmin-connect/callback

# For production, update the redirect URI to your production domain:
# GARMIN_REDIRECT_URI=https://yourdomain.com/api/garmin-connect/callback
```

### 2. Database Migration

Run the database migration to add the Garmin Connect settings column:

```sql
-- Add Garmin Connect settings column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN garmin_connect_settings json DEFAULT NULL;
```

### 3. Garmin Developer Account

1. Go to [Garmin Developer Portal](https://developer.garmin.com/)
2. Create a new application
3. Configure the redirect URI to match your environment
4. Copy the Client ID and Client Secret to your environment variables

## Features Implemented

### Authorization Flow
- OAuth2 PKCE implementation following Garmin's specifications
- Secure state parameter handling
- Automatic token exchange and user data retrieval

### User Interface
- Integration in User Settings > General tab
- Connection status display
- Permission and sync information
- Easy connect/disconnect functionality

### Data Storage
- Secure token storage in database
- Token expiration tracking
- User permission management
- Connection status persistence

## API Endpoints

- `GET /api/garmin-connect/auth` - Initiates OAuth flow
- `GET /api/garmin-connect/callback` - Handles OAuth callback
- `POST /api/garmin-connect/disconnect` - Disconnects Garmin account

## Next Steps

The authorization functionality is now complete. The next phase would involve:

1. Data fetching from Garmin APIs
2. Activity synchronization
3. Health metrics integration
4. Automatic token refresh
5. Error handling and retry logic

## Security Notes

- Tokens are stored securely in the database
- PKCE implementation prevents code interception attacks
- State parameter prevents CSRF attacks
- Proper token expiration handling
- Secure disconnect functionality that removes Garmin registration
