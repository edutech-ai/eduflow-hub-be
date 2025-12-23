export const CLASSROOM_EVENTS = {
  // Join/Leave
  JOIN_CLASS: 'classroom:join',
  LEAVE_CLASS: 'classroom:leave',
  USER_JOINED: 'classroom:user_joined',
  USER_LEFT: 'classroom:user_left',

  // Quiz Events
  NEW_QUIZ: 'classroom:new_quiz',
  START_QUIZ: 'classroom:start_quiz',
  END_QUIZ: 'classroom:end_quiz',
  NEW_QUESTION: 'classroom:new_question',
  SUBMIT_ANSWER: 'classroom:submit_answer',
  UPDATE_LEADERBOARD: 'classroom:update_leaderboard',

  // Lesson Events
  LESSON_READY: 'classroom:lesson_ready',
  LESSON_FAILED: 'classroom:lesson_failed',

  // Real-time Updates
  UPDATE_ATTENDANCE: 'classroom:update_attendance',
  STUDENT_ONLINE: 'classroom:student_online',
  STUDENT_OFFLINE: 'classroom:student_offline',
} as const;

export type ClassroomEvent = (typeof CLASSROOM_EVENTS)[keyof typeof CLASSROOM_EVENTS];
