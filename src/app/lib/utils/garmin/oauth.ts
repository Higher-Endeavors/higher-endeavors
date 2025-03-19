import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { GARMIN_CONFIG } from './config';
import { TokenResponse, AccessTokenResponse, GarminTokens } from './types';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { requestTokenStore } from './requestTokenStore';

export const garminOAuth = {
  oauth: new OAuth({
    consumer: {
      key: process.env.GARMIN_CONSUMER_KEY || '',
      secret: process.env.GARMIN_CONSUMER_SECRET || ''
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    }
  }),

  async getRequestToken(callbackUrl: string): Promise<TokenResponse> {
    const authHeader = this.oauth.toHeader(this.oauth.authorize({
      url: GARMIN_CONFIG.REQUEST_TOKEN_URL,
      method: 'POST',
      data: {
        oauth_callback: callbackUrl
      }
    }));

    const response = await fetch(GARMIN_CONFIG.REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: this.convertHeader(authHeader)
    });

    if (!response.ok) {
      throw new Error(`Failed to get request token: ${response.statusText}`);
    }

    const text = await response.text();
    const tokens = this.parseTokenResponse(text);
    
    // Store the request token and secret
    requestTokenStore.store(tokens.oauth_token, tokens.oauth_token_secret);
    
    return tokens;
  },

  async getAccessToken(oauth_token: string, oauth_verifier: string): Promise<AccessTokenResponse> {
    // Get the stored request token secret
    const stored = requestTokenStore.get(oauth_token);
    if (!stored) {
      throw new Error('Invalid or expired request token');
    }

    const authHeader = this.oauth.toHeader(this.oauth.authorize({
      url: GARMIN_CONFIG.ACCESS_TOKEN_URL,
      method: 'POST',
      data: { oauth_verifier }
    }, {
      key: oauth_token,
      secret: stored.secret
    }));

    const response = await fetch(GARMIN_CONFIG.ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        ...this.convertHeader(authHeader),
        'oauth_verifier': oauth_verifier
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    // Remove the used request token
    requestTokenStore.remove(oauth_token);

    const text = await response.text();
    const tokens = this.parseTokenResponse(text);
    const userId = await this.getUserId(tokens);

    return {
      ...tokens,
      userId,
      accessToken: tokens.oauth_token,
      refreshToken: tokens.oauth_token_secret,
      garminUserId: userId
    };
  },

  async getUserId(tokens: TokenResponse): Promise<string> {
    const authHeader = this.oauth.toHeader(this.oauth.authorize({
      url: GARMIN_CONFIG.USER_ID_URL,
      method: 'GET'
    }, {
      key: tokens.oauth_token,
      secret: tokens.oauth_token_secret
    }));

    const response = await fetch(GARMIN_CONFIG.USER_ID_URL, {
      headers: this.convertHeader(authHeader)
    });

    if (!response.ok) {
      throw new Error(`Failed to get user ID: ${response.statusText}`);
    }

    const data = await response.json();
    return data.userId;
  },

  async getUserPermissions(accessToken: string): Promise<string[]> {
    const authHeader = this.oauth.toHeader(this.oauth.authorize({
      url: GARMIN_CONFIG.PERMISSIONS_URL,
      method: 'GET'
    }, {
      key: accessToken,
      secret: ''
    }));

    const response = await fetch(GARMIN_CONFIG.PERMISSIONS_URL, {
      headers: this.convertHeader(authHeader)
    });

    if (!response.ok) {
      throw new Error(`Failed to get user permissions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.permissions || [];
  },

  parseTokenResponse(response: string): TokenResponse {
    const params = new URLSearchParams(response);
    return {
      oauth_token: params.get('oauth_token') || '',
      oauth_token_secret: params.get('oauth_token_secret') || ''
    };
  },

  async getUserGarminTokens(userId: string | number): Promise<GarminTokens | null> {
    try {
      const result = await SingleQuery(
        `SELECT garmin_user_id, oauth_token, oauth_token_secret 
         FROM user_garmin_tokens 
         WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as GarminTokens;
    } catch (error) {
      console.error('Error fetching Garmin tokens:', error);
      return null;
    }
  },

  async makeAuthenticatedRequest(url: string, tokens: GarminTokens, options: RequestInit = {}) {
    const authHeader = this.oauth.toHeader(this.oauth.authorize({
      url,
      method: options.method || 'GET'
    }, {
      key: tokens.accessToken,
      secret: ''
    }));

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.convertHeader(authHeader),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response;
  },

  convertHeader(header: OAuth.Header): Record<string, string> {
    return Object.fromEntries(
      Object.entries(header).map(([k, v]) => [k.toLowerCase(), v])
    );
  }
};