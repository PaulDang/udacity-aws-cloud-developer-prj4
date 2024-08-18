import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { UpdateTodoRequestModel } from "../../models/update-todo-request.model";
import { TodoBusinessService } from "../businesses/todo-business.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = "1";
    const updateRequest: UpdateTodoRequestModel = JSON.parse(event.body);
    const todoId = event.pathParameters.todoId;
    const service: TodoBusinessService = new TodoBusinessService();

    try {
        const item = await service.update(userId, todoId, updateRequest);

        return {
            statusCode: 200,
            body: JSON.stringify({ item }),
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