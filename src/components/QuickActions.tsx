"use client"
import { Button, Space, theme } from "antd"
import { motion } from "framer-motion"


export interface QuickActionsProps {
  actions: string[]
  onActionClick: (action: string) => void
  show?: boolean
}

export default function QuickActions({ actions, onActionClick, show = true }: QuickActionsProps) {
  const { token } = theme.useToken()

  if (!show || !actions || actions.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div
        style={{
          padding: 8,
          borderRadius: 12,
          background: token.colorFillTertiary,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 8,
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Space align="center">
          </Space>
          <Space wrap size={[8, 8]}>
            {actions.map((action) => (
              <Button key={action} size="small" type="dashed" shape="round" onClick={() => onActionClick(action)}>
                {action}
              </Button>
            ))}
          </Space>
        </Space>
      </div>
    </motion.div>
  )
}
