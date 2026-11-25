import express from "express";

export function createTodosRouter(todoService) {
    const router = express.Router();

    /**
     * @openapi
     * /todos:
     *   get:
     *     summary: Get all Todo items
     *     description: Get Todo items, optionally filtered by state. Supports JSON and CSV.
     *     tags:
     *       - Todos
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: state
     *         required: false
     *         schema:
     *           type: string
     *           enum: [todo, doing, done]
     *       - in: header
     *         name: Accept
     *         required: false
     *         schema:
     *           type: string
     *           enum: [application/json, text/csv]
     *     responses:
     *       '200':
     *         description: Todo items returned successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Todo'
     *           text/csv:
     *             schema:
     *               type: string
     *       '400':
     *         description: Invalid state
     *       '401':
     *         description: Unauthorized
     *       '406':
     *         description: Unsupported response format
     */
    router.get("/", (req, res, next) => {
        try {
            const todos = todoService.getAllTodos(req.query.state);

            const format = req.accepts([
                "application/json",
                "text/csv"
            ]);

            if (!format) {
                return res.status(406).json({
                    message: "Accept application/json or text/csv"
                });
            }

            if (format === "text/csv") {
                const headers = [
                    "id",
                    "title",
                    "description",
                    "state",
                    "dueDate",
                    "createdAt",
                    "updatedAt"
                ];

                const escapeCsv = value =>
                    `"${String(value ?? "").replace(/"/g, '""')}"`;

                const rows = todos.map(todo =>
                    headers.map(header => escapeCsv(todo[header])).join(",")
                );

                const csv = [
                    headers.join(","),
                    ...rows
                ].join("\n");

                return res.type("text/csv").send(csv);
            }

            return res.status(200).json(todos);

        } catch (err) {
            next(err);
        }
    });

    /**
     * @openapi
     * /todos/{id}:
     *   get:
     *     summary: Get a Todo item by ID
     *     tags: [Todos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Todo found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Todo'
     *       '404':
     *         description: Todo not found
     *       '401':
     *         description: Unauthorized
     */
    router.get("/:id", (req, res, next) => {
        try {
            const todo = todoService.getTodoById(req.params.id);

            if (!todo) {
                return res.status(404).json({
                    message: "Todo not found"
                });
            }

            return res.status(200).json(todo);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @openapi
     * /todos:
     *   post:
     *     summary: Create a new Todo item
     *     tags: [Todos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [title]
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               state:
     *                 type: string
     *                 enum: [todo, doing, done]
     *               dueDate:
     *                 type: string
     *     responses:
     *       '201':
     *         description: Todo created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Todo'
     *       '400':
     *         description: Invalid input
     *       '401':
     *         description: Unauthorized
     */
    router.post("/", (req, res, next) => {
        try {
            const newTodo = todoService.createTodo(req.body);
            return res.status(201).json(newTodo);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @openapi
     * /todos/{id}:
     *   put:
     *     summary: Update a Todo item
     *     tags: [Todos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               state:
     *                 type: string
     *                 enum: [todo, doing, done]
     *               dueDate:
     *                 type: string
     *     responses:
     *       '200':
     *         description: Todo updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Todo'
     *       '400':
     *         description: Invalid input
     *       '404':
     *         description: Todo not found
     *       '401':
     *         description: Unauthorized
     */
    router.put("/:id", (req, res, next) => {
        try {
            const updatedTodo = todoService.updateTodo(
                req.params.id,
                req.body
            );

            if (!updatedTodo) {
                return res.status(404).json({
                    message: "Todo not found"
                });
            }

            return res.status(200).json(updatedTodo);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @openapi
     * /todos/{id}:
     *   delete:
     *     summary: Delete a Todo item
     *     tags: [Todos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Todo deleted
     *       '404':
     *         description: Todo not found
     *       '401':
     *         description: Unauthorized
     */
    router.delete("/:id", (req, res, next) => {
        try {
            const deletedTodo = todoService.deleteTodo(req.params.id);

            if (!deletedTodo) {
                return res.status(404).json({
                    message: "Todo not found"
                });
            }

            return res.status(200).json({
                message: "Todo deleted successfully",
                todo: deletedTodo
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
}
