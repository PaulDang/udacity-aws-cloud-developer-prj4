import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItemModel } from "../models/todo-item.model";
import { log } from "./log.service";

import * as AWS from "aws-sdk";

export class TodoService {
    private readonly _todosTables: string = process.env.TODOS_TABLE;
    private readonly _docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();

    public async getAll(userId: string): Promise<TodoItemModel[]> {
        log("Call function getall");
        const resuslt = await this._docClient
            .query({
                TableName: this._todosTables,
                KeyConditionExpression: "createdBy = :createdBy",
                ExpressionAttributeValues: {
                    ":createdBy": userId,
                },
            })
            .promise();
        return resuslt.Items as TodoItemModel[];
    }
}