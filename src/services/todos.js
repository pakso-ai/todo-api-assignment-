import { v4 as uuidv4 } from "uuid";

const validStates = ["todo", "doing", "done"];

export class TodoError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export function createTodoService() {
    let todos = [];

    function getAllTodos(state) {
        if (state && !validStates.includes(state)) {
            throw new TodoError(
                400,
                "State must be todo, doing, or done"
            );
        }

        if (state) {
            return todos.filter(todo => todo.state === state);
        }

        return todos;
    }

    function getTodoById(id) {
        return todos.find(todo => todo.id === id);
    }

    function createTodo(data) {
        const { title, description, state, dueDate } = data || {};

        if (!title || typeof title !== "string" || !title.trim()) {
            throw new TodoError(400, "Title is required");
        }

        if (state !== undefined && !validStates.includes(state)) {
            throw new TodoError(400, "State must be todo, doing, or done");
        }

        if (description !== undefined && typeof description !== "string") {
            throw new TodoError(400, "Description must be a string");
        }

        if (dueDate !== undefined && (
            typeof dueDate !== "string" ||
            Number.isNaN(Date.parse(dueDate))
        )) {
            throw new TodoError(400, "Due date must be a valid date");
        }

        const now = new Date().toISOString();

        const newTodo = {
            id: uuidv4(),
            title: title.trim(),
            description: description || "",
            state: state || "todo",
            dueDate: dueDate || null,
            createdAt: now,
            updatedAt: now
        };

        todos.push(newTodo);
        return newTodo;
    }

    function updateTodo(id, updates) {
        const todo = getTodoById(id);

        if (!todo) return undefined;

        if (
            !updates ||
            typeof updates !== "object" ||
            Array.isArray(updates)
        ) {
            throw new TodoError(400, "Request body must be an object");
        }

        const allowedFields = ["title", "description", "state", "dueDate"];
        const fields = Object.keys(updates);

        if (
            fields.length === 0 ||
            fields.some(field => !allowedFields.includes(field))
        ) {
            throw new TodoError(400, "Provide valid fields to update");
        }

        const { title, description, state, dueDate } = updates;

        if (title !== undefined && (
            typeof title !== "string" || !title.trim()
        )) {
            throw new TodoError(400, "Title must be a non-empty string");
        }

        if (description !== undefined && typeof description !== "string") {
            throw new TodoError(400, "Description must be a string");
        }

        if (state !== undefined && !validStates.includes(state)) {
            throw new TodoError(400, "State must be todo, doing, or done");
        }

        if (dueDate !== undefined && (
            typeof dueDate !== "string" ||
            Number.isNaN(Date.parse(dueDate))
        )) {
            throw new TodoError(400, "Due date must be a valid date");
        }

        if (title !== undefined) todo.title = title.trim();
        if (description !== undefined) todo.description = description;
        if (state !== undefined) todo.state = state;
        if (dueDate !== undefined) todo.dueDate = dueDate;

        todo.updatedAt = new Date().toISOString();

        return todo;
    }

    function deleteTodo(id) {
        const index = todos.findIndex(todo => todo.id === id);

        if (index === -1) return undefined;

        return todos.splice(index, 1)[0];
    }

    return {
        getAllTodos,
        getTodoById,
        createTodo,
        updateTodo,
        deleteTodo
    };
}