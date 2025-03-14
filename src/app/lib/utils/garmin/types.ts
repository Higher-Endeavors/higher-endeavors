declare module 'oauth-1.0a' {
  export interface OAuth {
    new (options: {
      consumer: {
        key: string;
        secret: string;
      };
      signature_method: string;
      hash_function: (base_string: string, key: string) => string;
    }): OAuth;

    authorize(request: {
      url: string;
      method: string;
      data?: Record<string, string>;
    }, token?: {
      key: string;
      secret: string;
    }): Record<string, string>;

    toHeader(authorization: Record<string, string>): Header;
  }

  export interface Header {
    Authorization: string;
    [key: string]: string;
  }

  export default OAuth;
}

export interface TokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
}

export interface AccessTokenResponse extends TokenResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  garminUserId: string;
}

export interface GarminTokens {
  accessToken: string;
  refreshToken: string;
  garminUserId: string;
}

export interface GarminUserTokens extends GarminTokens {
  permissions: string[];
  updated_at: Date;
} 