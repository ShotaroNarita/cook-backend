// tests/setup.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  CreateTableCommand,
  DeleteTableCommand
} from '@aws-sdk/lib-dynamodb';

// For E2E testing with local DynamoDB
export const setupTestDatabase = async () => {
  // Using DynamoDB Local for testing
  const client = new DynamoDBClient({
    region: 'local',
    endpoint: 'http://localhost:8000',  // DynamoDB Local endpoint
    credentials: {
      accessKeyId: 'LOCAL',
      secretAccessKey: 'LOCAL',
    },
  });

  const docClient = DynamoDBDocumentClient.from(client);

  try {
    // Delete the table if it exists (cleanup)
    try {
      await docClient.send(new DeleteTableCommand({
        TableName: 'miomon-cook-test',
      }));
      console.log('Test table deleted');
    } catch (err) {
      // Table might not exist, ignore error
    }

    // Create a new table for testing
    await docClient.send(new CreateTableCommand({
      TableName: 'miomon-cook-test',
      KeySchema: [
        { AttributeName: 'kind', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'kind', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }));

    console.log('Test table created');
    return client;
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

export const teardownTestDatabase = async (client: DynamoDBClient) => {
  try {
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Clean up by deleting the test table
    await docClient.send(new DeleteTableCommand({
      TableName: 'miomon-cook-test',
    }));
    
    console.log('Test table deleted');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
};