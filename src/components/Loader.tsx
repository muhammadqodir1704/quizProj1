import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white/90 z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex justify-center items-center">
        <motion.div 
          className="w-15 h-15 border-4 border-gray-200 border-t-green-500 rounded-full shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
