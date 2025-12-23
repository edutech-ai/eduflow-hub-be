import { BaseRepository } from './base.repository.js';
import { Lesson, ILesson } from '../models/lesson.model.js';
import { LessonStatus } from '../enums/lesson.enum.js';

export class LessonRepository extends BaseRepository<ILesson> {
  constructor() {
    super(Lesson);
  }

  /**
   * Find lessons by author
   */
  async findByAuthor(authorId: string): Promise<ILesson[]> {
    return await this.findAll({
      filter: { author: authorId },
      populate: { path: 'author', select: 'name email avatar' },
    });
  }

  /**
   * Find lessons by status
   */
  async findByStatus(status: LessonStatus): Promise<ILesson[]> {
    return await this.findAll({
      filter: { status },
      populate: { path: 'author', select: 'name email' },
    });
  }

  /**
   * Find lessons by grade
   */
  async findByGrade(grade: string): Promise<ILesson[]> {
    return await this.findAll({
      filter: { grade },
      populate: { path: 'author', select: 'name email' },
    });
  }

  /**
   * Find lessons by subject
   */
  async findBySubject(subject: string): Promise<ILesson[]> {
    return await this.findAll({
      filter: { subject },
      populate: { path: 'author', select: 'name email' },
    });
  }

  /**
   * Search lessons by title or tags
   */
  async search(keyword: string): Promise<ILesson[]> {
    return await this.findAll({
      filter: {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { subject: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } },
        ],
      },
      populate: { path: 'author', select: 'name email' },
    });
  }
}

// Export singleton instance
export const lessonRepository = new LessonRepository();
