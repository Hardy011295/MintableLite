import { DynamoDB } from "@aws-sdk/client-dynamodb"; 
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamodb = new DynamoDB({});
const table = 'token'

function validate(token_name: string, token_description: string, token_status: string, attributes: string): string {
  let message = '';
  if (token_name === '') {
    message = 'Missing token_name';
  } else if (token_description === '') {
    message = 'Missing token_description';
  } else if (token_status === '') {
    message = 'Missing token_status';
  } else if (attributes === '') {
    message = 'Missing attributes';
  } else {
    return '';
  }
  return message;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { token_name, token_description, token_status, attributes } = JSON.parse(event.body);
    const err = validate(token_name, token_description, token_status, attributes)
    if (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: err }),
      };
    }
    
  
    const itemData = {
      token_name: token_name,
      token_description: token_description,
      token_status: token_status,
      attributes: attributes,
    };

    const issued_timestamp = Math.floor(Date.now() / 1000).toString();
    const params = {
      TableName: table,
      Item: {
        token_name: { S: itemData.token_name },
        token_description: { S: itemData.token_description },
        issued_timestamp: { N: issued_timestamp },
        token_status: { S: itemData.token_status },
        attributes: { S: itemData.attributes },
      },
    };
    
    await dynamodb.putItem(params);
    
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Minted successfully' }),
    };
  } catch (error) {
    console.error(error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
