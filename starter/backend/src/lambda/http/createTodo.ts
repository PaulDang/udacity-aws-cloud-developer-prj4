import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateTodoRequestModel } from "../../models/create-todo-request.model";
import { TodoBusinessService } from "../businesses/todo-business.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = "1";
    const requestTodo: CreateTodoRequestModel = JSON.parse(event.body);
    const service: TodoBusinessService = new TodoBusinessService();

    try {
        const newItem = await service.create(userId, requestTodo);

        return {
            statusCode: 200,
            body: JSON.stringify({ item: newItem }),
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