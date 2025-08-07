import { Button, Space } from "antd";
import { motion } from "framer-motion";

interface QuickActionsProps {
  actions: string[];
  onActionClick: (action: string) => void;
  show: boolean;
}

export default function QuickActions({ actions, onActionClick, show }: QuickActionsProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Space wrap size={[8, 8]}>
        {actions.map((action, idx) => (
          <Button
            key={idx}
            type="dashed"
            onClick={() => onActionClick(action)}
            className="rounded-2xl border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            {action}
          </Button>
        ))}
      </Space>
    </motion.div>
  );
}