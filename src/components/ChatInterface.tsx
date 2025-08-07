import { useEffect, useRef } from "react";
import { Card, Typography, Input, Button, List, Spin, Avatar } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import katex from "katex";
import QuickActions from "./QuickActions";

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  quickActions: string[];
}

export default function ChatInterface({
  messages,
  inputMessage,
  isLoading,
  onSendMessage,
  onInputChange,
  quickActions,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMathContent = (content: string) => {
    const mathDelimiters = [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ];
    let processedText = content;
    mathDelimiters.forEach(({ left, right, display }) => {
      const regex = new RegExp(
        `${left.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.*?)${right.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "g"
      );
      processedText = processedText.replace(regex, (match, math) => {
        try {
          const html = katex.renderToString(math, {
            displayMode: display,
            throwOnError: false,
          });
          return `<span class="katex-wrapper">${html}</span>`;
        } catch (e) {
          return match;
        }
      });
    });
    return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <RobotOutlined className="text-blue-500" />
            <Text strong className="text-lg">AI Yordamchi</Text>
          </div>
        }
        className="rounded-2xl shadow-lg h-full"
      >
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            <List
              dataSource={messages}
              renderItem={(message) => (
                <div
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } mb-3`}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar
                      size="small"
                      icon={message.type === "user" ? <UserOutlined /> : <RobotOutlined />}
                      className={
                        message.type === "user" ? "bg-blue-500" : "bg-green-500"
                      }
                    />
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        message.type === "user"
                          ? "bg-blue-50 border border-blue-200 text-gray-800"
                          : message.type === "system"
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-gray-50 border border-gray-200 text-gray-800"
                      }`}
                    >
                      {message.type === "bot" ? renderMathContent(message.content) : message.content}
                      <Text className="text-xs text-gray-400 block mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                  </motion.div>
                </div>
              )}
            />
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                  <Spin size="small" />
                  <Text className="text-gray-600">Yozmoqda...</Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <QuickActions
            actions={quickActions}
            onActionClick={onInputChange}
            show={messages.length <= 2}
          />

          {/* Input */}
          <div className="flex space-x-2">
            <TextArea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Savolingizni yozing..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              disabled={isLoading}
              className="flex-1 rounded-l-lg border-r-0"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-r-lg bg-blue-500 hover:bg-blue-600 border-0"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}