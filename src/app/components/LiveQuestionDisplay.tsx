import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, Sparkles, Bell } from "lucide-react";
import axios from "axios";
import { JackpotScreen } from "./JackpotScreen";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface Question {
  id: string;
  _id?: string;
  text: string;
  duration: number;
  isActive: boolean;
  isCompleted?: boolean;
  activatedAt?: string | Date;
}

interface Winner {
  _id?: string;
  questionId: string;
  questionText: string;
  winner: string;
  voteCount: number;
  totalVotes?: number;
}

export function LiveQuestionDisplay() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [scheduledQuestion, setScheduledQuestion] = useState<Question | null>(null);
  const [timeUntilScheduled, setTimeUntilScheduled] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showingResult, setShowingResult] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showJackpot, setShowJackpot] = useState(false);
  const [jackpotParticipants, setJackpotParticipants] = useState<string[]>([]);

  // Fetch employees for jackpot
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/employees`);
        const employeeNames = response.data.map((emp: any) => emp.name);
        setJackpotParticipants(employeeNames);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Listen for jackpot trigger
  useEffect(() => {
    let lastJackpotTimestamp = 0;

    const checkJackpot = () => {
      const jackpotActive = localStorage.getItem('jackpotActivated');
      if (jackpotActive) {
        const timestamp = parseInt(jackpotActive);
        if (timestamp > lastJackpotTimestamp) {
          console.log('📺 Live Display: Jackpot activated! Timestamp:', timestamp);
          lastJackpotTimestamp = timestamp;
          setShowJackpot(true);
          
          // Hide jackpot after 30 seconds
          setTimeout(() => {
            console.log('📺 Live Display: Hiding jackpot after 30 seconds');
            setShowJackpot(false);
            localStorage.removeItem('jackpotActivated');
          }, 30000);
        }
      }
    };

    const handleJackpotEvent = () => {
      console.log('📺 Live Display: Jackpot custom event received!');
      checkJackpot();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jackpotActivated') {
        console.log('📺 Live Display: Jackpot storage event detected!');
        checkJackpot();
      }
    };

    window.addEventListener('jackpotActivated', handleJackpotEvent);
    window.addEventListener('storage', handleStorageChange);
    
    // Check immediately and poll every 500ms for fast response
    checkJackpot();
    const interval = setInterval(checkJackpot, 500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('jackpotActivated', handleJackpotEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Poll for active and scheduled questions
  useEffect(() => {
    const checkActiveQuestion = async () => {
      // Don't check for questions if jackpot is showing
      if (showJackpot) {
        return;
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/questions/active`);
        if (response.data && response.data.isActive) {
          // Question is active
          const question = response.data;
          
          // If it's a new question, reset states
          if (!currentQuestion || currentQuestion.id !== (question._id || question.id)) {
            console.log('📺 Live Display: New active question detected!', question);
            setCurrentQuestion({
              id: question._id || question.id,
              _id: question._id,
              text: question.text,
              duration: question.duration,
              isActive: true,
              activatedAt: question.activatedAt,
            });
            setScheduledQuestion(null); // Clear scheduled when active
            setTimeUntilScheduled(null);
            setShowingResult(false);
            setWinner(null);
          }
        } else if (response.data && response.data.isScheduled && response.data.scheduledAt) {
          // Question is scheduled, show countdown
          const question = response.data;
          const scheduledTime = new Date(question.scheduledAt).getTime();
          const now = Date.now();
          const timeLeft = Math.max(0, scheduledTime - now);
          const secondsLeft = Math.floor(timeLeft / 1000);
          
          console.log('📺 Live Display: Scheduled question detected, seconds left:', secondsLeft);
          
          setScheduledQuestion({
            id: question._id || question.id,
            _id: question._id,
            text: question.text,
            duration: question.duration,
            isActive: false,
            activatedAt: question.scheduledAt,
          });
          setTimeUntilScheduled(secondsLeft);
          setCurrentQuestion(null); // Clear active when showing scheduled
        } else if (response.data && response.data.isCompleted && currentQuestion) {
          // Question completed, fetch results
          console.log('📺 Live Display: Question completed, fetching results...');
          fetchResults(currentQuestion.id);
        } else {
          // No active or scheduled question
          if (!showingResult) {
            setCurrentQuestion(null);
            setScheduledQuestion(null);
            setTimeUntilScheduled(null);
            setTimeLeft(0);
          }
        }
      } catch (error) {
        console.error('Error checking active question:', error);
      }
    };

    // Listen for localStorage events (when admin activates a question)
    const handleStorageChange = (e: StorageEvent) => {
      // When admin activates a question, trigger immediate check
      if (e.key === 'questionActivated' || e.key === 'questionCompleted') {
        console.log('📺 Live Display: Storage event detected:', e.key);
        checkActiveQuestion();
      }
    };

    // Listen for custom events
    const handleQuestionActivated = () => {
      console.log('📺 Live Display: Question activated event received!');
      checkActiveQuestion();
    };

    const handleQuestionCompleted = () => {
      console.log('📺 Live Display: Question completed event received!');
      checkActiveQuestion();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('questionActivated', handleQuestionActivated);
    window.addEventListener('questionCompleted', handleQuestionCompleted);

    // Check immediately and then every 1 second (faster polling)
    checkActiveQuestion();
    const interval = setInterval(checkActiveQuestion, 1000); // Faster polling: 1 second

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('questionActivated', handleQuestionActivated);
      window.removeEventListener('questionCompleted', handleQuestionCompleted);
    };
  }, [currentQuestion, showingResult, showJackpot]);

  // Calculate time left based on activation time
  useEffect(() => {
    if (!currentQuestion || !currentQuestion.activatedAt || showingResult) {
      return;
    }

    const calculateTimeLeft = () => {
      const activationTime = new Date(currentQuestion.activatedAt!).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - activationTime) / 1000);
      const remaining = Math.max(0, currentQuestion.duration - elapsed);
      return remaining;
    };

    // Calculate initial time
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        // Time's up, fetch results
        fetchResults(currentQuestion.id);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showingResult]);

  // Live vote counts removed - only showing final winner

  const fetchResults = async (questionId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/votes/results/${questionId}`);
      if (response.data && response.data.winner) {
        console.log('📺 Live Display: Showing results for winner:', response.data.winner);
        setWinner({
          questionId,
          questionText: currentQuestion?.text || '',
          winner: response.data.winner,
          voteCount: response.data.maxVotes,
          totalVotes: response.data.totalVotes,
        });
        setShowingResult(true);
        
        // Show results for 10 seconds, then go back to waiting
        console.log('📺 Live Display: Results will show for 10 seconds...');
        setTimeout(() => {
          console.log('📺 Live Display: Returning to waiting screen');
          setShowingResult(false);
          setWinner(null);
          setCurrentQuestion(null);
          setTimeLeft(0);
        }, 10000);
      } else {
        console.warn('📺 Live Display: No winner found in results');
      }
    } catch (error) {
      console.error('📺 Live Display: Error fetching results:', error);
    }
  };

  const progress = currentQuestion ? (timeLeft / currentQuestion.duration) * 100 : 0;

  // Showing jackpot
  if (showJackpot) {
    return (
      <JackpotScreen
        participants={jackpotParticipants}
        isAdmin={false}
        autoStart={false}
      />
    );
  }

  // Showing scheduled question countdown
  if (scheduledQuestion && timeUntilScheduled !== null && timeUntilScheduled > 0 && !showingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <motion.div
          className="relative z-10 max-w-4xl w-full text-center space-y-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Bell Icon */}
          <motion.div
            className="flex justify-center"
            animate={{
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <Bell className="w-32 h-32 text-yellow-400" />
          </motion.div>

          {/* Countdown Box */}
          <motion.div
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-12 border-4 border-yellow-500/50"
            animate={{
              boxShadow: [
                "0 0 20px rgba(234, 179, 8, 0.3)",
                "0 0 40px rgba(234, 179, 8, 0.6)",
                "0 0 20px rgba(234, 179, 8, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Bell className="w-12 h-12 text-yellow-400" />
              <h2 className="text-4xl md:text-5xl font-bold text-yellow-300">
                Next Question In:
              </h2>
            </div>
            
            <motion.div
              className="text-9xl md:text-[12rem] font-black text-yellow-400"
              animate={
                timeUntilScheduled <= 30
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: timeUntilScheduled <= 30 ? Infinity : 0,
              }}
            >
              {timeUntilScheduled}s
            </motion.div>
            
            {timeUntilScheduled <= 30 && (
              <motion.p
                className="text-yellow-300 text-3xl mt-6 font-semibold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Get ready! 🎉
              </motion.p>
            )}
          </motion.div>

          {/* Question Preview */}
          <motion.div
            className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-2xl mb-3">Upcoming Question:</p>
            <p className="text-4xl font-bold text-white">{scheduledQuestion.text}</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Showing results
  if (showingResult && winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Celebration particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-5xl w-full text-center space-y-12"
        >
          {/* Trophy Icon */}
          <motion.div
            className="flex justify-center"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Trophy className="w-40 h-40 text-yellow-400" />
          </motion.div>

          {/* Winner Announcement */}
          <div className="space-y-6">
            <motion.h1
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              🎉 WINNER! 🎉
            </motion.h1>

            <motion.div
              className="bg-black/50 backdrop-blur-lg rounded-3xl p-12 border-4 border-yellow-500/50"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-yellow-300 text-3xl mb-4 font-semibold">
                {winner.questionText}
              </p>
              <motion.p
                className="text-8xl font-black text-white mb-6"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(250,204,21,0.5)",
                    "0 0 40px rgba(250,204,21,0.8)",
                    "0 0 20px rgba(250,204,21,0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {winner.winner}
              </motion.p>
              <div className="flex items-center justify-center space-x-8 text-2xl text-gray-300">
                <div>
                  <span className="font-bold text-yellow-400">{winner.voteCount}</span> votes
                </div>
                {winner.totalVotes && (
                  <div>
                    Total: <span className="font-bold">{winner.totalVotes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[...Array(5)].map((_, i) => (
              <Sparkles
                key={i}
                className="w-16 h-16 text-yellow-400"
                style={{
                  animation: `pulse ${1 + i * 0.2}s infinite`,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Showing active question
  if (currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 p-8 relative overflow-hidden">
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(168,85,247,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto space-y-12 pt-12">
          {/* Timer */}
          <motion.div
            className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 border-4 border-cyan-500/50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Clock className="w-12 h-12 text-cyan-400" />
                <span className="text-white font-bold text-4xl">Time Remaining</span>
              </div>
              <motion.span
                className={`text-8xl font-black ${
                  timeLeft < 10 ? "text-red-400" : "text-cyan-400"
                }`}
                animate={timeLeft < 10 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {timeLeft}s
              </motion.span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  timeLeft < 10 ? "bg-red-500" : "bg-cyan-500"
                }`}
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </motion.div>

          {/* Question */}
          <motion.div
            className="bg-black/70 backdrop-blur-lg rounded-3xl p-16 border-4 border-purple-500/50 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h2
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-8"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              style={{
                backgroundSize: "200% auto",
              }}
            >
              {currentQuestion.text}
            </motion.h2>
          </motion.div>

        </div>
      </div>
    );
  }

  // Waiting for question
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -150, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 text-center space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Clock className="w-40 h-40 text-cyan-400" />
        </motion.div>

        <div className="space-y-6">
          <motion.h3
            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Waiting for Next Question...
          </motion.h3>

          <motion.p
            className="text-3xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The next challenge will appear here 🎯
          </motion.p>
        </div>

        {/* Animated wave */}
        <motion.div className="flex justify-center space-x-4">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-20 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
              animate={{
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

