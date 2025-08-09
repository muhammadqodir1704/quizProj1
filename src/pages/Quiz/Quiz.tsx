import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Radio,
  Button,
  Progress,
  Typography,
  Space,
  Alert,
  Affix,
  Row,
  Col,
  Statistic,
  Modal,
  Spin,
  List,
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { fetchTestQuestions, submitTest, type Question } from "../../api/request.api";
import { useTheme } from "../../contexts/ThemeContext";
import { MathRenderer } from "../../components/MathRenderer";
import Cheating, { requestAppFullscreen } from "../../components/Cheating";
import "../../styles/MathRenderer.css";

const { Title, Text, Paragraph } = Typography;

interface TestQuestion {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  student_answer: string;
}

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 daqiqa
  const studentName = sessionStorage.getItem("studentName") || "";
  const token = sessionStorage.getItem("testToken") || "";
  const { isDark: isDarkMode } = useTheme();

  const { questionDetails, testResultId } = (location.state || {}) as {
    questionDetails?: TestQuestion;
    testResultId?: string;
  };

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  useEffect(() => {
    const onFs = () => {
      const isFs =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement;
      setIsFullscreen(!!isFs);
    };
    document.addEventListener("fullscreenchange", onFs as EventListener);
    document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    document.addEventListener("mozfullscreenchange", onFs as EventListener);
    onFs();
    return () => {
      document.removeEventListener("fullscreenchange", onFs as EventListener);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
      document.removeEventListener("mozfullscreenchange", onFs as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!questionDetails && (!studentName || !token)) {
      navigate("/");
    }
  }, [studentName, token, navigate, questionDetails]);

  // Timer
  useEffect(() => {
    if (questionDetails) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          void handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questionDetails]);

  // Savollar
  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery<Question[]>({
    queryKey: ["questions", token],
    queryFn: () => fetchTestQuestions(token!),
    enabled: !!token && !questionDetails,
  });

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const { answerIds, unansweredIds } = useMemo(() => {
    const ids = Object.values(selectedAnswers);
    const answeredQ = Object.keys(selectedAnswers).map(Number);
    const allQ = (questions || []).map((q) => q.id);
    const unanswered = allQ.filter((id) => !answeredQ.includes(id));
    return { answerIds: ids, unansweredIds: unanswered };
  }, [selectedAnswers, questions]);

  const handleSubmit = async (skipConfirmation = false) => {
    if (!skipConfirmation) {
      const ok = window.confirm(
        "Testni yakunlashni xohlaysizmi? Javoblaringiz o'zgartirib bo'lmaydi!"
      );
      if (!ok) return;
    }
    setIsSubmitting(true);

    try {
      const result = await submitTest(token!, studentName!, answerIds, unansweredIds);
      sessionStorage.removeItem("studentName");
      navigate(`/result/${result.id}`, { state: { testResult: result, token } });
    } catch (error) {
      Modal.error({
        title: "Xatolik",
        content: "Xatolik yuz berdi. Qayta urinib ko'ring.",
      });
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (questionDetails) {
    return (
      <div
        className={`min-h-screen p-6 flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card
          className={`w-full max-w-2xl rounded-2xl shadow-xl border-0 p-6 ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white"
          }`}
        >
          <Title
            level={3}
            className={`text-center mb-6 ${isDarkMode ? "text-white" : "text-gray-800"}`}
          >
            {`Savol #${questionDetails.question_number} Tahlili`}
          </Title>

          <div
            className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
            } border`}
          >
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Savol:
            </Text>
            <Paragraph className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <MathRenderer content={questionDetails.question_text} />
            </Paragraph>
          </div>

          <div className="mb-6">
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Variantlar:
            </Text>
            <List
              dataSource={questionDetails.options}
              renderItem={(item, index) => (
                <List.Item
                  className={`py-2 ${
                    index !== questionDetails.options.length - 1
                      ? "border-b border-gray-200 dark:border-gray-600"
                      : ""
                  }`}
                >
                  <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {String.fromCharCode(65 + index)}. <MathRenderer content={item} />
                  </Text>
                </List.Item>
              )}
            />
          </div>

          <div
            className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? "bg-green-900 border-green-700" : "bg-green-50 border-green-200"
            } border`}
          >
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-green-300" : "text-green-700"}`}>
              To'g'ri javob:
            </Text>
            <Paragraph className={`text-base ${isDarkMode ? "text-green-300" : "text-green-700"}`}>
              <MathRenderer content={questionDetails.correct_answer} />
            </Paragraph>
          </div>

          <div
            className={`mb-8 p-4 rounded-lg ${
              isDarkMode ? "bg-red-900 border-red-700" : "bg-red-50 border-red-200"
            } border`}
          >
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
              Sizning javobingiz:
            </Text>
            <Paragraph className={`text-base ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
              <MathRenderer content={questionDetails.student_answer} />
            </Paragraph>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/results/${testResultId}`)}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
          >
            Natijalar sahifasiga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card className={`text-center p-10 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl`}>
          <Spin size="large" />
          <Title level={4} className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Savollar yuklanmoqda...
          </Title>
        </Card>
      </div>
    );
  }

  if (isError || !questions?.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card className={`max-w-md text-center p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl`}>
          <ExclamationCircleOutlined className={`text-5xl mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
          <Title level={3} className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Xatolik
          </Title>
          <Paragraph className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Savollarni yuklashda xatolik yuz berdi
          </Paragraph>
        </Card>
      </div>
    );
  }

  // Hisob-kitoblar
  const progress = (Object.keys(selectedAnswers).length / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div
      className={`min-h-screen py-5 ${
        isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* Anti-Cheat: auto-submit va natijaga navigate */}
      {!!token && !!studentName && !!questions?.length && (
        <Cheating
          token={token}
          studentName={studentName}
          answerIds={answerIds}
          unansweredQuestionIds={unansweredIds}
          throttleMs={15000}
          devToolsPollMs={1000} 
  
          onLog={(payload) => {
            console.log("Cheat LOG payload:", payload);
          }}
        />
      )}

      {/* Yuqori panel */}
      <Affix offsetTop={0}>
        <div className={`px-6 py-4 shadow-lg ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <Statistic
                  title="Javob berilgan"
                  value={answeredCount}
                  suffix={`/ ${questions.length}`}
                  valueStyle={{ color: "#1890ff", fontSize: "20px" }}
                />
                <Progress percent={Math.round(progress)} style={{ minWidth: "200px" }} />
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <Statistic
                  title="Qolgan vaqt"
                  value={formatTime(timeLeft)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{
                    color: timeLeft < 300 ? "#ff4d4f" : "#52c41a",
                    fontSize: "20px",
                    fontFamily: "monospace",
                  }}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={() => void handleSubmit(false)}
                  loading={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg hover:from-blue-600 hover:to-purple-700"
                >
                  Testni yakunlash
                </Button>
                <Button
                  onClick={() => requestAppFullscreen()}
                  size="large"
                  className="rounded-lg"
                >
                  Fullscreen
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Affix>

      {/* Asosiy kontent */}
      <div className="max-w-6xl mx-auto p-6">
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Alert
              description="Salom, siz Grand Edu Quiz tizimiga kirdingiz. Qisqacha qoidalar — halol bo'ling! :)"
              type="info"
              showIcon
              className={`mb-6 rounded-xl ${
                isDarkMode ? "bg-blue-900 border-blue-700" : "bg-blue-50 border-blue-200"
              }`}
              message={<Text strong className={isDarkMode ? "text-blue-300" : "text-blue-600"}>Muhim eslatma</Text>}
            />
          </Col>
        </Row>

        <Row gutter={[0, 24]}>
          {!isFullscreen && (
            <Alert
              type="warning"
              showIcon
              className="mb-4"
              message="Fullscreen yoqilmagan. Iltimos, Fullscreen tugmasini bosing "
            />
          )}
          {questions.map((question, index) => (
            <Col span={24} key={question.id}>
              <Card
                className={`rounded-2xl transition-all duration-300 ${
                  selectedAnswers[question.id] !== undefined
                    ? "shadow-xl border-2 border-blue-400"
                    : "shadow-md border border-gray-200 dark:border-gray-600"
                } ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                title={
                  <Space>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <Text strong className={`text-lg ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {`Savol ${index + 1}`}
                    </Text>
                  </Space>
                }
              >
                <div className="mb-6">
                  <Paragraph
                    className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    <MathRenderer content={question.text} />
                  </Paragraph>
                </div>

                <div className="ml-5">
                  <Radio.Group
                    value={selectedAnswers[question.id]}
                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                    className="w-full"
                  >
                    <Space direction="vertical" className="w-full">
                      {question.answers.map((answer) => (
                        <Card
                          key={answer.id}
                          size="small"
                          className={`cursor-pointer rounded-lg transition-all duration-200 ${
                            selectedAnswers[question.id] === answer.id
                              ? isDarkMode
                                ? "bg-gray-700 border-2 border-blue-400"
                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400"
                              : isDarkMode
                              ? "bg-gray-700 border border-gray-600 hover:border-gray-500"
                              : "bg-gray-50 border border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleAnswerSelect(question.id, answer.id)}
                        >
                          <Radio value={answer.id}>
                            <Text className={`text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                              <MathRenderer content={answer.text} />
                            </Text>
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
