import express from 'express';

import {
    getAllUsers,
    getUserById
} from '../services/users.js';

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Users returned successfully
 *       '401':
 *         description: Unauthorized
 */
router.get('/', (req, res) => {
    res.json(getAllUsers());
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
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
 *         description: User returned successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 */
router.get('/:id', (req, res) => {
    const user = getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({
            error: 'User not found'
        });
    }

    return res.json(user);
});

export default router;