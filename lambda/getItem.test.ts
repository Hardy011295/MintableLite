import { handler } from './getItem';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
  const queryMock = jest.fn();

  return {
    DynamoDB: jest.fn(() => ({
      query: queryMock
    })),
    queryMock
  };
});

const { queryMock } = require('@aws-sdk/client-dynamodb');

describe('Test Get Item Handler', () => {
  beforeEach(() => {
    queryMock.mockClear();
  });

  it('happy-path - return data from DynamoDB', async () => {
    const mockItem = { token_name: { S: 'sampleToken' }, value: { S: 'sampleValue' } };
    const event = {
      body: JSON.stringify({
        filterParams: {
          token_name: 'sampleToken'
        }
      })
    };
    queryMock.mockResolvedValueOnce({ Items: [mockItem] });

    const response = await handler(event as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockItem);
  });

  it('unhappy-path - should return 400 if token_name is not provided', async () => {
    const event = {
      body: JSON.stringify({
        filterParams: {}
      })
    };

    const response = await handler(event as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: "Missing token_name query parameter" });
  });

  it('unhappy-path - should return 404 if item is not found', async () => {
    const event = {
      body: JSON.stringify({
        filterParams: {
          token_name: 'nonexistent'
        }
      })
    };
    queryMock.mockResolvedValueOnce({ Items: [] });

    const response = await handler(event as any);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ error: "Item not found" });
  });

  it('unhappy-path - should handle DynamoDB errors', async () => {
    const event = {
      body: JSON.stringify({
        filterParams: {
          token_name: 'errorToken'
        }
      })
    };
    queryMock.mockRejectedValueOnce(new Error('DynamoDB error'));

    const response = await handler(event as any);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: "Internal Server Error" });
  });
});
