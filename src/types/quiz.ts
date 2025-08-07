export interface Subject {
  id: number;
  name: string;
  groups_count: number;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  subject: number;
  subject_name: string;
  tests_count: number;
  created_at: string;
}

export interface TestDetails {
  id: number;
  name: string;
  group_name: string;
  subject_name: string;
  token: string;
  url: string;
  deadline_start: string;
  deadline_end: string;
  is_active: boolean;
  questions_count: number;
}

export interface Answer {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  order: number;
  correct_answers_count: number;
  answers: Answer[];
}

export interface TestResultResponse {
  id: number;
  student_name: string;
  student_uuid: string;
  test_name: string;
  group_name: string;
  subject_name: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: string;
  correct_answer_questions: number[];
  wrong_answer_questions: number[];
  created_at: string;
}