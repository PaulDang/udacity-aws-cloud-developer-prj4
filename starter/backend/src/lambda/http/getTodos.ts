import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(event);

    try {
        return {
            statusCode: 200,
            body: JSON.stringify({ items: [] }),
        };
    } catch (error) {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            statusCode: 500,
            body: JSON.stringify({ error: error }),
        };
    }
});