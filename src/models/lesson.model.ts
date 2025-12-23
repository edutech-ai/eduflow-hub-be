import mongoose, { Schema, Document } from 'mongoose';
import { LessonStatus, LessonGrade } from '@/enums/lesson.enum.js';

export interface IResource {
  fileName: string;
  url: string;
  fileType: string;
  fileSize: number;
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade: LessonGrade;
  content: string;
  author: mongoose.Types.ObjectId;
  status: LessonStatus;
  resources: IResource[];
  tags: string[];
  pdfUrl?: string;
  aiPrompt?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    fileName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    grade: {
      type: String,
      enum: Object.values(LessonGrade),
      required: [true, 'Grade is required'],
    },
    content: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    status: {
      type: String,
      enum: Object.values(LessonStatus),
      default: LessonStatus.GENERATING,
    },
    resources: [resourceSchema],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    pdfUrl: {
      type: String,
      default: null,
    },
    aiPrompt: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
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
lessonSchema.index({ author: 1 });
lessonSchema.index({ status: 1 });
lessonSchema.index({ subject: 1 });
lessonSchema.index({ grade: 1 });
lessonSchema.index({ createdAt: -1 });
lessonSchema.index({ tags: 1 });

// Text search index
lessonSchema.index({ title: 'text', subject: 'text', tags: 'text' });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
export default Lesson;
