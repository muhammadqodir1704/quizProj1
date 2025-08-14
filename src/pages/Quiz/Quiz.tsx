"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
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
} from "antd"
import {
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
  BarChartOutlined,
  EditOutlined,
  HomeOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { fetchTestQuestions, submitTest, type Question } from "../../api/request.api"
import { useTheme } from "../../contexts/ThemeContext"
import { MathRenderer } from "../../components/MathRenderer"
import Cheating from "../../components/Cheating"
import "../../styles/MathRenderer.css"

const { Title, Text, Paragraph } = Typography

interface TestQuestion {
  question_number: number
  question_text: string
  options: string[]
  correct_answer: string
  student_answer: string
  incorrect_answers?: string[]
}

export default function Quiz() {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const studentName = sessionStorage.getItem("studentName") || ""
  const token = sessionStorage.getItem("testToken") || ""
  const { isDark: isDarkMode } = useTheme()

  const { questionDetails, testResultId } = (location.state || {}) as {
    questionDetails?: TestQuestion
    testResultId?: string
  }

  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery<Question[]>({
    queryKey: ["questions", token],
    queryFn: () => fetchTestQuestions(token!),
    enabled: !!token && !questionDetails,
  })

  const { answerIds, unansweredIds } = useMemo(() => {
    const ids = Object.values(selectedAnswers)
    const answeredQ = Object.keys(selectedAnswers).map(Number)
    const allQ = (questions || []).map((q) => q.id)
    const unanswered = allQ.filter((id) => !answeredQ.includes(id))
    return { answerIds: ids, unansweredIds: unanswered }
  }, [selectedAnswers, questions])

  useEffect(() => {
    if (!questionDetails && (!studentName || !token)) {
      navigate("/")
    }
  }, [studentName, token, navigate, questionDetails])

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleSubmit = async (skipConfirmation = false) => {
    if (!skipConfirmation) {
      const ok = window.confirm("Testni yakunlashni xohlaysizmi? Javoblaringiz o'zgartirib bo'lmaydi!")
      if (!ok) return
    }
    setIsSubmitting(true)

    try {
      const result = await submitTest(token!, studentName!, answerIds, unansweredIds)
      sessionStorage.removeItem("studentName")
      navigate(`/result/${result.id}`, { state: { testResult: result, token } })
    } catch (error) {
      Modal.error({
        title: "Xatolik",
        content: "Xatolik yuz berdi. Qayta urinib ko'ring.",
      })
      setIsSubmitting(false)
    }
  }

  if (questionDetails) {
    return (
      <div
        className={`min-h-screen p-6 flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card
          className={`w-full max-w-2xl rounded-2xl shadow-2xl border-0 p-6 ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-gray-900/40"
              : "bg-gradient-to-br from-white to-gray-50 shadow-gray-300/20"
          }`}
        >
          <Title level={3} className={`text-center mb-6 font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            <SearchOutlined className="mr-2" />
            {`Savol #${questionDetails.question_number} Tahlili`}
          </Title>

          {/* Savol matni */}
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

          {/* Variantlar */}
          <div className="mb-6">
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Variantlar:
            </Text>
            <List
              dataSource={questionDetails.options}
              renderItem={(item, index) => (
                <List.Item
                  className={`py-2 ${
                    index !== questionDetails.options.length - 1 ? "border-b border-gray-200 dark:border-gray-600" : ""
                  }`}
                >
                  <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {String.fromCharCode(65 + index)}. <MathRenderer content={item} />
                  </Text>
                </List.Item>
              )}
            />
          </div>

          {/* To'g'ri javob */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? "bg-green-900 border-green-700" : "bg-green-50 border-green-200"
            } border`}
          >
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-green-300" : "text-green-700"}`}>
              <CheckCircleOutlined className="mr-2" />
              To'g'ri javob:
            </Text>
            <Paragraph className={`text-base ${isDarkMode ? "text-green-300" : "text-green-700"}`}>
              <MathRenderer content={questionDetails.correct_answer} />
            </Paragraph>
          </div>

          {/* Noto'g'ri javoblar */}
          {questionDetails.incorrect_answers && questionDetails.incorrect_answers.length > 0 && (
            <div className="mb-6">
              <Text strong className={`text-base block mb-3 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                <CloseCircleOutlined className="mr-2" />
                Noto'g'ri javoblar:
              </Text>
              <div className="space-y-3">
                {questionDetails.incorrect_answers.map((incorrectAnswer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      isDarkMode ? "bg-red-900/50 border-red-700" : "bg-red-50 border-red-200"
                    } border`}
                  >
                    <Paragraph className={`text-base mb-0 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                      <MathRenderer content={incorrectAnswer} />
                    </Paragraph>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sizning javobingiz */}
          <div
            className={`mb-8 p-4 rounded-lg ${
              isDarkMode ? "bg-red-900 border-red-700" : "bg-red-50 border-red-200"
            } border`}
          >
            <Text strong className={`text-base block mb-2 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
              <WarningOutlined className="mr-2" />
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
            className={`w-full rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-[1.02] ${
              isDarkMode
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-purple-900/20"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-blue-500/20"
            }`}
          >
            <HomeOutlined className="mr-2" />
            Natijalar sahifasiga qaytish
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card
          className={`text-center p-10 rounded-2xl shadow-2xl border-0 ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-gray-900/30"
              : "bg-gradient-to-br from-white to-gray-50 shadow-gray-200/30"
          }`}
        >
          <Spin size="large" indicator={<LoadingOutlined spin />} />
          <Title level={4} className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            <FileTextOutlined className="mr-2" />
            Savollar yuklanmoqda...
          </Title>
        </Card>
      </div>
    )
  }

  if (isError || !questions?.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <Card
          className={`max-w-md text-center p-8 rounded-2xl shadow-2xl border-0 ${
            isDarkMode
              ? "bg-gradient-to-br from-red-900/20 to-gray-800 shadow-red-900/20"
              : "bg-gradient-to-br from-red-50 to-white shadow-red-200/20"
          }`}
        >
          <ExclamationCircleOutlined className={`text-6xl mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
          <Title level={3} className={isDarkMode ? "text-red-400" : "text-red-500"}>
            <CloseCircleOutlined className="mr-2" />
            Xatolik
          </Title>
          <Paragraph className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            <WarningOutlined className="mr-2" />
            Savollarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
          </Paragraph>
        </Card>
      </div>
    )
  }

  // Hisob-kitoblar
  const progress = (Object.keys(selectedAnswers).length / questions.length) * 100
  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div
      className={`min-h-screen py-5 ${
        isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* Anti-Cheat */}
      {!!token && !!studentName && !!questions?.length && (
        <Cheating
          token={token}
          studentName={studentName}
          answerIds={answerIds}
          unansweredQuestionIds={unansweredIds}
          throttleMs={15000}
          devToolsPollMs={1000}
          onLog={(payload) => {
            console.log("Cheat LOG payload:", payload)
          }}
        />
      )}

      {/* Yuqori panel */}
      <Affix offsetTop={0}>
        <div
          className={`px-6 py-4 shadow-xl backdrop-blur-lg ${
            isDarkMode ? "bg-gray-900/95 border-b border-gray-700/50" : "bg-white/95 border-b border-gray-200/50"
          }`}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <Statistic
                  title={
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                      <BarChartOutlined className="mr-2" />
                      Javob berilgan
                    </span>
                  }
                  value={answeredCount}
                  suffix={`/ ${questions.length}`}
                  valueStyle={{
                    color: isDarkMode ? "#60a5fa" : "#1890ff",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                />
                <Progress
                  percent={Math.round(progress)}
                  style={{ minWidth: "200px" }}
                  strokeColor={
                    isDarkMode ? { "0%": "#3b82f6", "100%": "#8b5cf6" } : { "0%": "#1890ff", "100%": "#722ed1" }
                  }
                  trailColor={isDarkMode ? "#374151" : "#f0f0f0"}
                  format={(percent) => <span style={{ color: isDarkMode ? "#e5e7eb" : "#374151" }}>{percent}%</span>}
                />
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => void handleSubmit(false)}
                  loading={isSubmitting}
                  className={`rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-purple-900/20"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-blue-500/20"
                  }`}
                >
                  <CheckCircleOutlined className="mr-2" />
                  Testni yakunlash
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
              className={`mb-6 rounded-xl ${isDarkMode ? "bg-blue-900 border-blue-700" : "bg-blue-50 border-blue-200"}`}
              message={
                <Text strong className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
                  Muhim eslatma
                </Text>
              }
            />
          </Col>
        </Row>

        <Row gutter={[0, 24]}>
          {questions.map((question, index) => (
            <Col span={24} key={question.id}>
              <Card
                className={`rounded-2xl transition-all duration-300 border-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  selectedAnswers[question.id] !== undefined
                    ? isDarkMode
                      ? "shadow-blue-900/30 border-blue-400 bg-gradient-to-br from-blue-900/20 to-gray-800"
                      : "shadow-blue-200/50 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50"
                    : isDarkMode
                      ? "shadow-gray-800/50 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-500"
                      : "shadow-gray-200/30 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-300"
                }`}
                title={
                  <Space>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                        selectedAnswers[question.id] !== undefined
                          ? isDarkMode
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : isDarkMode
                            ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <Text strong className={`text-lg ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      <EditOutlined className="mr-2" />
                      Savol {index + 1}
                    </Text>
                  </Space>
                }
              >
                <div className="mb-6">
                  <Paragraph
                    className={`text-base leading-relaxed font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
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
                          className={`cursor-pointer rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                            selectedAnswers[question.id] === answer.id
                              ? isDarkMode
                                ? "bg-gradient-to-r from-blue-800/50 to-purple-800/50 border-2 border-blue-400 shadow-lg shadow-blue-900/30"
                                : "bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg shadow-blue-200/40"
                              : isDarkMode
                                ? "bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 hover:border-gray-500 hover:shadow-md"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }`}
                          onClick={() => handleAnswerSelect(question.id, answer.id)}
                        >
                          <Radio value={answer.id}>
                            <Text
                              className={`text-sm font-medium ${
                                selectedAnswers[question.id] === answer.id
                                  ? isDarkMode
                                    ? "text-blue-200"
                                    : "text-blue-800"
                                  : isDarkMode
                                    ? "text-gray-200"
                                    : "text-gray-800"
                              }`}
                            >
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
  )
}
