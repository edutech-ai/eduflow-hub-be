import { BaseRepository } from './base.repository.js';
import { Classroom, IClassroom } from '../models/classroom.model.js';
import { ClassroomStatus } from '../enums/classroom.enum.js';

export class ClassroomRepository extends BaseRepository<IClassroom> {
  constructor() {
    super(Classroom);
  }

  /**
   * Find classroom by code
   */
  async findByCode(code: string): Promise<IClassroom | null> {
    return await this.findOne(
      { code },
      [
        { path: 'teacher', select: 'name email avatar' },
        { path: 'students', select: 'name email avatar' },
        { path: 'activeQuiz', select: 'title description status' },
      ]
    );
  }

  /**
   * Find classrooms by teacher
   */
  async findByTeacher(teacherId: string): Promise<IClassroom[]> {
    return await this.findAll({
      filter: { teacher: teacherId },
      populate: [
        { path: 'students', select: 'name email avatar' },
        { path: 'activeQuiz', select: 'title status' },
      ],
    });
  }

  /**
   * Find classrooms by student
   */
  async findByStudent(studentId: string): Promise<IClassroom[]> {
    return await this.findAll({
      filter: { students: studentId },
      populate: [
        { path: 'teacher', select: 'name email avatar' },
        { path: 'activeQuiz', select: 'title status' },
      ],
    });
  }

  /**
   * Find active classrooms
   */
  async findActiveClassrooms(): Promise<IClassroom[]> {
    return await this.findAll({
      filter: { status: ClassroomStatus.ACTIVE },
      populate: [
        { path: 'teacher', select: 'name email' },
        { path: 'students', select: 'name email' },
      ],
    });
  }

  /**
   * Find live classrooms
   */
  async findLiveClassrooms(): Promise<IClassroom[]> {
    return await this.findAll({
      filter: { isLive: true, status: ClassroomStatus.ACTIVE },
      populate: [
        { path: 'teacher', select: 'name email' },
        { path: 'activeQuiz', select: 'title status' },
      ],
    });
  }

  /**
   * Add student to classroom
   */
  async addStudent(classroomId: string, studentId: string): Promise<IClassroom> {
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $addToSet: { students: studentId } },
      { new: true, runValidators: true }
    )
      .populate([
        { path: 'teacher', select: 'name email avatar' },
        { path: 'students', select: 'name email avatar' },
      ])
      .lean();

    if (!classroom) {
      throw new Error('Classroom not found');
    }

    return this.formatDocument(classroom);
  }

  /**
   * Remove student from classroom
   */
  async removeStudent(classroomId: string, studentId: string): Promise<IClassroom> {
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $pull: { students: studentId } },
      { new: true }
    )
      .populate([
        { path: 'teacher', select: 'name email avatar' },
        { path: 'students', select: 'name email avatar' },
      ])
      .lean();

    if (!classroom) {
      throw new Error('Classroom not found');
    }

    return this.formatDocument(classroom);
  }

  /**
   * Set active quiz
   */
  async setActiveQuiz(classroomId: string, quizId: string | null): Promise<IClassroom> {
    return await this.updateById(classroomId, { activeQuiz: quizId } as Partial<IClassroom>);
  }

  /**
   * Toggle live status
   */
  async toggleLive(classroomId: string, isLive: boolean): Promise<IClassroom> {
    return await this.updateById(classroomId, { isLive } as Partial<IClassroom>);
  }
}

// Export singleton instance
export const classroomRepository = new ClassroomRepository();
