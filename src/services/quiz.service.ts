import { quizRepository } from '../repositories/quiz.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { IQuiz } from '../models/quiz.model.js';
import { QuizStatus } from '../enums/quiz.enum.js';

export class QuizService {
  /**
   * Get all quizzes with pagination
   */
  async getAllQuizzes(options: {
    page?: number;
    limit?: number;
    status?: QuizStatus;
    classroomId?: string;
  }): Promise<IQuiz[]> {
    const { page = 1, limit = 10, status, classroomId } = options;

    const filter: any = {};
    if (status) filter.status = status;
    if (classroomId) filter.classroom = classroomId;

    return await quizRepository.findAll({
      filter,
      pagination: { page, limit, sort: '-createdAt' },
      populate: [
        { path: 'teacher', select: 'name email' },
        { path: 'classroom', select: 'name code' },
      ],
    });
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: string): Promise<IQuiz> {
    const quiz = await quizRepository.findById(id, [
      { path: 'teacher', select: 'name email avatar' },
      { path: 'classroom', select: 'name code' },
    ]);

    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    return quiz;
  }

  /**
   * Create new quiz
   */
  async createQuiz(data: {
    title: string;
    description?: string;
    classroomId: string;
    teacherId: string;
    questions: any[];
    settings?: any;
  }): Promise<IQuiz> {
    return await quizRepository.create({
      title: data.title,
      description: data.description,
      classroom: data.classroomId,
      teacher: data.teacherId,
      questions: data.questions,
      settings: data.settings,
      status: QuizStatus.DRAFT,
      answers: [],
    } as Partial<IQuiz>);
  }

  /**
   * Update quiz
   */
  async updateQuiz(
    id: string,
    data: {
      title?: string;
      description?: string;
      questions?: any[];
      status?: QuizStatus;
      settings?: any;
    }
  ): Promise<IQuiz> {
    const quiz = await quizRepository.findById(id);
    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    // Cannot update active or ended quiz
    if (quiz.status !== QuizStatus.DRAFT && data.questions) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Cannot update questions of active or ended quiz');
    }

    return await quizRepository.updateById(id, data as Partial<IQuiz>);
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(id: string): Promise<IQuiz> {
    const quiz = await quizRepository.findById(id);
    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    // Cannot delete active quiz
    if (quiz.status === QuizStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Cannot delete active quiz');
    }

    return await quizRepository.deleteById(id);
  }

  /**
   * Get quizzes by classroom
   */
  async getQuizzesByClassroom(classroomId: string): Promise<IQuiz[]> {
    return await quizRepository.findByClassroom(classroomId);
  }

  /**
   * Get quizzes by teacher
   */
  async getQuizzesByTeacher(teacherId: string): Promise<IQuiz[]> {
    return await quizRepository.findByTeacher(teacherId);
  }

  /**
   * Start quiz
   */
  async startQuiz(id: string): Promise<IQuiz> {
    const quiz = await quizRepository.findById(id);
    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    if (quiz.status !== QuizStatus.DRAFT) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Quiz already started');
    }

    return await quizRepository.updateStatus(id, QuizStatus.ACTIVE);
  }

  /**
   * End quiz
   */
  async endQuiz(id: string): Promise<IQuiz> {
    const quiz = await quizRepository.findById(id);
    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    if (quiz.status !== QuizStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Quiz is not active');
    }

    return await quizRepository.updateStatus(id, QuizStatus.ENDED);
  }

  /**
   * Submit answer
   */
  async submitAnswer(
    quizId: string,
    studentId: string,
    questionId: string,
    answer: any
  ): Promise<IQuiz> {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Quiz not found');
    }

    if (quiz.status !== QuizStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Quiz is not active');
    }

    return await quizRepository.submitAnswer(quizId, studentId, questionId, answer);
  }

  /**
   * Get student answers
   */
  async getStudentAnswers(quizId: string, studentId: string): Promise<any[]> {
    return await quizRepository.getStudentAnswers(quizId, studentId);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(quizId: string): Promise<any[]> {
    return await quizRepository.getLeaderboard(quizId);
  }

  /**
   * Count quizzes
   */
  async countQuizzes(filter?: { status?: QuizStatus; classroomId?: string }): Promise<number> {
    return await quizRepository.count(filter || {});
  }
}

// Export singleton instance
export const quizService = new QuizService();
