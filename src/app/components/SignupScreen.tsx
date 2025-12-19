import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CircleUser, Sparkles } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface SignupScreenProps {
  onComplete: (name: string) => void;
}

interface Employee {
  _id: string;
  name: string;
  gender?: string;
}

export function SignupScreen({ onComplete }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch employees from database
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data); // Store full employee objects
    } catch (error) {
      console.error('Error fetching employees:', error);
      // If API fails, continue with empty array (user can still type manually)
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.length > 0 && employees.length > 0) {
      const filtered = employees.filter((emp) =>
        emp.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setName(employee.name);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete(name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, cyan 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            className="flex justify-center mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CircleUser className="w-16 h-16 text-cyan-400" />
          </motion.div>
          <h2 className="text-4xl font-black text-white">Join the Game</h2>
          <p className="text-cyan-300">Let's get you in! 🎉</p>
        </div>

        {/* Form */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-white font-bold text-sm uppercase tracking-wide">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Start typing..."
                className="w-full px-6 py-4 bg-white/10 border-2 border-cyan-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
              />

              {/* Autocomplete suggestions */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-black/90 border border-cyan-500/50 rounded-xl overflow-hidden shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((employee, index) => (
                    <button
                      key={employee._id || index}
                      onClick={() => handleSelectEmployee(employee)}
                      className="w-full px-6 py-3 text-left hover:bg-cyan-500/20 transition-colors border-b border-cyan-500/20 last:border-b-0 flex items-center justify-between"
                    >
                      <span className="text-white font-semibold">{employee.name}</span>
                      {employee.gender && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          employee.gender === 'male' ? 'bg-blue-500/20 text-blue-300' :
                          employee.gender === 'female' ? 'bg-pink-500/20 text-pink-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {employee.gender === 'male' && '👨 Male'}
                          {employee.gender === 'female' && '👩 Female'}
                          {employee.gender !== 'male' && employee.gender !== 'female' && employee.gender}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Important Note */}
          <motion.div
            className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-yellow-300 text-sm text-center">
              ⚡ You can vote only once per round
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`w-full py-5 rounded-xl text-xl font-black transition-all ${
              name.trim()
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)]"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            whileHover={name.trim() ? { scale: 1.02 } : {}}
            whileTap={name.trim() ? { scale: 0.98 } : {}}
          >
            Join the Game 🎉
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}