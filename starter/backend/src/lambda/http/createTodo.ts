import middy from "@middy/core";
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateTodoRequestModel } from "../../models/create-todo-request.model";
import { TodoBusinessService } from "../businesses/todo-business.service";
import { getUserId } from "../../services/auth.service";

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
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

handler.use(httpErrorHandler())
    .use(cors({
        credentials: true
    }));