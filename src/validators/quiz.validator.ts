import { z } from 'zod';

/**
 * Question option schema
 */
const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

/**
 * Question schema
 */
const questionSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(questionOptionSchema).min(2, 'At least 2 options required').optional(),
  points: z.number().min(1, 'Points must be at least 1').default(10),
  timeLimit: z.number().min(5, 'Time limit must be at least 5 seconds').optional(),
});

/**
 * Create quiz schema
 */
export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    classroomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
    questions: z.array(questionSchema).min(1, 'At least 1 question required'),
    settings: z
      .object({
        shuffleQuestions: z.boolean().optional(),
        shuffleOptions: z.boolean().optional(),
        showResults: z.boolean().optional(),
        allowReview: z.boolean().optional(),
        passingScore: z.number().min(0).max(100).optional(),
      })
      .optional(),
  }),
});

/**
 * Update quiz schema
 */
export const updateQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(500).optional(),
    questions: z.array(questionSchema).min(1).optional(),
    status: z.enum(['draft', 'active', 'ended']).optional(),
    settings: z
      .object({
        shuffleQuestions: z.boolean().optional(),
        shuffleOptions: z.boolean().optional(),
        showResults: z.boolean().optional(),
        allowReview: z.boolean().optional(),
        passingScore: z.number().min(0).max(100).optional(),
      })
      .optional(),
  }),
});

/**
 * Get quiz by ID schema
 */
export const getQuizByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

/**
 * Delete quiz schema
 */
export const deleteQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

/**
 * Submit answer schema
 */
export const submitAnswerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
  body: z.object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
    answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  }),
});

/**
 * Get student answers schema
 */
export const getStudentAnswersSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
});

/**
 * Get leaderboard schema
 */
export const getLeaderboardSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

/**
 * Start quiz schema
 */
export const startQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

/**
 * End quiz schema
 */
export const endQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});
