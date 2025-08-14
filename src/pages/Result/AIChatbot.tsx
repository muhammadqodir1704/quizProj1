import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Button,
  Row,
  Col,
  Modal,
  theme,
  Space,
  Typography,
  Card,
} from "antd";
import { RobotOutlined } from "@ant-design/icons";
import {
  sendChatMessage,
  fetchQuestionDetail,
  fetchAllQuestions,
  QuestionDetail as ApiQuestionDetail,
} from "../../api/request.api";
import StatisticsCard from "../../components/StatisticsCard";
import ChatInterface from "../../components/ChatInterface";
import QuestionDetail from "../../components/QuestionDetail";

import "katex/dist/katex.min.css";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

import { motion } from "framer-motion";

const { Content } = Layout;

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
}

interface QuestionData extends ApiQuestionDetail {
  order: number;
}

interface TestResult {
  student_name: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  wrong_answer_questions: number[];
  correct_answer_questions: number[];
  test_name?: string;
  group_name?: string;
  subject_name?: string;
  questions?: QuestionData[];
  token?: string;
}

export default function AIChatbot() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const testResult = location.state?.testResult as TestResult;
  
  // ⭐ MUHIM: Barcha hooks komponent boshida chaqiriladi
  const { token } = theme.useToken();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatbotOnMobile, setShowChatbotOnMobile] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(
    null
  );
  const [selectedQuestionNumber, setSelectedQuestionNumber] =
    useState<number>(0);
  const [allQuestions, setAllQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    if (!testResult || !id) {
      navigate("/");
      return;
    }

    let token = sessionStorage.getItem("testToken");

    if (!token && location.state?.testResult?.token) {
      token = location.state.testResult.token;
    }

    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get("token") || "";
    }
    if (!token) {
      const formToken = sessionStorage.getItem("formToken");
      if (formToken) {
        token = formToken;
      }
    }

    if (token && !testResult.token) {
      testResult.token = token;
    }

    if (token) {
      loadAllQuestions(token);
    } else {
      console.warn("Token topilmadi, savollar yuklanmaydi");
    }

    const roundedScorePercentage = Math.round(testResult.score_percentage || 0);

    const welcomeMsg: Message = {
      id: "welcome",
      type: "system",
      content: `Tabriklaymiz! Test yakunlandi 🎉`,
      timestamp: new Date(),
    };
    const resultMsg: Message = {
      id: "result",
      type: "bot",
      content: `Salom, ${
        testResult.student_name
      }! Sizning natijangiz ${roundedScorePercentage}% (${
        testResult.correct_answers
      }/${testResult.total_questions}). ${
        testResult.wrong_answer_questions.length > 0
          ? `Men sizning ${testResult.wrong_answer_questions.length} ta xato javobingizni tahlil qilib, tushuntirib bera olaman. Qaysi savolni ko'rib chiqishni xohlaysiz?`
          : "Ajoyib! Barcha savollarga to'g'ri javob berdingiz! 🌟"
      }`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg, resultMsg]);
  }, [testResult, id, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log("Chatbot API ga so'rov yuborilmoqda:", {
        testResultId: Number(id),
        message: currentMessage,
      });

      const response = await sendChatMessage(Number(id), currentMessage);

      console.log("API dan javob keldi:", response);

      let botContent = "";
      if (response.status === "success" && response.response) {
        botContent = response.response;
      } else {
        botContent = "API dan kutilmagan javob keldi";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);

      let errorMessage = "Kechirasiz, xatolik yuz berdi. Qayta urinib ko'ring.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllQuestions = async (token: string) => {
    try {
      const questions = await fetchAllQuestions(token);
      const questionDetails: QuestionData[] = [];

      for (const question of questions) {
        try {
          const detail = await fetchQuestionDetail(token, question.order);
          questionDetails.push({ ...detail, order: question.order });
        } catch (error) {
          console.error(
            `Savol ${question.order} detayini olishda xatolik:`,
            error
          );
        }
      }

      setAllQuestions(questionDetails);
    } catch (error) {
      console.error("Barcha savollarni yuklashda xatolik:", error);
    }
  };

  const handleQuestionClick = async (questionNumber: number) => {
    try {
      let token = sessionStorage.getItem("testToken");
      if (!token && location.state?.token) {
        token = location.state.token;
      }
      if (!token && location.state?.testResult?.token) {
        token = location.state.testResult.token;
      }
      if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get("token") || "";
      }
      if (!token) {
        console.error("Test token topilmadi");
        return;
      }
      const existingQuestion = allQuestions.find(
        (q) => q.order === questionNumber
      );
      if (existingQuestion) {
        setSelectedQuestion(existingQuestion);
        setSelectedQuestionNumber(questionNumber);
        return;
      }
      const questionDetail = await fetchQuestionDetail(token, questionNumber);
      setSelectedQuestion({ ...questionDetail, order: questionNumber });
      setSelectedQuestionNumber(questionNumber);
    } catch (error) {
      console.error("Savol detayini olishda xatolik:", error);
    }
  };

  const handleBackToResults = () => {
    setSelectedQuestion(null);
    setSelectedQuestionNumber(0);
  };

  const handleNextQuestion = async (questionNumber: number) => {
    if (questionNumber <= testResult.total_questions) {
      await handleQuestionClick(questionNumber);
    }
  };

  const handlePrevQuestion = async (questionNumber: number) => {
    if (questionNumber >= 1) {
      await handleQuestionClick(questionNumber);
    }
  };

  const quickActions = [
    "Barcha xatolarimni tahlil qil",
    `${testResult?.wrong_answer_questions[0] || 1}-savolni tushuntir`,
    "Qo'shimcha mashqlar ber",
    "Mavzu bo'yicha maslahat ber",
  ];

  // ⭐ Erta return'larni oxiriga ko'chirish
  if (!testResult) {
    return null;
  }

  if (selectedQuestion) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <Content>
          <QuestionDetail
            question={selectedQuestion}
            onBack={handleBackToResults}
            onNextQuestion={handleNextQuestion}
            onPrevQuestion={handlePrevQuestion}
            totalQuestions={testResult.total_questions}
            questionNumber={selectedQuestionNumber}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <Content className="max-w-7xl mx-auto w-full flex justify-center items-center">
        <Row gutter={[24, 24]} justify="center" className="w-full">
          {/* Statistics Section */}
          <Col xs={24} lg={12}>
            <StatisticsCard
              testResult={testResult}
              onQuestionClick={handleQuestionClick}
              isMobile={isMobileView}
            />
          </Col>

          {/* Chat Section */}
          <Col xs={24} lg={12}>
            {isMobileView ? (
              // Mobile da Modal
              <Modal
                title={
                  <Space align="center">
                    <RobotOutlined style={{ color: token.colorPrimary }} />
                    <Typography style={{ fontSize: 16 }}>
                      {"GRAND Intellect"}
                    </Typography>
                  </Space>
                }
                style={{ borderRadius: 16, boxShadow: token.boxShadow }}
                open={showChatbotOnMobile}
                onCancel={() => setShowChatbotOnMobile(false)}
                footer={false}
                width="90%"
              >
                <ChatInterface
                  messages={messages}
                  inputMessage={inputMessage}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  onInputChange={setInputMessage}
                  quickActions={quickActions}
                />
              </Modal>
            ) : (
              // Desktop da Card
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card
                  title={
                    <Space align="center">
                      <RobotOutlined style={{ color: token.colorPrimary }} />
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        {"GRAND Intellect"}
                      </Typography.Title>
                    </Space>
                  }
                  style={{ 
                    borderRadius: 16, 
                    boxShadow: token.boxShadow,
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  bodyStyle={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 0
                  }}
                >
                  <ChatInterface
                    messages={messages}
                    inputMessage={inputMessage}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                    onInputChange={setInputMessage}
                    quickActions={quickActions}
                  />
                </Card>
              </motion.div>
            )}
          </Col>
        </Row>
      </Content>

      {/* Mobile floating button */}
      {isMobileView && (
        <div className="fixed flex items-center justify-center rounded-full bottom-6 right-6 w-15 h-15 text-2xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg z-[1000]">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={() => setShowChatbotOnMobile(!showChatbotOnMobile)}
          />
        </div>
      )}
    </Layout>
  );
}