import { classroomRepository } from '../repositories/classroom.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { IClassroom } from '../models/classroom.model.js';
import { ClassroomStatus } from '../enums/classroom.enum.js';
import { generateClassroomCode } from '../utils/code.util.js';

export class ClassroomService {
  /**
   * Get all classrooms
   */
  async getAllClassrooms(options: {
    page?: number;
    limit?: number;
    status?: ClassroomStatus;
  }): Promise<IClassroom[]> {
    const { page = 1, limit = 10, status } = options;

    const filter: any = {};
    if (status) filter.status = status;

    return await classroomRepository.findAll({
      filter,
      pagination: { page, limit, sort: '-createdAt' },
      populate: [
        { path: 'teacher', select: 'name email avatar' },
        { path: 'students', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Get classroom by ID
   */
  async getClassroomById(id: string): Promise<IClassroom> {
    const classroom = await classroomRepository.findById(id, [
      { path: 'teacher', select: 'name email avatar' },
      { path: 'students', select: 'name email avatar' },
      { path: 'activeQuiz', select: 'title description status' },
    ]);

    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }

    return classroom;
  }

  /**
   * Get classroom by code
   */
  async getClassroomByCode(code: string): Promise<IClassroom> {
    const classroom = await classroomRepository.findByCode(code);
    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }
    return classroom;
  }

  /**
   * Create new classroom
   */
  async createClassroom(data: {
    name: string;
    description?: string;
    teacherId: string;
    settings?: any;
  }): Promise<IClassroom> {
    // Generate unique classroom code
    let code = generateClassroomCode();
    let exists = await classroomRepository.findByCode(code);

    while (exists) {
      code = generateClassroomCode();
      exists = await classroomRepository.findByCode(code);
    }

    return await classroomRepository.create({
      ...data,
      code,
      teacher: data.teacherId,
      status: ClassroomStatus.ACTIVE,
      isLive: false,
      students: [],
    } as Partial<IClassroom>);
  }

  /**
   * Update classroom
   */
  async updateClassroom(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: ClassroomStatus;
      settings?: any;
    }
  ): Promise<IClassroom> {
    const classroom = await classroomRepository.findById(id);
    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }

    return await classroomRepository.updateById(id, data as Partial<IClassroom>);
  }

  /**
   * Delete classroom
   */
  async deleteClassroom(id: string): Promise<IClassroom> {
    const classroom = await classroomRepository.findById(id);
    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }

    return await classroomRepository.deleteById(id);
  }

  /**
   * Add student to classroom
   */
  async addStudent(classroomId: string, studentId: string): Promise<IClassroom> {
    const classroom = await classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }

    // Check if student already in classroom
    if (classroom.students.some((s: any) => s.toString() === studentId)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Student already in classroom');
    }

    // Check max students limit
    if (
      classroom.settings?.maxStudents &&
      classroom.students.length >= classroom.settings.maxStudents
    ) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Classroom is full');
    }

    return await classroomRepository.addStudent(classroomId, studentId);
  }

  /**
   * Remove student from classroom
   */
  async removeStudent(classroomId: string, studentId: string): Promise<IClassroom> {
    return await classroomRepository.removeStudent(classroomId, studentId);
  }

  /**
   * Join classroom by code
   */
  async joinClassroom(code: string, studentId: string): Promise<IClassroom> {
    const classroom = await classroomRepository.findByCode(code);
    if (!classroom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Classroom not found');
    }

    if (classroom.status !== ClassroomStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Classroom is not active');
    }

    return await this.addStudent(classroom._id.toString(), studentId);
  }

  /**
   * Get classrooms by teacher
   */
  async getClassroomsByTeacher(teacherId: string): Promise<IClassroom[]> {
    return await classroomRepository.findByTeacher(teacherId);
  }

  /**
   * Get classrooms by student
   */
  async getClassroomsByStudent(studentId: string): Promise<IClassroom[]> {
    return await classroomRepository.findByStudent(studentId);
  }

  /**
   * Start live session
   */
  async startLiveSession(classroomId: string, quizId?: string): Promise<IClassroom> {
    const classroom = await classroomRepository.toggleLive(classroomId, true);

    if (quizId) {
      await classroomRepository.setActiveQuiz(classroomId, quizId);
    }

    return classroom;
  }

  /**
   * End live session
   */
  async endLiveSession(classroomId: string): Promise<IClassroom> {
    await classroomRepository.setActiveQuiz(classroomId, null);
    return await classroomRepository.toggleLive(classroomId, false);
  }

  /**
   * Count classrooms
   */
  async countClassrooms(filter?: { status?: ClassroomStatus }): Promise<number> {
    return await classroomRepository.count(filter || {});
  }
}

// Export singleton instance
export const classroomService = new ClassroomService();
