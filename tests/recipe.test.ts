import { jest } from '@jest/globals';

// Mock DynamoDB clients
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    // Empty mock implementation
  })),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockImplementation(() => ({
      send: jest.fn()
    })),
  },
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
  GetCommand: jest.fn(),
}));

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-123';
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn().mockReturnValue(mockUUID),
};

import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecipeById,
} from '../src/recipe';

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

describe('Recipe DB Functions', () => {
  const mockSend = jest.fn();
  
  beforeEach(() => {
    // Reset mock implementation and clear calls before each test
    jest.clearAllMocks();
    
    // Set up the mock send function for each test
    (DynamoDBDocumentClient.from() as any).send = mockSend;
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      // Arrange
      mockSend.mockResolvedValue({});
      const title = 'Test Recipe';

      // Act
      const result = await createRecipe(title);

      // Assert
      expect(result).toBe(mockUUID);
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'miomon-cook',
        Item: {
          kind: 'recipe',
          id: mockUUID,
          title,
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if DynamoDB operation fails', async () => {
      // Arrange
      const mockError = new Error('DB error');
      mockSend.mockRejectedValue(mockError);
      const title = 'Test Recipe';

      // Act & Assert
      await expect(createRecipe(title)).rejects.toThrow('DB error');
      expect(PutCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateRecipe', () => {
    it('should update a recipe successfully', async () => {
      // Arrange
      mockSend.mockResolvedValue({});
      const id = 'test-id';
      const title = 'Updated Recipe';

      // Act
      await updateRecipe(id, title);

      // Assert
      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: 'miomon-cook',
        Key: {
          kind: 'recipe',
          id,
        },
        UpdateExpression: 'set title = :title',
        ExpressionAttributeValues: {
          ':title': title,
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if DynamoDB operation fails', async () => {
      // Arrange
      const mockError = new Error('DB error');
      mockSend.mockRejectedValue(mockError);
      const id = 'test-id';
      const title = 'Updated Recipe';

      // Act & Assert
      await expect(updateRecipe(id, title)).rejects.toThrow('DB error');
      expect(UpdateCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe successfully', async () => {
      // Arrange
      mockSend.mockResolvedValue({});
      const id = 'test-id';

      // Act
      await deleteRecipe(id);

      // Assert
      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: 'miomon-cook',
        Key: {
          kind: 'recipe',
          id,
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if DynamoDB operation fails', async () => {
      // Arrange
      const mockError = new Error('DB error');
      mockSend.mockRejectedValue(mockError);
      const id = 'test-id';

      // Act & Assert
      await expect(deleteRecipe(id)).rejects.toThrow('DB error');
      expect(DeleteCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchRecipes', () => {
    it('should return recipes successfully', async () => {
      // Arrange
      const mockRecipes = [
        { kind: 'recipe', id: '1', title: 'Recipe 1' },
        { kind: 'recipe', id: '2', title: 'Recipe 2' },
      ];
      mockSend.mockResolvedValue({ Items: mockRecipes });

      // Act
      const result = await searchRecipes();

      // Assert
      expect(result).toEqual(mockRecipes);
      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: 'miomon-cook',
        KeyConditionExpression: 'kind = :kind',
        ExpressionAttributeValues: {
          ':kind': 'recipe',
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no items found', async () => {
      // Arrange
      mockSend.mockResolvedValue({});

      // Act
      const result = await searchRecipes();

      // Assert
      expect(result).toEqual([]);
      expect(QueryCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if DynamoDB operation fails', async () => {
      // Arrange
      const mockError = new Error('DB error');
      mockSend.mockRejectedValue(mockError);

      // Act & Assert
      await expect(searchRecipes()).rejects.toThrow('DB error');
      expect(QueryCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecipeById', () => {
    it('should return a recipe by id successfully', async () => {
      // Arrange
      const mockRecipe = { kind: 'recipe', id: 'test-id', title: 'Test Recipe' };
      mockSend.mockResolvedValue({ Item: mockRecipe });
      const id = 'test-id';

      // Act
      const result = await getRecipeById(id);

      // Assert
      expect(result).toEqual(mockRecipe);
      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'miomon-cook',
        Key: {
          kind: 'recipe',
          id,
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return null if recipe not found', async () => {
      // Arrange
      mockSend.mockResolvedValue({});
      const id = 'nonexistent-id';

      // Act
      const result = await getRecipeById(id);

      // Assert
      expect(result).toBeNull();
      expect(GetCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if DynamoDB operation fails', async () => {
      // Arrange
      const mockError = new Error('DB error');
      mockSend.mockRejectedValue(mockError);
      const id = 'test-id';

      // Act & Assert
      await expect(getRecipeById(id)).rejects.toThrow('DB error');
      expect(GetCommand).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});