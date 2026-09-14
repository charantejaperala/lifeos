import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  userId?: string;
  userEmail?: string;
  score: number;
  totalQuestions: number;
  level: string;
  badge: string;
  questionsAnswered: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  createdAt?: Date;
}

const QuizResultSchema: Schema = new Schema(
  {
    userId: { type: String },
    userEmail: { type: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    level: { type: String, default: 'All' },
    badge: { type: String },
    questionsAnswered: [
      {
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const QuizResultModel = mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
