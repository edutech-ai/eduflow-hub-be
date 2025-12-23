import { Socket } from 'socket.io';
import { CLASSROOM_EVENTS } from '../events/classroom.events.js';
import logger from '@/configs/logger.config.js';

export class ClassroomSocketHandler {
  public static register(socket: Socket): void {
    // Join classroom
    socket.on(CLASSROOM_EVENTS.JOIN_CLASS, async (data: { classroomId: string; userId: string }) => {
      try {
        const { classroomId, userId } = data;
        const roomName = `classroom:${classroomId}`;

        await socket.join(roomName);
        logger.info(`User ${userId} joined classroom ${classroomId}`);

        // Notify others in the classroom
        socket.to(roomName).emit(CLASSROOM_EVENTS.USER_JOINED, {
          userId,
          timestamp: new Date(),
        });

        // Send current classroom state to the user
        socket.emit(CLASSROOM_EVENTS.UPDATE_ATTENDANCE, {
          // TODO: Get and send current attendance
        });
      } catch (error) {
        logger.error('Error joining classroom:', error);
        socket.emit('error', { message: 'Failed to join classroom' });
      }
    });

    // Leave classroom
    socket.on(CLASSROOM_EVENTS.LEAVE_CLASS, async (data: { classroomId: string; userId: string }) => {
      try {
        const { classroomId, userId } = data;
        const roomName = `classroom:${classroomId}`;

        await socket.leave(roomName);
        logger.info(`User ${userId} left classroom ${classroomId}`);

        // Notify others
        socket.to(roomName).emit(CLASSROOM_EVENTS.USER_LEFT, {
          userId,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error('Error leaving classroom:', error);
      }
    });

    // Submit answer
    socket.on(
      CLASSROOM_EVENTS.SUBMIT_ANSWER,
      async (data: { classroomId: string; quizId: string; questionId: string; answer: any; userId: string }) => {
        try {
          const { classroomId, questionId, userId } = data;

          logger.info(`User ${userId} submitted answer for question ${questionId}`);

          // TODO: Process answer, update score, update leaderboard

          // Emit leaderboard update to all users in classroom
          const roomName = `classroom:${classroomId}`;
          socket.to(roomName).emit(CLASSROOM_EVENTS.UPDATE_LEADERBOARD, {
            // TODO: Send updated leaderboard
          });
        } catch (error) {
          logger.error('Error submitting answer:', error);
          socket.emit('error', { message: 'Failed to submit answer' });
        }
      }
    );
  }
}

export default ClassroomSocketHandler;
