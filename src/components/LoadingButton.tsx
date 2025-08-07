import React from "react";
import { motion } from "framer-motion";

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function LoadingButton({ 
  isLoading, 
  children, 
  type = "button",
  onClick,
  disabled = false,
  className = ""
}: LoadingButtonProps) {
  const baseClasses = "relative min-w-[120px] px-6 py-3 bg-blue-800 text-gray-100 border-0 rounded-lg font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-900";
  
  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${className} ${isLoading ? 'text-transparent' : ''}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <motion.div 
          className="absolute w-5 h-5 border-4 border-gray-300 border-t-teal-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : children}
    </motion.button>
  );
}
