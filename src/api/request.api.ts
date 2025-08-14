import axios from "axios";

const API_URL = "http://38.242.205.107:8002/api/quiz";
const CHATBOT_API_URL = "http://38.242.205.107:8002/api/quiz/chatbot/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  withCredentials: false
});

export interface TestDetail {
  name: string;
  group_name: string;
  subject_name: string;
  is_active?: boolean;
  valid?: boolean;
  test_name?: string;
  test_type?: string;
  deadline_end: string;
  time_limit: string; 
}

export interface Answer {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  order: number;
  answers: Answer[];
  correct_answer_id: number;
}

export interface QuestionDetail {
  question_text: string;
  correct_answer: string;
  incorrect_answers: string[]; 
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
  student_answers_map?: { [questionId: number]: number };
  event: string;
  time: string;
}

// Utility function to parse time limit (HH:MM:SS) to total seconds
export const parseTimeLimit = (timeLimit: string): number => {
  const [hours, minutes, seconds] = timeLimit.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

// Utility function to format seconds to HH:MM:SS
export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

// Utility function to check if deadline has passed
export const isDeadlinePassed = (deadlineEnd: string): boolean => {
  const deadline = new Date(deadlineEnd);
  const now = new Date();
  return now > deadline;
};

// Utility function to get remaining time until deadline
export const getRemainingDeadlineTime = (deadlineEnd: string): string => {
  const deadline = new Date(deadlineEnd);
  const now = new Date();
  const difference = deadline.getTime() - now.getTime();
  
  if (difference <= 0) {
    return "Vaqt tugagan";
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} kun ${hours} soat`;
  } else if (hours > 0) {
    return `${hours} soat ${minutes} daqiqa`;
  } else {
    return `${minutes} daqiqa`;
  }
};

export const validateToken = async (token: string): Promise<TestDetail> => {
  try {
    const { data } = await axiosInstance.get('/tests/detail/', {
      params: { token }
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API: Status:', error.response?.status);
      console.error('API: Data:', error.response?.data);
    }
    throw error;
  }
};

export const fetchTestDetail = async (token: string): Promise<TestDetail> => {
  const { data } = await axiosInstance.get('/tests/detail/', {
    params: { token }
  });
  return data;
};

export const fetchTestQuestions = async (token: string): Promise<Question[]> => {
  const { data } = await axiosInstance.get('/tests/questions/', {
    params: { token }
  });
  return data;
};

export const fetchQuestionDetail = async (token: string, questionOrder: number): Promise<QuestionDetail> => {
  try {
    const { data } = await axiosInstance.post('/qestion/detail/', {
      token,
      question_order: questionOrder
    });
    
    console.log('Question detail API response:', data);
    
 
    return {
      question_text: data.question_text,
      correct_answer: data.correct_answer,
      incorrect_answers: data.incorrect_answers || [] // Default bo'sh array
    };
  } catch (error) {
    console.error('Savol detaylini olishda xatolik:', error);
    throw error;
  }
};

let cachedQuestions: Question[] | null = null;
let cachedToken: string | null = null;

export const fetchAllQuestions = async (token: string): Promise<Question[]> => {
  if (cachedQuestions && cachedToken === token) {
    return cachedQuestions;
  }
  
  try {
    const questions = await fetchTestQuestions(token);
    cachedQuestions = questions;
    cachedToken = token;
    return questions;
  } catch (error) {
    console.error('Barcha savollarni olishda xatolik:', error);
    throw error;
  }
};

export const submitTest = async (
  token: string,
  studentName: string,
  answerIds: number[],
  unansweredQuestionIds: number[],
  event?: string,
  time?: string
): Promise<TestResultResponse> => {
  const { data } = await axiosInstance.post('/tests/submit/', {
    token,
    student_name: studentName,
    answer_ids: answerIds,
    unanswered_question_ids: unansweredQuestionIds,
    event: event || "",
    time: time || ""
  });
  return data;
};

export interface ChatbotResponse {
  response: string;
  status: string;
}

export const sendChatMessage = async (testResultId: number, message: string): Promise<ChatbotResponse> => {
  try {
    console.log('Chatbot API ga yuborilayotgan ma\'lumot:', {
      test_result_id: testResultId,
      user_message: message
    });
    
    const { data } = await axios.post(CHATBOT_API_URL, {
      test_result_id: testResultId,
      user_message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      withCredentials: false
    });
    
    console.log('Chatbot API dan kelgan javob:', data);
    return data;
    
  } catch (error) {
    console.error('Chatbot API xatoligi:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Chatbot API topilmadi');
      } else if (error.response?.status === 500) {
        throw new Error('Server xatoligi');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('So\'rov vaqti tugadi');
      }
    }
    
    throw new Error('Chatbot bilan bog\'lanishda xatolik yuz berdi');
  }
};