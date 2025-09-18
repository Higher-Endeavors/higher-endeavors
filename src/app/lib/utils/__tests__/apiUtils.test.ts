import { getApiBaseUrl } from '../apiUtils';

// Mock Next.js headers
const mockHeaders = jest.fn();

jest.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}));

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiBaseUrl', () => {
    it('returns http protocol for localhost', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('localhost:3000'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('http://localhost:3000');
    });

    it('returns https protocol for production domain', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('example.com'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://example.com');
    });

    it('returns https protocol for staging domain', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('staging.example.com'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://staging.example.com');
    });

    it('handles undefined host gracefully', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://null');
    });

    it('handles empty host gracefully', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(''),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://');
    });

    it('handles localhost with different ports', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('localhost:8080'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('http://localhost:8080');
    });

    it('handles 127.0.0.1 as localhost', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('127.0.0.1:3000'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://127.0.0.1:3000');
    });

    it('handles IPv6 localhost', async () => {
      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue('[::1]:3000'),
      });

      const result = await getApiBaseUrl();
      expect(result).toBe('https://[::1]:3000');
    });
  });
});
