interface RateLimitRule {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
}

interface RateLimitState {
  requests: number;
  windowStart: number;
}

export class GarminRateLimiter {
  private limits: Map<string, RateLimitState> = new Map();
  
  // Garmin's rate limits (these should be adjusted based on your tier/limits)
  private rules: Record<string, RateLimitRule> = {
    default: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100     // 100 requests per minute
    },
    health: {
      windowMs: 60 * 1000,
      maxRequests: 50      // 50 health requests per minute
    },
    activity: {
      windowMs: 60 * 1000,
      maxRequests: 50      // 50 activity requests per minute
    }
  };

  async checkRateLimit(endpoint: string): Promise<boolean> {
    const now = Date.now();
    const rule = this.rules[endpoint] || this.rules.default;
    const state = this.limits.get(endpoint) || { requests: 0, windowStart: now };

    // Reset window if it's expired
    if (now - state.windowStart >= rule.windowMs) {
      state.requests = 0;
      state.windowStart = now;
    }

    // Check if we're over the limit
    if (state.requests >= rule.maxRequests) {
      const waitTime = rule.windowMs - (now - state.windowStart);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkRateLimit(endpoint);
      }
    }

    // Update state
    state.requests++;
    this.limits.set(endpoint, state);
    
    return true;
  }

  async withRateLimit<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    await this.checkRateLimit(endpoint);
    return fn();
  }

  getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const rule = this.rules[endpoint] || this.rules.default;
    const state = this.limits.get(endpoint);

    if (!state) {
      return rule.maxRequests;
    }

    if (now - state.windowStart >= rule.windowMs) {
      return rule.maxRequests;
    }

    return Math.max(0, rule.maxRequests - state.requests);
  }

  getResetTime(endpoint: string): number {
    const now = Date.now();
    const state = this.limits.get(endpoint);

    if (!state) {
      return 0;
    }

    const rule = this.rules[endpoint] || this.rules.default;
    const resetTime = state.windowStart + rule.windowMs - now;
    
    return Math.max(0, resetTime);
  }
} 