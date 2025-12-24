import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Import route modules
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import userRoutes from './user.routes.js';
// import lessonRoutes from './lesson.routes.js';
// import classroomRoutes from './classroom.routes.js';
// import quizRoutes from './quiz.routes.js';

// Register routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);
// router.use('/lessons', lessonRoutes); // TODO
// router.use('/classrooms', classroomRoutes); // TODO
// router.use('/quizzes', quizRoutes); // TODO

export default router;
