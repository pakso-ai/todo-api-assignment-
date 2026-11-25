import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Check server status
 *     description: Check whether the API server is running.
 *     tags:
 *       - Server
 *     responses:
 *       '200':
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: running
 */
router.get('/', (req, res) => {
    res.json({ status: 'running' });
});

export default router;