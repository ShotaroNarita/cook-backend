import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app';

// Mock the recipe module
jest.mock('../src/recipe', () => ({
  createRecipe: jest.fn(),
  searchRecipes: jest.fn(),
  updateRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
  getRecipeById: jest.fn(),
}));

// Import the mocked recipe functions
import {
  createRecipe,
  searchRecipes,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
} from '../src/recipe';

describe('Recipe API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello, TypeScript + Express!' });
    });
  });

  describe('POST /recipes', () => {
    it('should create a new recipe', async () => {
      // Arrange
      const mockReq = { title: 'Test Recipe' };
      (createRecipe as jest.Mock).mockResolvedValue('mock-id-123');

      // Act
      const response = await request(app)
        .post('/recipes')
        .send(mockReq)
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Recipe created successfully' });
      expect(createRecipe).toHaveBeenCalledWith('Test Recipe');
    });

    it('should return 400 if title is missing', async () => {
      // Act
      const response = await request(app)
        .post('/recipes')
        .send({})
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title is required' });
      expect(createRecipe).not.toHaveBeenCalled();
    });
  });

  describe('GET /recipes', () => {
    it('should return all recipes', async () => {
      // Arrange
      const mockRecipes = [
        { kind: 'recipe', id: '1', title: 'Recipe 1' },
        { kind: 'recipe', id: '2', title: 'Recipe 2' },
      ];
      (searchRecipes as jest.Mock).mockResolvedValue(mockRecipes);

      // Act
      const response = await request(app).get('/recipes');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecipes);
      expect(searchRecipes).toHaveBeenCalled();
    });
  });

  describe('GET /recipes/:id', () => {
    it('should return a recipe by id', async () => {
      // Arrange
      const mockRecipe = { kind: 'recipe', id: 'test-id', title: 'Test Recipe' };
      (getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);

      // Act
      const response = await request(app).get('/recipes/test-id');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecipe);
      expect(getRecipeById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 if recipe not found', async () => {
      // Arrange
      (getRecipeById as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app).get('/recipes/nonexistent-id');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Recipe not found' });
      expect(getRecipeById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('PUT /recipes/:id', () => {
    it('should update a recipe', async () => {
      // Arrange
      const mockRecipe = { kind: 'recipe', id: 'test-id', title: 'Old Title' };
      (getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);
      (updateRecipe as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .put('/recipes/test-id')
        .send({ title: 'Updated Title' })
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Recipe updated successfully' });
      expect(getRecipeById).toHaveBeenCalledWith('test-id');
      expect(updateRecipe).toHaveBeenCalledWith('test-id', 'Updated Title');
    });

    it('should return 400 if title is missing', async () => {
      // Act
      const response = await request(app)
        .put('/recipes/test-id')
        .send({})
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title is required' });
      expect(updateRecipe).not.toHaveBeenCalled();
    });

    it('should return 404 if recipe not found', async () => {
      // Arrange
      (getRecipeById as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/recipes/nonexistent-id')
        .send({ title: 'Updated Title' })
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Recipe not found' });
      expect(updateRecipe).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /recipes/:id', () => {
    it('should delete a recipe', async () => {
      // Arrange
      const mockRecipe = { kind: 'recipe', id: 'test-id', title: 'Test Recipe' };
      (getRecipeById as jest.Mock).mockResolvedValue(mockRecipe);
      (deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app).delete('/recipes/test-id');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Recipe deleted successfully' });
      expect(getRecipeById).toHaveBeenCalledWith('test-id');
      expect(deleteRecipe).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 if recipe not found', async () => {
      // Arrange
      (getRecipeById as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app).delete('/recipes/nonexistent-id');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Recipe not found' });
      expect(deleteRecipe).not.toHaveBeenCalled();
    });
  });
});