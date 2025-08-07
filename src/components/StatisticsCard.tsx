import { Card, Typography, Space, Row, Col, Statistic, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

interface TestResult {
  student_name: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  wrong_answer_questions: number[];
}

interface StatisticsCardProps {
  testResult: TestResult;
  onQuestionClick: (questionNumber: number) => void;
  isMobile?: boolean;
}

export default function StatisticsCard({ testResult, onQuestionClick, isMobile = false }: StatisticsCardProps) {
  const doughnutData = {
    labels: ["To'g'ri", "Xato", "Javobsiz"],
    datasets: [
      {
        data: [
          testResult.correct_answers,
          testResult.wrong_answer_questions.length,
          testResult.total_questions - testResult.correct_answers - testResult.wrong_answer_questions.length,
        ],
        backgroundColor: ["#52c41a", "#ff4d4f", "#bfbfbf"],
        borderColor: ["#52c41a", "#ff4d4f", "#bfbfbf"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#333",
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`rounded-2xl shadow-lg mb-6 ${isMobile ? 'mx-2' : ''}`}>
        <div className="text-center mb-6">
          <Title level={2} className="text-blue-600 mb-2">
            Test Natijalari
          </Title>
          <Text className="text-lg text-gray-600">
            {testResult.student_name}ning test natijalari
          </Text>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="text-center bg-green-50 border-green-200">
              <Statistic
                title="To'g'ri javoblar"
                value={testResult.correct_answers}
                suffix={`/ ${testResult.total_questions}`}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center bg-red-50 border-red-200">
              <Statistic
                title="Xato javoblar"
                value={testResult.wrong_answer_questions.length}
                valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center bg-blue-50 border-blue-200">
              <Statistic
                title="Natija"
                value={Math.round(testResult.score_percentage)}
                suffix="%"
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
                prefix={<PieChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={12}>
            <div className="h-64">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <Title level={4} className="text-gray-800">Xato javoblar tahlili</Title>
              {testResult.wrong_answer_questions.length > 0 ? (
                                  <div className="space-y-2">
                  <Text className="text-gray-600 block mb-3">
                    Quyidagi savollarda xatolik qildingiz:
                  </Text>
                  <Space wrap>
                    {testResult.wrong_answer_questions.map((questionNumber) => (
                      <Button
                        key={questionNumber}
                        type="primary"
                        ghost
                        size="small"
                        onClick={() => onQuestionClick(questionNumber)}
                        className="rounded-lg border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all duration-200"
                      >
                        📝 Savol {questionNumber}
                      </Button>
                    ))}
                  </Space>
                  <Text className="text-xs text-gray-400 block mt-2">
                    💡 Savol raqamiga bosib, batafsil tahlilni ko'ring
                  </Text>
                </div>
              ) : (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircleOutlined className="text-4xl text-green-500 mb-2" />
                  <Text className="text-green-600 font-medium block">
                    Ajoyib! Barcha savollarga to'g'ri javob berdingiz! 🌟
                  </Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
}