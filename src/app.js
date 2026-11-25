import express from 'express';
import cookieParser from 'cookie-parser';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';


import { verifyToken } from './middleware/verifytoken.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';

import { createTodosRouter } from './routes/todos.js';
import { createTodoService, TodoError } from './services/todos.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Create Todo service
const todoService = createTodoService();

// Public routes
app.use('/', indexRouter);
app.use('/auth', authRouter);

// Protected routes
app.use('/users', verifyToken, usersRouter);
app.use('/todos', verifyToken, createTodosRouter(todoService));

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof TodoError) {
        return res.status(err.status).json({
            message: err.message
        });
    }

    if (err.status === 400) {
        return res.status(400).json({
            message: 'Invalid request'
        });
    }

    console.error(err);

    return res.status(500).json({
        message: 'Internal server error'
    });
});

export default app;