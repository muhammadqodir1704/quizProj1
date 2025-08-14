import { Card, Typography, Button, Tag, Row, Col } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import { processMathText } from "../utils/mathConverter";
import { MathRenderer } from "./MathRenderer";
import "../styles/MathRenderer.css";

const { Title, Text, Paragraph } = Typography;

interface QuestionOption {
  id: number;
  text: string;
  letter: string;
}

interface QuestionData {
  question_text: string;
  correct_answer: string;
  incorrect_answers: string[]; // Yangi maydon qo'shildi
}

interface QuestionDetailProps {
  question: QuestionData;
  questionNumber: number; 
  onBack: () => void;
  onNextQuestion?: (questionNumber: number) => void;
  onPrevQuestion?: (questionNumber: number) => void;
  totalQuestions: number;
}

export default function QuestionDetail({ 
  question, 
  questionNumber,
  onBack, 
  onNextQuestion, 
  onPrevQuestion,
  totalQuestions 
}: QuestionDetailProps) {
  
  const renderMathText = (text: string) => {
    if (!text) return null;
    
    try {
      // Debug uchun
      console.log('Original text:', text);
      
      // Matematik ifodalarni to'g'ri formatga o'tkazish
      const processedText = processMathText(text);
      console.log('Processed text:', processedText);
      
      return <MathRenderer content={processedText} />;
    } catch (error) {
      console.warn('Math rendering error:', error);
      // Agar MathRenderer ishlamasa, oddiy matn qaytarish
      return <span style={{ color: '#ff4d4f', fontFamily: 'monospace' }}>{text}</span>;
    }
  };

  // Matematik ifodalarni wrapper div bilan o'rash
  const MathWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`math-wrapper ${className}`} style={{ minHeight: '24px' }}>
      {children}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      {/* Header */}
      <Card className="mb-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="flex items-center"
          >
            Orqaga qaytish
          </Button>
          <div className="text-center">
            <Title level={3} className="mb-0">
              Savol #{questionNumber} Tahlili
            </Title>
            <Text className="text-gray-500">
              {questionNumber} / {totalQuestions}
            </Text>
          </div>
          <div className="w-24"> {/* Placeholder for symmetry */}</div>
        </div>
      </Card>

      {/* Question Content */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="rounded-2xl shadow-lg mb-6">
            <Title level={4} className="text-blue-600 mb-4">
              Savol matni:
            </Title>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <MathWrapper className="text-lg leading-relaxed">
                {renderMathText(question.question_text)}
              </MathWrapper>
            </div>

            {/* To'g'ri javob */}
            <Title level={4} className="mb-4">
              To'g'ri javob:
            </Title>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-green-500">
                  ✓
                </div>
                <div className="flex-1">
                  <MathWrapper className="text-base text-green-800 font-medium">
                    {renderMathText(question.correct_answer)}
                  </MathWrapper>
                  <Tag color="green" icon={<CheckCircleOutlined />} className="mt-2">
                    To'g'ri javob
                  </Tag>
                </div>
              </div>
            </div>

            {/* Noto'g'ri javoblar */}
            {question.incorrect_answers && question.incorrect_answers.length > 0 && (
              <>
                <Title level={4} className="mb-4">
                  Noto'g'ri javoblar:
                </Title>
                <div className="space-y-3">
                  {question.incorrect_answers.map((incorrectAnswer, index) => (
                    <div 
                      key={index}
                      className="bg-red-50 p-4 rounded-lg border-2 border-red-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-red-500">
                          ✗
                        </div>
                        <div className="flex-1">
                          <MathWrapper className="text-base text-red-800 font-medium">
                            {renderMathText(incorrectAnswer)}
                          </MathWrapper>
                          <Tag color="red" icon={<CloseCircleOutlined />} className="mt-2">
                            Noto'g'ri javob
                          </Tag>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Navigation */}
      <Card className="rounded-2xl shadow-lg">
        <div className="flex justify-between items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => onPrevQuestion?.(questionNumber - 1)}
            disabled={questionNumber <= 1}
            className="flex items-center"
          >
            Oldingi savol
          </Button>
          
          <Text className="text-gray-500">
            {questionNumber} / {totalQuestions}
          </Text>
          
          <Button
            type="primary"
            onClick={() => onNextQuestion?.(questionNumber + 1)}
            disabled={questionNumber >= totalQuestions}
            className="flex items-center"
          >
            Keyingi savol
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}