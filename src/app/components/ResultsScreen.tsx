import { useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Star, Sparkles, Crown, Medal } from "lucide-react";
import confetti from "canvas-confetti";

interface Winner {
  questionId: string;
  questionText: string;
  winner: string;
  voteCount: number;
}

interface ResultsScreenProps {
  winners: Winner[];
}

export function ResultsScreen({ winners }: ResultsScreenProps) {
  useEffect(() => {
    // Trigger epic confetti on mount
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50;
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#06b6d4", "#a855f7", "#ec4899", "#fbbf24"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // If no winners yet, show placeholder
  if (winners.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Trophy className="w-20 h-20 text-gray-500 mx-auto" />
          <h2 className="text-3xl font-black text-gray-400">
            No Results Yet
          </h2>
          <p className="text-gray-500">Vote on questions to see winners!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background sparkles */}
      {[...Array(40)].map((_, i) => (
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
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <Star className="w-4 h-4 text-yellow-400" />
        </motion.div>
      ))}

      <div className="relative z-10 max-w-5xl w-full space-y-8 pb-20">
        {/* Grand Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="inline-block mb-4"
          >
            <Crown className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 mb-4">
            {winners.length === 1 ? '🏆 WINNER! 🏆' : '🎊 TONIGHT\'S CHAMPIONS! 🎊'}
          </h1>
          <p className="text-cyan-300 text-xl md:text-2xl font-bold">
            {winners.length === 1 ? 'The winner is revealed!' : 'All the winners revealed!'}
          </p>
        </motion.div>

        {/* All Winners Display */}
        <div className="space-y-6">
          {winners.map((winnerData, index) => (
            <motion.div
              key={`${winnerData.questionId}-${index}`}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 border-4 border-yellow-500/50 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
              initial={{ scale: 0.8, opacity: 0, x: -50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, type: "spring", bounce: 0.4 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Icon Section */}
                <motion.div
                  className="flex-shrink-0"
                  animate={{
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <div className="relative">
                    {index === 0 ? (
                      <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
                    ) : (
                      <Medal className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
                    )}
                    <motion.div
                      className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                </motion.div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  {/* Question */}
                  <p className="text-cyan-300 text-sm md:text-base font-semibold">
                    "{winnerData.questionText}"
                  </p>

                  {/* Winner Name */}
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300">
                    {winnerData.winner}
                  </h2>

                  {/* Vote Count */}
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <p className="text-yellow-300 text-lg font-bold">
                      {winnerData.voteCount} vote{winnerData.voteCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Position Badge */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-yellow-300/50 shadow-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    <span className="text-2xl md:text-3xl font-black text-white">
                      #{index + 1}
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Celebration message */}
        <motion.div
          className="text-center pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: winners.length * 0.2 + 0.5 }}
        >
          <p className="text-3xl md:text-4xl text-cyan-300 font-black mb-2">
            🎉 CONGRATULATIONS TO ALL! 🎉
          </p>
          <p className="text-gray-400 text-lg">
            You all made this night unforgettable!
          </p>
        </motion.div>
      </div>
    </div>
  );
}