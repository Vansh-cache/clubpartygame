import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Clock, Zap, Bell } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface WaitingScreenProps {
  userName: string;
  onActiveQuestion?: (question: any) => void;
}

export function WaitingScreen({ userName, onActiveQuestion }: WaitingScreenProps) {
  const [timeUntilNextQuestion, setTimeUntilNextQuestion] = useState<number | null>(null);
  const notificationShownRef = useRef(false);
  const scheduledQuestionIdRef = useRef<string | null>(null);

  // Poll for active questions and scheduled questions
  useEffect(() => {
    const checkActiveQuestion = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/questions/active`);
        if (response.data) {
          if (response.data.isActive) {
            // Question is active now - pass it to parent immediately
            if (onActiveQuestion) {
              onActiveQuestion(response.data);
            }
            setTimeUntilNextQuestion(null);
            notificationShownRef.current = false;
            scheduledQuestionIdRef.current = null;
          } else if (response.data.isScheduled && response.data.scheduledAt) {
            // Question is scheduled, calculate time until it appears
            const scheduledTime = new Date(response.data.scheduledAt).getTime();
            const now = Date.now();
            const timeLeft = Math.max(0, scheduledTime - now);
            const secondsLeft = Math.floor(timeLeft / 1000);
            
            // Reset notification flag if this is a different question
            const questionId = response.data._id || response.data.id;
            if (scheduledQuestionIdRef.current !== questionId) {
              notificationShownRef.current = false;
              scheduledQuestionIdRef.current = questionId;
            }
            
            setTimeUntilNextQuestion(secondsLeft);
            
            // Show notification exactly 30 seconds before (only once per question)
            if (secondsLeft === 30 && !notificationShownRef.current) {
              notificationShownRef.current = true;
              
              // Request browser notification permission and show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🎉 New Question Coming Soon!', {
                  body: 'A new question will appear in 30 seconds! Get ready to vote!',
                  icon: '/favicon.ico',
                  tag: 'question-notification-30s',
                  requireInteraction: false,
                });
              } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission().then((permission) => {
                  if (permission === 'granted') {
                    new Notification('🎉 New Question Coming Soon!', {
                      body: 'A new question will appear in 30 seconds! Get ready to vote!',
                      icon: '/favicon.ico',
                      tag: 'question-notification-30s',
                      requireInteraction: false,
                    });
                  }
                });
              }
            }
            
            // If time has passed or is very close (within 1 second), question should be active
            if (secondsLeft <= 1) {
              notificationShownRef.current = false;
              scheduledQuestionIdRef.current = null;
              // Immediately check for active question and trigger it
              setTimeout(async () => {
                try {
                  const activeResponse = await axios.get(`${API_BASE_URL}/questions/active`);
                  if (activeResponse.data && activeResponse.data.isActive) {
                    if (onActiveQuestion) {
                      onActiveQuestion(activeResponse.data);
                    }
                    setTimeUntilNextQuestion(null);
                  }
                } catch (error) {
                  console.error('Error fetching active question:', error);
                }
              }, 100);
            }
          } else {
            setTimeUntilNextQuestion(null);
            notificationShownRef.current = false;
            scheduledQuestionIdRef.current = null;
          }
        } else {
          setTimeUntilNextQuestion(null);
          notificationShownRef.current = false;
          scheduledQuestionIdRef.current = null;
        }
      } catch (error) {
        // No active question or error - this is normal
        setTimeUntilNextQuestion(null);
      }
    };

    // Check immediately
    checkActiveQuestion();

    // Then check every second for accurate countdown
    const interval = setInterval(checkActiveQuestion, 1000);

    return () => clearInterval(interval);
  }, [onActiveQuestion]);

  // Note: Lucky draw is now handled in App.tsx, not here
  // This listener is kept for backward compatibility but shouldn't clear localStorage
  // The App.tsx listener is the primary handler
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8 max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome message */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-cyan-400 text-lg mb-2">Hey there,</p>
          <h2 className="text-4xl font-black text-white">{userName}!</h2>
        </motion.div>

        {/* Pulsing icon */}
        <motion.div
          className="flex justify-center"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            <Clock className="w-24 h-24 text-cyan-400" />
            <motion.div
              className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>

        {/* Time until next question */}
            {timeUntilNextQuestion !== null && timeUntilNextQuestion > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/50"
              >
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <p className="text-yellow-300 font-bold text-lg">Next Question In:</p>
                </div>
                <motion.p
                  className="text-yellow-400 text-4xl font-black"
                  animate={{ scale: timeUntilNextQuestion <= 30 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 1, repeat: timeUntilNextQuestion <= 30 ? Infinity : 0 }}
                >
                  {timeUntilNextQuestion <= 60
                    ? `${timeUntilNextQuestion}s`
                    : `${Math.floor(timeUntilNextQuestion / 60)}m ${timeUntilNextQuestion % 60}s`}
                </motion.p>
                {timeUntilNextQuestion <= 30 && (
                  <motion.p
                    className="text-yellow-300 text-sm mt-2 font-semibold"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Get ready! 🎉
                  </motion.p>
                )}
              </motion.div>
            )}

        {/* Main message */}
        <div className="space-y-4">
          <motion.h3
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {timeUntilNextQuestion !== null ? 'Next challenge coming soon...' : 'Next challenge dropping soon...'}
          </motion.h3>

          <motion.p
            className="text-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Stay tuned for the next round 🎶
          </motion.p>
        </div>

        {/* Animated wave */}
        <motion.div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-12 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
              animate={{
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Energy indicator */}
        <motion.div
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-center space-x-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <p className="text-white font-bold">Energy Level: MAX</p>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Get ready to make your choice!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
