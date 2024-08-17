export class TodoItemModel {
    todoId:string;
    name: string;
    dueDate: string;
    done: boolean;
    attachmentUrl?: string;
    createdAt: Date;
    createdBy: string;
}