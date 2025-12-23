import { z } from 'zod';

/**
 * Create classroom schema
 */
export const createClassroomSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Classroom name must be at least 3 characters')
      .max(100, 'Classroom name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    settings: z
      .object({
        allowLateSubmission: z.boolean().optional(),
        maxStudents: z.number().min(1).max(1000).optional(),
        autoGrading: z.boolean().optional(),
      })
      .optional(),
  }),
});

/**
 * Update classroom schema
 */
export const updateClassroomSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    isLive: z.boolean().optional(),
    settings: z
      .object({
        allowLateSubmission: z.boolean().optional(),
        maxStudents: z.number().min(1).max(1000).optional(),
        autoGrading: z.boolean().optional(),
      })
      .optional(),
  }),
});

/**
 * Get classroom by ID schema
 */
export const getClassroomByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
  }),
});

/**
 * Delete classroom schema
 */
export const deleteClassroomSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
  }),
});

/**
 * Join classroom by code schema
 */
export const joinClassroomSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Invalid classroom code'),
  }),
});

/**
 * Add student to classroom schema
 */
export const addStudentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
  }),
  body: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
});

/**
 * Remove student from classroom schema
 */
export const removeStudentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  }),
});

/**
 * Start live session schema
 */
export const startLiveSessionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
  }),
  body: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID').optional(),
  }),
});

/**
 * End live session schema
 */
export const endLiveSessionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid classroom ID'),
  }),
});
