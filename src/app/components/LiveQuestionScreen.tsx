import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Search, Lock, CircleCheck } from "lucide-react";

interface LiveQuestionScreenProps {
  questionId: string;
  question: string;
  timeLimit: number;
  employees: string[];
  currentUser: string;
  hasAlreadyVoted?: boolean;
  onVote: (selectedPerson: string) => void;
  onTimeEnd?: () => void;
  activatedAt?: string | Date; // When the question was activated (for synchronized timer)
}

export function LiveQuestionScreen({
  questionId,
  question,
  timeLimit,
  employees,
  currentUser,
  hasAlreadyVoted = false,
  onVote,
  onTimeEnd,
  activatedAt,
}: LiveQuestionScreenProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(hasAlreadyVoted);
  const [votedForPerson, setVotedForPerson] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // Calculate synchronized time left based on activation time
  useEffect(() => {
    let timeEndCalled = false;
    let timer: NodeJS.Timeout | null = null;
    
    const calculateTimeLeft = () => {
      if (!activatedAt) {
        // Fallback to timeLimit if no activation time
        return timeLimit;
      }
      
      const activationTime = new Date(activatedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - activationTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      
      return remaining;
    };

    // Calculate initial time
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    setIsExpired(initialTime === 0);

    // Update every second for synchronized countdown
    timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsExpired(true);
        // Call onTimeEnd only once
        if (!timeEndCalled && onTimeEnd) {
          timeEndCalled = true;
          onTimeEnd();
        }
      }
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activatedAt, timeLimit, onTimeEnd]);

  // Reset state when question changes - ALWAYS reset for new question
  useEffect(() => {
    // Always reset voting state for new question (unless user already voted)
    if (!hasAlreadyVoted) {
      setSearchQuery("");
      setSelectedPerson("");
      setVotedForPerson("");
      setHasVoted(false);
    } else {
      setHasVoted(true);
    }
    setIsExpired(false);
  }, [questionId, hasAlreadyVoted]);

  // Filter employees (exclude current user) - memoize for performance
  const availableEmployees = employees.filter((emp) => emp !== currentUser);

  // Optimized filtered list based on search - use useMemo for better performance
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableEmployees;
    }
    const queryLower = searchQuery.toLowerCase().trim();
    return availableEmployees.filter((emp) =>
      emp.toLowerCase().includes(queryLower)
    );
  }, [availableEmployees, searchQuery]);

  // Handle clicking on a name to fill the input
  const handleNameClick = (name: string) => {
    setSelectedPerson(name);
    setSearchQuery(name); // Fill the search input
  };

  const handleVote = () => {
    if (selectedPerson) {
      const personToVote = selectedPerson.trim();
      // Store the person we voted for BEFORE calling onVote
      setVotedForPerson(personToVote);
      setHasVoted(true);
      // Keep selectedPerson so it shows in the display
      setSelectedPerson(personToVote);
      onVote(personToVote);
    }
  };

  const progress = (timeLeft / timeLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 p-4 relative overflow-hidden">
      {/* Urgency glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6 pt-4">
        {/* Timer */}
        <motion.div
          className="bg-black/70 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/50"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              <span className="text-white font-bold text-lg">Time Remaining</span>
            </div>
            <motion.span
              className={`text-3xl font-black ${
                timeLeft < 10 ? "text-red-400" : "text-cyan-400"
              }`}
              animate={timeLeft < 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {timeLeft}s
            </motion.span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                timeLeft < 10
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500"
              }`}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question */}
        <motion.div
          className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-white text-center leading-tight">
            {question}
          </h2>
        </motion.div>

        {/* Vote confirmation state */}
        <AnimatePresence>
          {hasVoted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 backdrop-blur-lg rounded-3xl p-12 border-2 border-green-500/50 text-center space-y-4"
            >
              <CircleCheck className="w-20 h-20 text-green-400 mx-auto" />
              <h3 className="text-3xl font-black text-white">Vote Locked! 🔒</h3>
              <p className="text-green-300 text-lg">
                You voted for: <span className="font-bold text-white text-xl">{votedForPerson || selectedPerson}</span>
              </p>
              <p className="text-gray-400">Waiting for results...</p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search for someone..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Update search query immediately for instant filtering
                    setSearchQuery(value);
                    // Clear selectedPerson when user starts typing new search (unless it matches)
                    if (!value) {
                      setSelectedPerson("");
                    } else if (selectedPerson && !value.toLowerCase().includes(selectedPerson.toLowerCase())) {
                      setSelectedPerson("");
                    }
                  }}
                  disabled={isExpired || timeLeft === 0 || hasVoted}
                  className={`w-full pl-14 pr-6 py-5 bg-black/50 backdrop-blur-lg border-2 border-cyan-500/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all text-lg ${(isExpired || timeLeft === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              {/* Employee list */}
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-cyan-500/30 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-800">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((person, index) => (
                    <motion.button
                      key={person}
                      onClick={() => handleNameClick(person)}
                      disabled={isExpired || timeLeft === 0}
                      className={`w-full px-6 py-4 text-left text-white text-lg font-semibold border-b border-cyan-500/20 last:border-b-0 transition-all ${
                        selectedPerson === person
                          ? "bg-cyan-500/30 border-l-4 border-l-cyan-400"
                          : "hover:bg-cyan-500/10"
                      } ${(isExpired || timeLeft === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={!isExpired && timeLeft > 0 ? { x: 4 } : {}}
                    >
                      {person}
                    </motion.button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No matches found
                  </div>
                )}
              </div>

              {/* Vote button */}
              <motion.button
                onClick={handleVote}
                disabled={!selectedPerson || timeLeft === 0 || isExpired}
                className={`w-full py-6 rounded-2xl text-2xl font-black transition-all ${
                  selectedPerson && timeLeft > 0 && !isExpired
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:shadow-[0_0_60px_rgba(6,182,212,0.9)]"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={
                  selectedPerson && timeLeft > 0 && !isExpired ? { scale: 1.02 } : {}
                }
                whileTap={selectedPerson && timeLeft > 0 && !isExpired ? { scale: 0.98 } : {}}
              >
                {timeLeft === 0 || isExpired ? (
                  <>
                    <Lock className="inline-block w-6 h-6 mr-2" />
                    Voting Closed
                  </>
                ) : (
                  <>
                    <Lock className="inline-block w-6 h-6 mr-2" />
                    Lock My Vote 🔒
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}