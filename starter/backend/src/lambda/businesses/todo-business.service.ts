import { CreateTodoRequestModel } from "../../models/create-todo-request.model";
import { TodoItemModel } from "../../models/todo-item.model";
import { UpdateTodoRequestModel } from "../../models/update-todo-request.model";
import { TodoService } from "../../services/todo.service";
import { createLogger } from "../../utils/logger";
import * as uuid from "uuid";

const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET;

export class TodoBusinessService {
    private readonly _logger = createLogger("Todo Business Service");
    private readonly _todoService: TodoService = new TodoService();
    private readonly _bucketName: string = s3_bucket_name;

    public async create(userId: string, requestTodo: CreateTodoRequestModel): Promise<TodoItemModel> {
        this._logger.info(`Create todo for user '${userId}'`);

        const todoItem: TodoItemModel = new TodoItemModel();

        todoItem.todoId = uuid.v4();
        todoItem.createdBy = userId;
        todoItem.createdAt = new Date().toISOString();
        todoItem.name = requestTodo.name;
        todoItem.dueDate = requestTodo.dueDate;
        todoItem.done = false;
        todoItem.attachmentUrl = `https://${this._bucketName}.s3.amazoneaws.com/${todoItem.todoId}`

        return await this._todoService.create(todoItem);
    }

    public async update(userId: string, todoId: string, requestTodo: UpdateTodoRequestModel): Promise<TodoItemModel> {
        this._logger.info(`Update todo '${todoId}' for user '${userId}'`);

        return await this._todoService.update(userId, todoId, requestTodo);
    }

    public async delete(userId: string, todoId: string): Promise<String> {
        this._logger.info(`Delete todo '${todoId}' for user '${userId}'`);

        return await this._todoService.delete(userId, todoId);
    }

    public async getAll(userId: string): Promise<TodoItemModel[]> {
        this._logger.info(`Get all todo for user '${userId}'`);

        return await this._todoService.getAll(userId);
    }

    public async createAttachmentUrl(userId: string, todoId: string): Promise<String> {
        this._logger.info(`Create attachment url for todo '${todoId}' for user '${userId}'`);

        return await this._todoService.getUploadUrl(todoId, userId);
    }
}