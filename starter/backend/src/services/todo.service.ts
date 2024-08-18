import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItemModel } from "../models/todo-item.model";
import { UpdateTodoRequestModel } from "../models/update-todo-request.model";
import * as AWS from "aws-sdk";
import * as AWSX from "aws-xray-sdk-core";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDB({});
//const dynamoDBXRay = AWSX.captureAWSClient(dynamoDB);

const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET;

export class TodoService {
    private readonly _todosTables: string = process.env.TODOS_TABLE;
    private readonly _docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
    private readonly _S3 = new AWS.S3({ signatureVersion: "v4" });
    private readonly _bucketName: string = s3_bucket_name;

    public async getAll(userId: string): Promise<TodoItemModel[]> {
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

    public async create(item: TodoItemModel): Promise<TodoItemModel> {
        await this._docClient
            .put({
                TableName: this._todosTables,
                Item: item,
            })
            .promise();
        return item as TodoItemModel;
    }

    public async update(userId: string, todoId: string, item: UpdateTodoRequestModel): Promise<TodoItemModel> {
        try {
            await this._docClient
                .update({
                    TableName: this._todosTables,
                    Key: {
                        createdBy: userId,
                        todoId,
                    },
                    UpdateExpression:
                        "set #name = :name, #dueDate = :dueDate, #done = :done",
                    ExpressionAttributeNames: {
                        "#name": "name",
                        "#dueDate": "dueDate",
                        "#done": "done",
                    },
                    ExpressionAttributeValues: {
                        ":name": item.name,
                        ":dueDate": item.dueDate,
                        ":done": item.done,
                    },
                    ReturnValues: "UPDATED_NEW",
                })
                .promise();
        } catch (error) {
            throw Error(error);
        }

        return item as TodoItemModel;
    }

    public async delete(userId: string, todoId: string): Promise<String> {
        try {
            await this._docClient
                .delete({
                    TableName: this._todosTables,
                    Key: {
                        createdBy: userId,
                        todoId,
                    },
                })
                .promise();
            return "success";
        } catch (error) {
            throw Error(error);
        }
    }

    public async getUploadUrl(todoId: string, userId: string): Promise<string> {
        const uploadUrl = this._S3.getSignedUrl("putObject", {
            Bucket: this._bucketName,
            Key: todoId,
            Expires: Number(300),
        });

        await this._docClient
            .update({
                TableName: this._todosTables,
                Key: {
                    createdBy: userId,
                    todoId,
                },
                UpdateExpression: "set attachmentUrl = :URL",
                ExpressionAttributeValues: {
                    ":URL": uploadUrl.split("?")[0],
                },
                ReturnValues: "UPDATED_NEW",
            })
            .promise();

        return uploadUrl;
    }
}