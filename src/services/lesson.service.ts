import { lessonRepository } from '../repositories/lesson.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { ILesson } from '../models/lesson.model.js';
import { LessonStatus } from '../enums/lesson.enum.js';

export class LessonService {
  /**
   * Get all lessons with pagination
   */
  async getAllLessons(options: {
    page?: number;
    limit?: number;
    grade?: string;
    subject?: string;
    status?: LessonStatus;
  }): Promise<ILesson[]> {
    const { page = 1, limit = 10, grade, subject, status } = options;

    const filter: any = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    return await lessonRepository.findAll({
      filter,
      pagination: { page, limit, sort: '-createdAt' },
      populate: { path: 'author', select: 'name email avatar' },
    });
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string): Promise<ILesson> {
    const lesson = await lessonRepository.findById(id, { path: 'author', select: 'name email avatar' });
    if (!lesson) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Lesson not found');
    }
    return lesson;
  }

  /**
   * Create new lesson
   */
  async createLesson(data: {
    title: string;
    subject: string;
    grade: string;
    content: string;
    authorId: string;
    tags?: string[];
  }): Promise<ILesson> {
    return await lessonRepository.create({
      ...data,
      author: data.authorId,
      status: LessonStatus.COMPLETED,
    } as Partial<ILesson>);
  }

  /**
   * Update lesson
   */
  async updateLesson(
    id: string,
    data: {
      title?: string;
      subject?: string;
      grade?: string;
      content?: string;
      tags?: string[];
      status?: LessonStatus;
    }
  ): Promise<ILesson> {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Lesson not found');
    }

    return await lessonRepository.updateById(id, data as Partial<ILesson>);
  }

  /**
   * Delete lesson
   */
  async deleteLesson(id: string): Promise<ILesson> {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Lesson not found');
    }

    return await lessonRepository.deleteById(id);
  }

  /**
   * Get lessons by author
   */
  async getLessonsByAuthor(authorId: string): Promise<ILesson[]> {
    return await lessonRepository.findByAuthor(authorId);
  }

  /**
   * Get lessons by grade
   */
  async getLessonsByGrade(grade: string): Promise<ILesson[]> {
    return await lessonRepository.findByGrade(grade);
  }

  /**
   * Get lessons by subject
   */
  async getLessonsBySubject(subject: string): Promise<ILesson[]> {
    return await lessonRepository.findBySubject(subject);
  }

  /**
   * Search lessons
   */
  async searchLessons(keyword: string): Promise<ILesson[]> {
    return await lessonRepository.search(keyword);
  }

  /**
   * Count lessons
   */
  async countLessons(filter?: { grade?: string; subject?: string; status?: LessonStatus }): Promise<number> {
    return await lessonRepository.count(filter || {});
  }
}

// Export singleton instance
export const lessonService = new LessonService();
