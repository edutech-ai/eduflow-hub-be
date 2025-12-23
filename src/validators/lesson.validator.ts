import { z } from 'zod';

/**
 * Create lesson schema
 */
export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
    subject: z.string().min(2, 'Subject is required'),
    grade: z.enum([
      'grade_1',
      'grade_2',
      'grade_3',
      'grade_4',
      'grade_5',
      'grade_6',
      'grade_7',
      'grade_8',
      'grade_9',
      'grade_10',
      'grade_11',
      'grade_12',
    ]),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    tags: z.array(z.string()).optional(),
    resources: z
      .array(
        z.object({
          fileName: z.string(),
          url: z.string().url(),
          fileType: z.string(),
          fileSize: z.number(),
        })
      )
      .optional(),
  }),
});

/**
 * Update lesson schema
 */
export const updateLessonSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    subject: z.string().min(2).optional(),
    grade: z
      .enum([
        'grade_1',
        'grade_2',
        'grade_3',
        'grade_4',
        'grade_5',
        'grade_6',
        'grade_7',
        'grade_8',
        'grade_9',
        'grade_10',
        'grade_11',
        'grade_12',
      ])
      .optional(),
    content: z.string().min(10).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['generating', 'completed', 'failed']).optional(),
  }),
});

/**
 * Get lesson by ID schema
 */
export const getLessonByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lesson ID'),
  }),
});

/**
 * Delete lesson schema
 */
export const deleteLessonSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lesson ID'),
  }),
});

/**
 * Generate AI lesson schema
 */
export const generateAILessonSchema = z.object({
  body: z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters'),
    subject: z.string().min(2, 'Subject is required'),
    grade: z.enum([
      'grade_1',
      'grade_2',
      'grade_3',
      'grade_4',
      'grade_5',
      'grade_6',
      'grade_7',
      'grade_8',
      'grade_9',
      'grade_10',
      'grade_11',
      'grade_12',
    ]),
    duration: z.number().min(15).max(180).optional(),
  }),
});
