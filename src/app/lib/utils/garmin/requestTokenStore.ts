interface StoredToken {
  token: string;
  secret: string;
  timestamp: number;
}

// Store tokens with a 10-minute expiration (same as Garmin's timestamp requirement)
const TOKEN_EXPIRATION = 10 * 60 * 1000; // 10 minutes in milliseconds

class RequestTokenStore {
  private tokens: Map<string, StoredToken> = new Map();

  store(token: string, secret: string): void {
    this.tokens.set(token, {
      token,
      secret,
      timestamp: Date.now()
    });

    // Clean up expired tokens
    this.cleanup();
  }

  get(token: string): { secret: string } | null {
    const stored = this.tokens.get(token);
    if (!stored) return null;

    // Check if token has expired
    if (Date.now() - stored.timestamp > TOKEN_EXPIRATION) {
      this.tokens.delete(token);
      return null;
    }

    return { secret: stored.secret };
  }

  remove(token: string): void {
    this.tokens.delete(token);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, stored] of this.tokens.entries()) {
      if (now - stored.timestamp > TOKEN_EXPIRATION) {
        this.tokens.delete(token);
      }
    }
  }
}

export const requestTokenStore = new RequestTokenStore(); 