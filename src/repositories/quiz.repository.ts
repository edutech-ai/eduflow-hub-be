import { BaseRepository } from './base.repository.js';
import { Quiz, IQuiz } from '../models/quiz.model.js';
import { QuizStatus } from '../enums/quiz.enum.js';

export class QuizRepository extends BaseRepository<IQuiz> {
  constructor() {
    super(Quiz);
  }

  /**
   * Find quizzes by classroom
   */
  async findByClassroom(classroomId: string): Promise<IQuiz[]> {
    return await this.findAll({
      filter: { classroom: classroomId },
      populate: [
        { path: 'teacher', select: 'name email' },
        { path: 'classroom', select: 'name code' },
      ],
    });
  }

  /**
   * Find quizzes by teacher
   */
  async findByTeacher(teacherId: string): Promise<IQuiz[]> {
    return await this.findAll({
      filter: { teacher: teacherId },
      populate: { path: 'classroom', select: 'name code' },
    });
  }

  /**
   * Find quizzes by status
   */
  async findByStatus(status: QuizStatus): Promise<IQuiz[]> {
    return await this.findAll({
      filter: { status },
      populate: [
        { path: 'teacher', select: 'name email' },
        { path: 'classroom', select: 'name code' },
      ],
    });
  }

  /**
   * Find active quizzes for a classroom
   */
  async findActiveQuizzes(classroomId: string): Promise<IQuiz[]> {
    return await this.findAll({
      filter: { classroom: classroomId, status: QuizStatus.ACTIVE },
      populate: { path: 'teacher', select: 'name email' },
    });
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
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Find the question
    const question = quiz.questions.find((q) => q._id?.toString() === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if answer is correct (simplified logic)
    let isCorrect = false;
    let points = 0;

    if (question.type === 'multiple_choice') {
      const correctOption = question.options?.find((opt) => opt.isCorrect);
      isCorrect = answer === correctOption?.text;
      points = isCorrect ? question.points : 0;
    } else if (question.type === 'true_false') {
      const correctOption = question.options?.find((opt) => opt.isCorrect);
      isCorrect = answer === correctOption?.text;
      points = isCorrect ? question.points : 0;
    }

    // Add or update answer
    const existingAnswerIndex = quiz.answers.findIndex(
      (a) => a.student.toString() === studentId && a.questionId.toString() === questionId
    );

    const answerData = {
      student: studentId,
      questionId,
      answer,
      isCorrect,
      points,
      answeredAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      quiz.answers[existingAnswerIndex] = answerData as any;
    } else {
      quiz.answers.push(answerData as any);
    }

    await quiz.save();

    const updatedQuiz = await Quiz.findById(quizId)
      .populate([
        { path: 'teacher', select: 'name email' },
        { path: 'classroom', select: 'name code' },
        { path: 'answers.student', select: 'name email' },
      ])
      .lean();

    return this.formatDocument(updatedQuiz);
  }

  /**
   * Get student answers for a quiz
   */
  async getStudentAnswers(quizId: string, studentId: string): Promise<any[]> {
    const quiz = await this.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return quiz.answers.filter((a: any) => a.student.toString() === studentId);
  }

  /**
   * Get leaderboard for a quiz
   */
  async getLeaderboard(quizId: string): Promise<any[]> {
    const quiz = await Quiz.findById(quizId).populate('answers.student', 'name email avatar');

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculate total points for each student
    const studentScores = new Map<string, { student: any; totalPoints: number }>();

    quiz.answers.forEach((answer: any) => {
      const studentId = answer.student._id.toString();
      const existing = studentScores.get(studentId);

      if (existing) {
        existing.totalPoints += answer.points;
      } else {
        studentScores.set(studentId, {
          student: answer.student,
          totalPoints: answer.points,
        });
      }
    });

    // Convert to array and sort by points
    const leaderboard = Array.from(studentScores.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        rank: index + 1,
        student: entry.student,
        totalPoints: entry.totalPoints,
      }));

    return leaderboard;
  }

  /**
   * Update quiz status
   */
  async updateStatus(quizId: string, status: QuizStatus): Promise<IQuiz> {
    return await this.updateById(quizId, { status } as Partial<IQuiz>);
  }
}

// Export singleton instance
export const quizRepository = new QuizRepository();
