import mongoose, { Schema, Document } from 'mongoose';
import { QuizStatus, QuizType } from '@/enums/classroom.enum.js';

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: QuizType;
  options: IQuizOption[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number;
}

export interface IQuizAnswer {
  student: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
  answeredAt: Date;
}

export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  classroom: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  answers: IQuizAnswer[];
  status: QuizStatus;
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    passingScore: number;
  };
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizOptionSchema = new Schema<IQuizOption>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: Object.values(QuizType),
    required: true,
    default: QuizType.MULTIPLE_CHOICE,
  },
  options: [quizOptionSchema],
  correctAnswer: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'Points cannot be negative'],
  },
  timeLimit: {
    type: Number,
    min: [0, 'Time limit cannot be negative'],
  },
});

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    questions: [quizQuestionSchema],
    answers: [quizAnswerSchema],
    status: {
      type: String,
      enum: Object.values(QuizStatus),
      default: QuizStatus.DRAFT,
    },
    settings: {
      shuffleQuestions: {
        type: Boolean,
        default: false,
      },
      shuffleOptions: {
        type: Boolean,
        default: false,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
      allowReview: {
        type: Boolean,
        default: true,
      },
      passingScore: {
        type: Number,
        default: 70,
        min: [0, 'Passing score cannot be negative'],
        max: [100, 'Passing score cannot exceed 100'],
      },
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
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
quizSchema.index({ classroom: 1 });
quizSchema.index({ teacher: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ 'answers.student': 1 });

// Validate end time is after start time
quizSchema.pre('save', function (next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
export default Quiz;
