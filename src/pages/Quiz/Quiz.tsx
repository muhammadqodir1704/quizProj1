"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  Radio,
  Button,
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
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
  EditOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import {
  fetchTestQuestions,
  submitTest,
  fetchTestDetail,
  parseTimeLimit,
  type Question,
  type TestDetail,
} from "../../api/request.api"
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
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  const {
    data: testDetail,
    isLoading: isTestDetailLoading,
    isError: isTestDetailError,
  } = useQuery<TestDetail>({
    queryKey: ["test-detail", token],
    queryFn: () => fetchTestDetail(token!),
    enabled: !!token && !questionDetails,
  })

  useEffect(() => {
    if (testDetail && timeLeft === null) {
      const totalSeconds = parseTimeLimit(testDetail.time_limit)
      setTimeLeft(totalSeconds)
    }

    if (questions && questions.length > 0 && !questionDetails && !isTimerActive && timeLeft !== null) {
      setIsTimerActive(true)
    }

    if (isTimerActive && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
    } else if (isTimerActive && timeLeft === 0) {
      handleSubmit(true)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, isTimerActive, questions, questionDetails, testDetail])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (testDetail && parseTimeLimit(testDetail.time_limit) >= 3600) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft === null || !testDetail) return isDarkMode ? "#10b981" : "#059669"

    const totalSeconds = parseTimeLimit(testDetail.time_limit)
    const criticalThreshold = Math.max(300, totalSeconds * 0.1)
    const warningThreshold = Math.max(600, totalSeconds * 0.2)

    if (timeLeft <= criticalThreshold) return isDarkMode ? "#ef4444" : "#dc2626"
    if (timeLeft <= warningThreshold) return isDarkMode ? "#f59e0b" : "#d97706"
    return isDarkMode ? "#10b981" : "#059669"
  }

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

    setIsTimerActive(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
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
      setIsTimerActive(true)
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
        </Card>
      </div>
    )
  }

  if (isLoading || isTestDetailLoading) {
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
            {isLoading ? "Savollar yuklanmoqda..." : "Test ma'lumotlari yuklanmoqda..."}
          </Title>
        </Card>
      </div>
    )
  }

  if (isError || isTestDetailError || !questions?.length || !testDetail) {
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
            {isTestDetailError
              ? "Test ma'lumotlarini yuklashda xatolik yuz berdi."
              : "Savollarni yuklashda xatolik yuz berdi."}{" "}
            Iltimos, qayta urinib ko'ring.
          </Paragraph>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen py-5 ${
        isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
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
                      <ClockCircleOutlined className="mr-2" />
                      Qolgan vaqt
                    </span>
                  }
                  value={timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                  valueStyle={{
                    color: getTimerColor(),
                    fontSize: "24px",
                    fontWeight: "700",
                    fontFamily: "monospace",
                  }}
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
