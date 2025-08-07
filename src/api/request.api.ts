import axios from "axios";

const API_URL = "http://38.242.205.107:8002/api/quiz";
const CHATBOT_API_URL = "http://38.242.205.107:8002/api/quiz/chatbot/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
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
  expires_at?: string;
  deadline_start: string;
  deadline_end: string;
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
}

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
    
    return data;
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
  unansweredQuestionIds: number[]
): Promise<TestResultResponse> => {
  const { data } = await axiosInstance.post('/tests/submit/', {
    token,
    student_name: studentName,
    answer_ids: answerIds,
    unanswered_question_ids: unansweredQuestionIds
  });
  return data;
};

export interface ChatbotResponse {
  response: string;
  status: string;
}

// CSRF token olish funksiyasi
const getCsrfToken = (): string => {
  // Cookie dan CSRF token olish
  const name = 'csrftoken';
  let cookieValue = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  // Agar cookie da yo'q bo'lsa, default token qaytarish
  return cookieValue || '5smUtNVxpBIHANXsvb3MSTvyqKYzRrdnazgR4ezGegpfgXinmVzARbT3WP3ZhqUi';
};

export const sendChatMessage = async (testResultId: number, message: string): Promise<ChatbotResponse> => {
  try {
    console.log('Chatbot API so\'rovini yuborish:', {
      url: CHATBOT_API_URL,
      payload: {
        test_result_id: testResultId,
        user_message: message
      }
    });

    // CSRF token olish
    const csrfToken = getCsrfToken();

    // Alohida axios instance yaratamiz chatbot uchun
    const response = await axios.post(CHATBOT_API_URL, {
      test_result_id: testResultId,
      user_message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFTOKEN': csrfToken,
        // Referer header ham qo'shish
        'Referer': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000,
      withCredentials: true // CSRF token uchun cookie kerak
    });

    console.log('Chatbot API javobi:', response.data);

    return response.data;
  } catch (error) {
    console.error('Chatbot API xatosi:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      
      // Aniq xatolik xabarini qaytarish
      if (error.response?.status === 404) {
        throw new Error('Chatbot API manzili topilmadi (404)');
      } else if (error.response?.status === 500) {
        throw new Error('Server ichki xatosi (500)');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Noto\'g\'ri so\'rov (400)';
        throw new Error(errorMsg);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('So\'rov timeout (30 sekund)');
      } else if (error.message === 'Network Error') {
        throw new Error('Internetga ulanishda muammo');
      }
    }
    
    throw error;
  }
};