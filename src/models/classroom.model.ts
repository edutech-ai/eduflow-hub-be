import mongoose, { Schema, Document } from 'mongoose';
import { ClassroomStatus } from '@/enums/classroom.enum.js';

export interface IClassroom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  code: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  status: ClassroomStatus;
  isLive: boolean;
  activeQuiz?: mongoose.Types.ObjectId;
  settings: {
    allowLateSubmission: boolean;
    maxStudents: number;
    autoGrading: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const classroomSchema = new Schema<IClassroom>(
  {
    name: {
      type: String,
      required: [true, 'Classroom name is required'],
      trim: true,
      maxlength: [100, 'Classroom name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [6, 'Classroom code must be at least 6 characters'],
      maxlength: [10, 'Classroom code must not exceed 10 characters'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: Object.values(ClassroomStatus),
      default: ClassroomStatus.ACTIVE,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    activeQuiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null,
    },
    settings: {
      allowLateSubmission: {
        type: Boolean,
        default: false,
      },
      maxStudents: {
        type: Number,
        default: 100,
        min: [1, 'Max students must be at least 1'],
        max: [500, 'Max students cannot exceed 500'],
      },
      autoGrading: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
classroomSchema.index({ code: 1 }, { unique: true });
classroomSchema.index({ teacher: 1 });
classroomSchema.index({ students: 1 });
classroomSchema.index({ status: 1 });
classroomSchema.index({ isLive: 1 });

// Validate max students
classroomSchema.pre('save', function (next) {
  if (this.students.length > this.settings.maxStudents) {
    next(new Error('Maximum number of students exceeded'));
  }
  next();
});

export const Classroom = mongoose.model<IClassroom>('Classroom', classroomSchema);
export default Classroom;
