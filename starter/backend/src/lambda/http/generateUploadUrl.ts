import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TodoBusinessService } from "../businesses/todo-business.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = "1";
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