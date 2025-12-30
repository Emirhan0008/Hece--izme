export interface Syllable {
  text: string;
  id: string;
}

export enum FeedbackState {
  IDLE = 'IDLE',
  CHECKING = 'CHECKING',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
}

export interface CheckResult {
  isCorrect: boolean;
  reason?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string; // Emoji char
  totalCorrectAudio: number; // Gold stars (done without hint)
  totalCorrectHint: number;  // Silver stars (done with hint)
  createdAt: number;
}