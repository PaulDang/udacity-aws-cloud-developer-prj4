import middy from "@middy/core";
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TodoBusinessService } from "../businesses/todo-business.service";
import { getUserId } from "../../services/auth.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const service: TodoBusinessService = new TodoBusinessService();

    try {
        var items = await service.getAll(userId);

        return {
            statusCode: 200,
            body: JSON.stringify({ items }),
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

handler.use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));