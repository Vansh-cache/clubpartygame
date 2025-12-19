import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface EntryScreenProps {
  onEnter: () => void;
}

export function EntryScreen({ onEnter }: EntryScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background glows */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-magenta-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles className="w-20 h-20 text-cyan-400" />
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <motion.h1
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            Welcome to the Night 🔥
          </motion.h1>
          <p className="text-xl text-cyan-300">Scan • Vote • Win</p>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onEnter}
          className="w-full py-6 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white text-2xl font-extrabold shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Enter the Party
        </motion.button>

        {/* Subtext */}
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Company Exclusive Event
        </motion.p>
      </motion.div>
    </div>
  );
}
