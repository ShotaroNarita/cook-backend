// tests/api.e2e.test.ts
import request from 'supertest';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { setupTestDatabase, teardownTestDatabase } from './setup';
import app from '../src/app';

// Override the environment variable for testing
process.env.TABLE_NAME = 'miomon-cook-test';
process.env.AWS_REGION = 'local';
process.env.AWS_ENDPOINT = 'http://localhost:8000';
process.env.AWS_ACCESS_KEY_ID = 'LOCAL';
process.env.AWS_SECRET_ACCESS_KEY = 'LOCAL';

describe('Recipe API E2E Tests', () => {
  let dbClient: DynamoDBClient;
  let createdRecipeId: string;

  // Setup test database before all tests
  beforeAll(async () => {
    // This requires DynamoDB Local to be running
    // You can start it using Docker:
    // docker run -p 8000:8000 amazon/dynamodb-local
    try {
      dbClient = await setupTestDatabase();
    } catch (error) {
      console.error('Failed to set up test database:', error);
      throw error;
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    if (dbClient) {
      await teardownTestDatabase(dbClient);
    }
  });

  it('should create a new recipe', async () => {
    const response = await request(app)
      .post('/recipes')
      .send({ title: 'E2E Test Recipe' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Recipe created successfully' });
  });

  it('should retrieve all recipes', async () => {
    const response = await request(app).get('/recipes');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Store the first recipe ID for later tests
    if (response.body.length > 0) {
      createdRecipeId = response.body[0].id;
    }
  });

  it('should retrieve a recipe by ID', async () => {
    // Skip if we don't have a recipe ID from previous test
    if (!createdRecipeId) {
      console.warn('No recipe ID available, skipping test');
      return;
    }

    const response = await request(app).get(`/recipes/${createdRecipeId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdRecipeId);
    expect(response.body).toHaveProperty('title', 'E2E Test Recipe');
  });

  it('should update a recipe', async () => {
    // Skip if we don't have a recipe ID from previous test
    if (!createdRecipeId) {
      console.warn('No recipe ID available, skipping test');
      return;
    }

    const response = await request(app)
      .put(`/recipes/${createdRecipeId}`)
      .send({ title: 'Updated E2E Test Recipe' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Recipe updated successfully' });

    // Verify the update
    const getResponse = await request(app).get(`/recipes/${createdRecipeId}`);
    expect(getResponse.body).toHaveProperty('title', 'Updated E2E Test Recipe');
  });

  it('should delete a recipe', async () => {
    // Skip if we don't have a recipe ID from previous test
    if (!createdRecipeId) {
      console.warn('No recipe ID available, skipping test');
      return;
    }

    const response = await request(app).delete(`/recipes/${createdRecipeId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Recipe deleted successfully' });

    // Verify the deletion
    const getResponse = await request(app).get(`/recipes/${createdRecipeId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 for non-existent recipe', async () => {
    const response = await request(app).get('/recipes/non-existent-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Recipe not found' });
  });
});