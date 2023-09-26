import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamodb = new DynamoDB({});
const table = 'token';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { filterParams } = JSON.parse(event.body);
    const tokenName = filterParams.token_name;
    if (!tokenName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing token_name query parameter" }),
      };
    }

    const params = {
      TableName: table,
      KeyConditionExpression: "token_name = :name",
      ExpressionAttributeValues: {
        ":name": { S: tokenName },
      },
    };

    const data = await dynamodb.query(params);

    if (data.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
