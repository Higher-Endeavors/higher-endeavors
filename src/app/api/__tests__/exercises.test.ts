import { GET } from '../exercises/route';
import { NextRequest } from 'next/server';

// Mock database adapter
const mockSingleQuery = jest.fn();

jest.mock('@/app/lib/dbAdapter', () => ({
  SingleQuery: (...args: any[]) => mockSingleQuery(...args),
}));

// Mock server logger
jest.mock('@/app/lib/logging/logger.server', () => ({
  serverLogger: {
    error: jest.fn(),
  },
}));

describe('/api/exercises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns all exercises when no ID is provided', async () => {
      const mockExercises = [
        {
          exercise_library_id: 1,
          name: 'Push-up',
          source: 'library',
          exercise_family_id: 1,
          exercise_family: 'Upper Body',
          body_region: 'Chest',
          muscle_group: 'Pectorals',
          movement_pattern: 'Push',
          movement_plane: 'Sagittal',
          equipment: 'Bodyweight',
          laterality: 'Bilateral',
          difficulty: 'Beginner',
        },
        {
          exercise_library_id: 2,
          name: 'Squat',
          source: 'library',
          exercise_family_id: 2,
          exercise_family: 'Lower Body',
          body_region: 'Legs',
          muscle_group: 'Quadriceps',
          movement_pattern: 'Squat',
          movement_plane: 'Sagittal',
          equipment: 'Bodyweight',
          laterality: 'Bilateral',
          difficulty: 'Beginner',
        },
      ];

      mockSingleQuery.mockResolvedValue({
        rows: mockExercises,
      });

      const request = new NextRequest('http://localhost:3000/api/exercises');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockExercises);
      expect(mockSingleQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        []
      );
    });

    it('returns specific exercise when ID is provided', async () => {
      const mockExercise = [
        {
          exercise_library_id: 1,
          name: 'Push-up',
          source: 'library',
          exercise_family_id: 1,
          exercise_family: 'Upper Body',
          body_region: 'Chest',
          muscle_group: 'Pectorals',
          movement_pattern: 'Push',
          movement_plane: 'Sagittal',
          equipment: 'Bodyweight',
          laterality: 'Bilateral',
          difficulty: 'Beginner',
        },
      ];

      mockSingleQuery.mockResolvedValue({
        rows: mockExercise,
      });

      const request = new NextRequest('http://localhost:3000/api/exercises?id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockExercise);
      expect(mockSingleQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE el.id = $1'),
        ['1']
      );
    });

    it('handles empty result set', async () => {
      mockSingleQuery.mockResolvedValue({
        rows: [],
      });

      const request = new NextRequest('http://localhost:3000/api/exercises');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('handles null result from database', async () => {
      mockSingleQuery.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/exercises');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('handles database errors gracefully', async () => {
      mockSingleQuery.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/exercises');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch exercises');
      expect(mockServerLogger.error).toHaveBeenCalledWith(
        'Error fetching exercises',
        expect.any(Error)
      );
    });

    it('handles multiple query parameters correctly', async () => {
      const mockExercise = [
        {
          exercise_library_id: 1,
          name: 'Push-up',
          source: 'library',
        },
      ];

      mockSingleQuery.mockResolvedValue({
        rows: mockExercise,
      });

      const request = new NextRequest('http://localhost:3000/api/exercises?id=1&category=strength');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockExercise);
      // Should only use the 'id' parameter, ignoring others
      expect(mockSingleQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE el.id = $1'),
        ['1']
      );
    });

    it('handles invalid ID parameter', async () => {
      const mockExercise = [];

      mockSingleQuery.mockResolvedValue({
        rows: mockExercise,
      });

      const request = new NextRequest('http://localhost:3000/api/exercises?id=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(mockSingleQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE el.id = $1'),
        ['invalid']
      );
    });
  });
});
