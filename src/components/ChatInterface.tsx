"use client"

import { useEffect, useRef } from "react"
import { Card, Typography, Input, Button, List, Spin, Avatar, theme, Space, Flex } from "antd"
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"
import katex from "katex"
import QuickActions from "./QuickActions"

const { Text } = Typography
const { TextArea } = Input

export interface Message {
  id: string
  type: "user" | "bot" | "system"
  content: string
  timestamp: Date
}

export interface ChatInterfaceProps {
  messages: Message[]
  inputMessage: string
  isLoading: boolean
  onSendMessage: () => void
  onInputChange: (value: string) => void
  quickActions: string[]
}

export default function ChatInterface({
  messages,
  inputMessage,
  isLoading,
  onSendMessage,
  onInputChange,
  quickActions,
}: ChatInterfaceProps) {
  const { token } = theme.useToken()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderMathContent = (content: string) => {
    const mathDelimiters = [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ]
    let processedText = content
    mathDelimiters.forEach(({ left, right, display }) => {
      const regex = new RegExp(
        `${left.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.*?)${right.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "g",
      )
      processedText = processedText.replace(regex, (match, math) => {
        try {
          const html = katex.renderToString(math, {
            displayMode: display,
            throwOnError: false,
          })
          return `<span class="katex-wrapper">${html}</span>`
        } catch (e) {
          return match
        }
      })
    })
    return <div dangerouslySetInnerHTML={{ __html: processedText }} />
  }

  const bubbleStyles = (type: Message["type"]) => {
    switch (type) {
      case "user":
        return {
          background: token.colorPrimaryBg,
          border: `1px solid ${token.colorPrimaryBorder}`,
          color: token.colorText,
        }
      case "system":
        return {
          background: token.colorSuccessBg,
          border: `1px solid ${token.colorSuccessBorder}`,
          color: token.colorSuccessText,
        }
      default:
        return {
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          color: token.colorText,
        }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card
        title={
          <Space align="center">
            <RobotOutlined style={{ color: token.colorPrimary }} />
            <Text strong style={{ fontSize: 16 }}>
              {"AI Yordamchi"}
            </Text>
          </Space>
        }
        styles={{
          body: { padding: 16 },
        }}
        style={{ borderRadius: 16, boxShadow: token.boxShadow }}
      >
        <Flex vertical gap={12} style={{ height: 420 }}>
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            <List
              dataSource={messages}
              renderItem={(message) => {
                const isUser = message.type === "user"
                const isSystem = message.type === "system"
                const styles = bubbleStyles(message.type)
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        maxWidth: "80%",
                        flexDirection: isUser ? "row-reverse" : "row",
                      }}
                    >
                      <Avatar
                        size="small"
                        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                        style={{
                          backgroundColor: isUser
                            ? token.colorPrimary
                            : isSystem
                              ? token.colorSuccess
                              : token.colorInfo,
                          color: "#fff",
                          flex: "0 0 auto",
                        }}
                      />
                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: 14,
                          boxShadow: token.boxShadowTertiary,
                          background: styles.background,
                          border: styles.border,
                          color: styles.color,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                        }}
                      >
                        {message.type === "bot" ? renderMathContent(message.content) : message.content}
                      </div>
                    </motion.div>
                  </div>
                )
              }}
            />

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 14,
                    boxShadow: token.boxShadowTertiary,
                  }}
                >
                  <Spin size="small" />
                  <Text type="secondary">{"Yozmoqda..."}</Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          <QuickActions actions={quickActions} onActionClick={onInputChange} show={messages.length <= 2} />

    
          <div style={{ display: "flex", gap: 8 }}>
            <TextArea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  onSendMessage()
                }
              }}
              placeholder="Savolingizni yozing..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            />
          </div>
        </Flex>
      </Card>
    </motion.div>
  )
}
