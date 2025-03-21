// Simple in-memory store for development
export const requestTokenStore = {
  tokens: new Map<string, { secret: string, timestamp: number }>(),
  
  store(token: string, secret: string) {
    // Log for debugging in development only
    console.log(`Storing request token: ${token}`);
    this.tokens.set(token, { secret, timestamp: Date.now() });
  },
  
  get(token: string) {
    const stored = this.tokens.get(token);
    if (!stored) {
      console.log(`Token not found: ${token}`);
      return null;
    }
    
    // Check if token is expired (10 minutes)
    if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
      console.log(`Token expired: ${token}`);
      this.tokens.delete(token);
      return null;
    }
    
    return { secret: stored.secret };
  },
  
  remove(token: string) {
    this.tokens.delete(token);
  }
};