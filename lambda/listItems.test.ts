import { handler } from './listItems';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
  const scanMock = jest.fn();

  return {
    DynamoDB: jest.fn(() => ({
      scan: scanMock
    })),
    scanMock
  };
});

const { scanMock } = require('@aws-sdk/client-dynamodb');

describe('Test List Items Handler', () => {
  beforeEach(() => {
    scanMock.mockClear();
  });

  it('happy-path - data returned from DynamoDB', async () => {
    const mockItems = [{ id: '1', value: 'item1' }];

    scanMock.mockResolvedValueOnce({
      Items: mockItems
    });

    const response = await handler({} as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockItems);
  });

  it('unhappy-path - DynamoDB errors', async () => {
    scanMock.mockRejectedValueOnce(new Error('DynamoDB error'));

    const response = await handler({} as any);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: "Internal Server Error" });
  });
});
