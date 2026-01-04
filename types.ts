
export interface Question {
  id: number;
  expression: string;
  expectedAnswer: string;
  type: 'square_diff' | 'perfect_square' | 'quadratic' | 'general_quad';
}

export interface QuizState {
  questions: Question[];
  currentIdx: number;
  score: number;
  isFinished: boolean;
  userAnswers: string[];
  feedback: { correct: boolean; message: string } | null;
  loading: boolean;
}

export enum AppStatus {
  START = 'START',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT'
}
