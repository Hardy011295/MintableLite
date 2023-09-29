import { handler } from './mintItem';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
  const putItemMock = jest.fn();
  return {
    DynamoDB: jest.fn(() => ({
      putItem: putItemMock
    })),
    putItemMock
  };
});

const { putItemMock } = require('@aws-sdk/client-dynamodb');

describe('Mint Token Lambda Handler', () => {
  beforeEach(() => {
    putItemMock.mockClear();
  });

  it('happy-path - should return 201 after minting successfully', async () => {
    const event = {
      body: JSON.stringify({
        token_name: 'name',
        token_description: 'desc',
        token_status: 'status',
        attributes: 'attr'
      })
    };

    putItemMock.mockResolvedValueOnce({});

    const response = await handler(event as any);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ message: 'Minted successfully' });
  });

  it('unhappy-path - should return 400 if token_name is missing', async () => {
    const event = {
      body: JSON.stringify({
        token_description: 'desc',
        token_status: 'status',
        attributes: 'attr'
      })
    };

    const response = await handler(event as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing token_name' });
  });

  it('unhappy-path - should return 400 if token_description is missing', async () => {
    const event = {
      body: JSON.stringify({
        token_name: 'test',
        token_status: 'status',
        attributes: 'attr'
      })
    };

    const response = await handler(event as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing token_description' });
  });

  it('unhappy-path - should return 400 if token_status is missing', async () => {
    const event = {
      body: JSON.stringify({
        token_name: 'test',
        token_description: 'test',
        attributes: 'attr'
      })
    };

    const response = await handler(event as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing token_status' });
  });

  it('unhappy-path - should return 400 if attributes is missing', async () => {
    const event = {
      body: JSON.stringify({
        token_name: 'test',
        token_description: 'test',
        token_status: 'test',
      })
    };

    const response = await handler(event as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Missing attributes' });
  });

  it('unhappy-path -  DynamoDB errors', async () => {
    const event = {
      body: JSON.stringify({
        token_name: 'name',
        token_description: 'desc',
        token_status: 'status',
        attributes: 'attr'
      })
    };

    putItemMock.mockRejectedValueOnce(new Error('DynamoDB error'));

    const response = await handler(event as any);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Internal Server Error' });
  });
});
