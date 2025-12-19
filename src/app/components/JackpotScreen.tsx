import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

interface JackpotScreenProps {
  participants: string[];
  isAdmin?: boolean;
  onStartRoll?: () => void;
  autoStart?: boolean;
}

export function JackpotScreen({
  participants,
  isAdmin = false,
  onStartRoll,
  autoStart = false,
}: JackpotScreenProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [showWinners, setShowWinners] = useState(false);
  
  // 9 slots for the slot machine (3x3 grid)
  const [slots, setSlots] = useState<string[][]>(Array(9).fill([]));
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  // Initialize slots with random names
  useEffect(() => {
    if (participants.length > 0) {
      const initialSlots = Array(9).fill(null).map(() => {
        return getRandomNames(20); // 20 names per slot for rolling effect
      });
      setSlots(initialSlots);
    }
  }, [participants]);

  // Listen for roll event from admin panel
  useEffect(() => {
    let lastRollTimestamp = 0;

    const checkRoll = () => {
      const rollTimestamp = localStorage.getItem('jackpotRoll');
      if (rollTimestamp) {
        const timestamp = parseInt(rollTimestamp);
        if (timestamp > lastRollTimestamp && !isRolling) {
          console.log('🎲 Jackpot: Roll event received!', timestamp);
          lastRollTimestamp = timestamp;
          startRoll();
        }
      }
    };

    const handleRollEvent = () => {
      console.log('🎲 Jackpot: Roll custom event received!');
      checkRoll();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jackpotRoll') {
        console.log('🎲 Jackpot: Roll storage event detected!');
        checkRoll();
      }
    };

    window.addEventListener('jackpotRoll', handleRollEvent);
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for roll events every 300ms
    const interval = setInterval(checkRoll, 300);

    return () => {
      clearInterval(interval);
      window.removeEventListener('jackpotRoll', handleRollEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isRolling]);

  const getRandomNames = (count: number): string[] => {
    if (participants.length === 0) {
      return Array(count).fill("Loading...");
    }
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      names.push(participants[randomIndex]);
    }
    return names;
  };

  const startRoll = () => {
    if (isRolling || participants.length === 0) return;
    
    console.log('🎲 Starting jackpot roll for 5 seconds...');
    setIsRolling(true);
    setShowWinners(false);
    setWinners([]);
    
    if (onStartRoll) {
      onStartRoll();
    }

    // Clear any existing intervals
    intervalRefs.current.forEach(interval => clearInterval(interval));
    intervalRefs.current = [];

    // Start all slots rolling
    slots.forEach((_, index) => {
      const interval = setInterval(() => {
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = getRandomNames(20);
          return newSlots;
        });
      }, 100); // Roll every 100ms
      intervalRefs.current.push(interval);
    });

    // Stop all slots after exactly 5 seconds
    setTimeout(() => {
      // Clear all intervals
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current = [];
      
      // Select and show winners
      selectWinners();
      setIsRolling(false);
      console.log('✅ Jackpot roll completed after 5 seconds');
    }, 5000); // Exactly 5 seconds
  };

  const selectWinners = () => {
    if (participants.length === 0) return;

    // Select 3 unique random winners
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, Math.min(3, participants.length));
    
    console.log('🎰 Jackpot Winners:', selectedWinners);
    setWinners(selectedWinners);
    
    // Update slots to show winners in MIDDLE ROW (slots 3, 4, 5)
    setSlots(prev => {
      const newSlots = [...prev];
      selectedWinners.forEach((winner, i) => {
        if (i < 3) {
          newSlots[i + 3] = [winner]; // Middle row: slots 3, 4, 5 show winners
        }
      });
      return newSlots;
    });
    
    setTimeout(() => {
      setShowWinners(true);
    }, 500);
  };

  const handlePullLever = () => {
    if (!isRolling) {
      startRoll();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated sparkles background */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Sparkles
            className="text-yellow-400"
            size={10 + Math.random() * 20}
            style={{ opacity: 0.3 + Math.random() * 0.7 }}
          />
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl w-full space-y-8">
        {/* Sparky Yellow Header Box */}
        <motion.div
          className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-2 shadow-[0_0_60px_rgba(250,204,21,0.8)]"
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Animated sparkles around the box */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-2xl p-8 relative overflow-hidden">
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
            
            <div className="relative z-10 text-center">
              <motion.h1
                className="text-6xl md:text-8xl font-black text-yellow-300 drop-shadow-[0_0_30px_rgba(250,204,21,1)] mb-2"
                animate={{
                  textShadow: [
                    "0 0 30px rgba(250,204,21,1)",
                    "0 0 60px rgba(250,204,21,1)",
                    "0 0 30px rgba(250,204,21,1)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                🎰 JACKPOT 🎰
              </motion.h1>
              <p className="text-2xl md:text-3xl font-bold text-yellow-200">
                Pull the lever to win amazing prizes!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Jackpot Machine */}
        <motion.div
          className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-3xl p-8 border-8 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 border-8 border-yellow-400 rounded-3xl"
            animate={{
              boxShadow: [
                "0 0 30px rgba(250,204,21,0.5)",
                "0 0 60px rgba(250,204,21,0.8)",
                "0 0 30px rgba(250,204,21,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Slot Machine Grid */}
          <div className="bg-black/80 rounded-2xl p-8 relative">
            <div className="grid grid-cols-3 gap-6">
              {slots.map((slotNames, index) => {
                const isWinner = showWinners && index >= 3 && index <= 5; // Middle row winners
                
                return (
                  <motion.div
                    key={index}
                    className={`rounded-2xl p-6 border-4 ${
                      isWinner
                        ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,1)]"
                        : "border-yellow-600/50"
                    } h-40 flex items-center justify-center overflow-hidden relative`}
                    style={{
                      background: isWinner
                        ? "linear-gradient(135deg, #facc15 0%, #fbbf24 50%, #f59e0b 100%)"
                        : "linear-gradient(to bottom, #1e3a8a, #172554)",
                    }}
                    animate={
                      isWinner
                        ? {
                            boxShadow: [
                              "0 0 40px rgba(250,204,21,1)",
                              "0 0 60px rgba(250,204,21,1)",
                              "0 0 40px rgba(250,204,21,1)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isRolling ? (
                        <motion.div
                          key={`rolling-${index}`}
                          className="text-center w-full"
                          animate={{
                            y: [-100, 0, 100],
                          }}
                          transition={{
                            duration: 0.1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <p className="text-2xl font-bold text-white truncate px-2">
                            {slotNames[0] || "???"}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`static-${index}`}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="text-center w-full"
                        >
                          <motion.p
                            className={`text-3xl font-black truncate px-2 ${
                              isWinner ? "text-black" : "text-white"
                            }`}
                            animate={
                              isWinner
                                ? {
                                    scale: [1, 1.1, 1],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                            }}
                          >
                            {slotNames[0] || "???"}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pull Lever (for admin only) */}
          {isAdmin && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ zIndex: 50 }}
            >
              <motion.button
                onClick={handlePullLever}
                disabled={isRolling}
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ y: 20 }}
              >
                {/* Lever */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-6 h-40 ${
                      isRolling ? "bg-gray-500" : "bg-yellow-500"
                    } rounded-full relative`}
                    animate={isRolling ? { y: 20 } : { y: 0 }}
                  >
                    <div
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 ${
                        isRolling ? "bg-gray-600" : "bg-red-600"
                      } rounded-full border-4 border-yellow-400`}
                    />
                  </motion.div>
                  
                  {!isRolling && (
                    <motion.div
                      className="mt-4 bg-yellow-400 text-red-900 font-black px-4 py-2 rounded-lg"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    >
                      PULL ME! →
                    </motion.div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Winners Display Below */}
        <AnimatePresence>
          {showWinners && winners.length > 0 && (
            <motion.div
              className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-2 shadow-[0_0_60px_rgba(250,204,21,0.8)]"
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="bg-black/90 rounded-2xl p-8 relative overflow-hidden">
                {/* Sparkle effects */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  >
                    <Sparkles className="text-yellow-300" size={15} />
                  </motion.div>
                ))}

                <div className="relative z-10">
                  <motion.h3
                    className="text-5xl md:text-6xl font-black text-yellow-300 text-center mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,1)]"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    🏆 CONGRATULATIONS! 🏆
                  </motion.h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {winners.map((winner, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-2xl p-6 border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] relative overflow-hidden"
                        initial={{ scale: 0, rotate: -180, y: 50 }}
                        animate={{ scale: 1, rotate: 0, y: 0 }}
                        transition={{
                          delay: index * 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {/* Shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3,
                          }}
                        />

                        <div className="relative z-10 text-center">
                          <motion.div
                            animate={{
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2,
                            }}
                          >
                            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
                          </motion.div>
                          
                          <p className="text-3xl md:text-4xl font-black text-white mb-2 break-words">
                            {winner}
                          </p>
                          
                          <motion.div
                            className="inline-block bg-yellow-400 text-black font-black px-4 py-2 rounded-full text-lg"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: index * 0.3,
                            }}
                          >
                            Winner #{index + 1}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

