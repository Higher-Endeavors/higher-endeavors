// Mock database adapter
jest.mock('lib/dbAdapter', () => ({
  SingleQuery: jest.fn(),
}));

import { GET } from 'api/tier-continuum/route';
import { NextRequest } from 'next/server';

// Get the mock function
const mockSingleQuery = require('lib/dbAdapter').SingleQuery;

describe('/api/tier-continuum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns tier continuum data successfully', async () => {
      const mockData = [
        { tier_continuum_id: 1, tier_continuum_name: 'Beginner' },
        { tier_continuum_id: 2, tier_continuum_name: 'Intermediate' },
        { tier_continuum_id: 3, tier_continuum_name: 'Advanced' },
      ];

      mockSingleQuery.mockResolvedValue({
        rows: mockData,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tiers).toEqual(mockData);
      expect(mockSingleQuery).toHaveBeenCalledWith(
        'SELECT tier_continuum_id, tier_continuum_name FROM highend_tier_continuum ORDER BY tier_continuum_id'
      );
    });

    it('handles database errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSingleQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch tier continuum data');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching tier continuum data:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles empty result set', async () => {
      mockSingleQuery.mockResolvedValue({
        rows: [],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tiers).toEqual([]);
    });

    it('handles null result from database', async () => {
      mockSingleQuery.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch tier continuum data');
    });
  });
});
