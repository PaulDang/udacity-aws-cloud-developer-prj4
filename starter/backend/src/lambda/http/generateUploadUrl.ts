import middy from "@middy/core";
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TodoBusinessService } from "../businesses/todo-business.service";
import { getUserId } from "../../services/auth.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;
    const service: TodoBusinessService = new TodoBusinessService();
    
    const url = await service.createAttachmentUrl(userId, todoId);
    return {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        statusCode: 201,
        body: JSON.stringify({ uploadUrl: url }),
    };
});

handler.use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));