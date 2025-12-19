import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import axios from "axios";
import {
  Upload,
  Plus,
  Play,
  Trophy,
  Clock,
  Users,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface Question {
  id: string;
  _id?: string;
  text: string;
  duration: number;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface Winner {
  _id?: string;
  questionId: string;
  questionText: string;
  winner: string;
  voteCount: number;
  totalVotes?: number;
  createdAt?: string | Date;
}

interface AdminPanelProps {
  onStartQuestion: (question: Question) => void;
  onShowResults: () => void;
  onStartJackpot?: () => void;
  liveVotes?: number;
}

export function AdminPanel({
  onStartQuestion,
  onShowResults,
  onStartJackpot,
  liveVotes = 0,
}: AdminPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [liveVoteCounts, setLiveVoteCounts] = useState<{[person: string]: number}>({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newDuration, setNewDuration] = useState(30);
  const [timeGapMinutes, setTimeGapMinutes] = useState(() => {
    // Load from localStorage or default to 0
    const saved = localStorage.getItem('questionTimeGapMinutes');
    return saved ? parseInt(saved) : 0;
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [activeTab, setActiveTab] = useState<"questions" | "monitor" | "users" | "jackpot">(
    "questions"
  );
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const employeesPerPage = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isJackpotActive, setIsJackpotActive] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Check if jackpot is active by monitoring localStorage
  useEffect(() => {
    const checkJackpotStatus = () => {
      const jackpotActive = localStorage.getItem('jackpotActivated');
      if (jackpotActive === 'true') {
        setIsJackpotActive(true);
      }
      // Note: We don't automatically set it to false here
      // Only manual close should deactivate it
    };

    checkJackpotStatus();
    const interval = setInterval(checkJackpotStatus, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jackpotActivated') {
        checkJackpotStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch winners from backend
  const fetchWinners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/winners`);
      setWinners(response.data);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setWinners([]);
    }
  };

  // Fetch live vote counts for active question
  const fetchLiveVoteCounts = async () => {
    try {
      // Find active question
      const activeQuestion = questions.find(q => q.isActive);
      if (activeQuestion) {
        const questionId = activeQuestion._id || activeQuestion.id;
        const response = await axios.get(`${API_BASE_URL}/votes/question/${questionId}`);
        if (response.data && response.data.voteCounts) {
          setLiveVoteCounts(response.data.voteCounts);
        }
      } else {
        setLiveVoteCounts({});
      }
    } catch (error) {
      console.error('Error fetching live vote counts:', error);
    }
  };

  // Fetch questions and winners from backend
  useEffect(() => {
    fetchQuestions();
    fetchEmployees();
    fetchWinners();
  }, []);

  // Poll for live vote counts and winners when monitor tab is active
  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchLiveVoteCounts();
      fetchWinners(); // Also fetch winners when monitor tab is active
      const interval = setInterval(() => {
        fetchLiveVoteCounts();
        fetchWinners(); // Refresh winners periodically
      }, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, questions]);

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/questions`);
      const fetchedQuestions = response.data.map((q: any) => ({
        id: q._id || q.id,
        _id: q._id,
        text: q.text,
        duration: q.duration,
        isActive: q.isActive,
        isCompleted: q.isCompleted,
      }));
      setQuestions(fetchedQuestions);
      // Also refresh winners when questions are fetched
      fetchWinners();
    } catch (error) {
      console.error('Error fetching questions:', error);
      setUploadStatus({
        type: 'error',
        message: 'Failed to load questions. Make sure the backend server is running.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/questions`, {
        text: newQuestion,
        duration: newDuration,
      });
      
      const newQuestionData = {
        id: response.data._id || response.data.id,
        _id: response.data._id,
        text: response.data.text,
        duration: response.data.duration,
        isActive: response.data.isActive,
      };
      
      setQuestions([...questions, newQuestionData]);
      setNewQuestion("");
      setNewDuration(30);
      setUploadStatus({
        type: 'success',
        message: 'Question added successfully!',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error('Error adding question:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add question',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/questions/${id}`);
      setQuestions(questions.filter((q) => (q._id || q.id) !== id));
      setUploadStatus({
        type: 'success',
        message: 'Question deleted successfully!',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error('Error deleting question:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete question',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditText(question.text);
    setEditDuration(question.duration);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditText("");
    setEditDuration(30);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion || !editText.trim()) return;

    try {
      setIsLoading(true);
      const questionId = editingQuestion._id || editingQuestion.id;
      const response = await axios.put(`${API_BASE_URL}/questions/${questionId}`, {
        text: editText,
        duration: editDuration,
      });
      
      const updatedQuestions = questions.map((q) =>
        (q._id || q.id) === questionId
          ? { ...q, text: response.data.text, duration: response.data.duration }
          : q
      );
      setQuestions(updatedQuestions);
      
      setEditingQuestion(null);
      setEditText("");
      setEditDuration(30);
      
      setUploadStatus({
        type: 'success',
        message: 'Question updated successfully!',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error('Error updating question:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update question',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuestion = async (question: Question) => {
    try {
      setIsLoading(true);
      const questionId = question._id || question.id;
      
      // Use global time gap setting
      const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/activate`, {
        timeGapMinutes: timeGapMinutes > 0 ? timeGapMinutes : undefined,
      });
      
      // Refresh questions to get updated active status
      await fetchQuestions();
      
      // Notify live display and user screens immediately
      const timestamp = Date.now().toString();
      localStorage.setItem('questionActivated', timestamp);
      window.dispatchEvent(new CustomEvent('questionActivated', { 
        detail: { questionId, timestamp }
      }));
      
      // Dispatch multiple times to ensure all listeners catch it
      setTimeout(() => {
        localStorage.setItem('questionActivated', (Date.now()).toString());
        window.dispatchEvent(new CustomEvent('questionActivated'));
      }, 100);
      
      console.log('✅ Admin: Question activated, notified all displays');
      
      if (timeGapMinutes > 0) {
        onStartQuestion(question);
        
        setUploadStatus({
          type: 'success',
          message: `Question will go live in ${timeGapMinutes} minutes!`,
        });
      } else {
        // Immediate activation
        onStartQuestion(question);
        
        setUploadStatus({
          type: 'success',
          message: 'Question is now live!',
        });
      }
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } catch (error: any) {
      console.error('Error activating question:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to activate question',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
      return;
    }

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post(`${API_BASE_URL}/upload/excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus({
        type: 'success',
        message: response.data.message || `Successfully uploaded ${response.data.count} employees!`,
      });
      
      // Refresh employees list after upload
      fetchEmployees();
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload file. Please check the file format.',
      });
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/50"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            🎛️ Admin Control Panel
          </h1>
          <p className="text-gray-400 mt-2">Manage the party game experience</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-black/30 rounded-2xl p-2">
            {[
            { id: "questions", label: "Questions", icon: Pencil },
            { id: "users", label: "Users", icon: Users },
            { id: "monitor", label: "Live Monitor", icon: Eye },
            { id: "jackpot", label: "Jackpot", icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-black"
                  : "text-gray-400 hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            {/* Upload Status Message */}
            {uploadStatus.type && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`backdrop-blur-lg rounded-2xl p-4 border ${
                  uploadStatus.type === 'success'
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-red-500/20 border-red-500/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p
                    className={`font-semibold ${
                      uploadStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}
                  >
                    {uploadStatus.message}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Upload Employees */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>Upload Employee List</span>
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="w-full py-4 border-2 border-dashed border-cyan-500/50 rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Click to upload Excel file</span>
                  </>
                )}
              </button>
              <p className="text-gray-500 text-sm mt-2">
                Upload .xlsx or .xls file with employee names in the first column
              </p>
            </motion.div>

            {/* Add Question */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Add New Question</span>
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter question..."
                  className="w-full px-4 py-3 bg-white/10 border border-cyan-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Duration:</span>
                  </div>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    min="10"
                    max="120"
                    className="w-24 px-4 py-2 bg-white/10 border border-cyan-500/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-gray-400">seconds</span>
                </div>
                <button
                  onClick={handleAddQuestion}
                  disabled={isLoading || !newQuestion.trim()}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Add Question'
                  )}
                </button>
              </div>
            </motion.div>

            {/* Global Time Gap Setting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>Global Time Gap Between Questions</span>
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-white">Time Gap:</span>
                </div>
                <input
                  type="number"
                  value={timeGapMinutes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setTimeGapMinutes(value);
                    localStorage.setItem('questionTimeGapMinutes', value.toString());
                  }}
                  min="0"
                  max="60"
                  className="w-24 px-4 py-2 bg-white/10 border border-yellow-500/50 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                  placeholder="0"
                />
                <span className="text-gray-400">minutes (applies between all questions)</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                This gap will be applied automatically between all questions when they go live. When one question ends, the next will appear after this time gap.
              </p>
              <button
                onClick={async () => {
                  if (questions.length === 0) {
                    setUploadStatus({
                      type: 'error',
                      message: 'No questions available. Please add questions first.',
                    });
                    setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
                    return;
                  }
                  
                  try {
                    setIsLoading(true);
                    
                    // Reset all questions (deactivate and mark as not completed)
                    await axios.post(`${API_BASE_URL}/questions/reset-all`);
                    
                    // Get first question
                    const firstQuestion = questions[0];
                    const firstQuestionId = firstQuestion._id || firstQuestion.id;
                    
                    // Schedule first question to appear after 30 seconds
                    await axios.post(`${API_BASE_URL}/questions/${firstQuestionId}/activate`, {
                      timeGapMinutes: 0.5, // 30 seconds = 0.5 minutes
                    });
                    
                    // Store that question series has started
                    localStorage.setItem('questionSeriesStarted', 'true');
                    // Store time gap (use 0.5 minutes as minimum if 0 is set)
                    const gapToStore = timeGapMinutes > 0 ? timeGapMinutes : 0.5;
                    localStorage.setItem('questionTimeGapMinutes', gapToStore.toString());
                    
                    await fetchQuestions();
                    
                    setUploadStatus({
                      type: 'success',
                      message: `Question series started! First question will appear in 30 seconds.`,
                    });
                    setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
                  } catch (error: any) {
                    console.error('Error starting question series:', error);
                    setUploadStatus({
                      type: 'error',
                      message: error.response?.data?.error || 'Failed to start question series',
                    });
                    setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || questions.length === 0}
                className="w-full mt-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-xl font-black hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Play className="w-6 h-6" />
                <span>Start Questions</span>
              </button>
            </motion.div>

            {/* Questions List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Questions</h3>
              {isLoading && questions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No questions yet. Add your first question above!
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={question._id || question.id}
                      className={`bg-white/5 rounded-xl p-4 border transition-all ${
                        question.isActive
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-cyan-500/30 hover:border-cyan-500/50'
                      }`}
                    >
                      {editingQuestion && (editingQuestion._id || editingQuestion.id) === (question._id || question.id) ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-cyan-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                            placeholder="Question text"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editDuration}
                              onChange={(e) => setEditDuration(Number(e.target.value))}
                              min="10"
                              max="120"
                              className="w-24 px-4 py-2 bg-white/10 border border-cyan-500/50 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                            />
                            <span className="text-gray-400 text-sm">seconds</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isLoading || !editText.trim()}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              {index + 1}. {question.text}
                              {question.isActive && (
                                <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                  LIVE
                                </span>
                              )}
                              {question.isCompleted && !question.isActive && (
                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                  COMPLETED
                                </span>
                              )}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Duration: {question.duration}s
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartQuestion(question)}
                              disabled={isLoading || question.isActive}
                              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-300 font-bold transition-all flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Play className="w-4 h-4" />
                              <span>Go Live</span>
                            </button>
                            <button
                              onClick={() => handleEditQuestion(question)}
                              disabled={isLoading || question.isActive}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit question"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question._id || question.id)}
                              disabled={isLoading || question.isActive}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === "monitor" && (
          <div className="space-y-6">
            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
                <Users className="w-8 h-8 text-cyan-400 mb-2" />
                <p className="text-gray-400">Live Votes</p>
                <p className="text-4xl font-black text-white">{liveVotes}</p>
              </div>
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <Clock className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-gray-400">Status</p>
                <p className="text-xl font-bold text-purple-300">Waiting</p>
              </div>
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30">
                <Trophy className="w-8 h-8 text-pink-400 mb-2" />
                <p className="text-gray-400">Completed</p>
                <p className="text-4xl font-black text-white">{winners.length}</p>
              </div>
            </motion.div>

            {/* Live Vote Counts */}
            {Object.keys(liveVoteCounts).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span>Live Vote Counts</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(liveVoteCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([person, count], index) => (
                      <motion.div
                        key={person}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between bg-green-500/10 backdrop-blur-sm rounded-xl p-3 border border-green-500/30"
                      >
                        <span className="text-white font-semibold">{person}</span>
                        <span className="text-green-400 font-bold text-lg">{count as number} votes</span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Show Results Button */}
            <motion.button
              onClick={async () => {
                onShowResults();
                // Refresh winners after showing results (multiple attempts to ensure it's saved)
                setTimeout(() => fetchWinners(), 1500);
                setTimeout(() => fetchWinners(), 3000);
                setTimeout(() => fetchWinners(), 5000);
              }}
              className="w-full py-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl text-white text-2xl font-black hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-8 h-8" />
              <span>Show Results</span>
            </motion.button>

            {/* Clear All Data Button */}
            <motion.button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete ALL winners and votes? This action cannot be undone.')) {
                  try {
                    setIsLoading(true);
                    // Delete all winners
                    await axios.delete(`${API_BASE_URL}/winners/all`);
                    // Delete all votes
                    await axios.delete(`${API_BASE_URL}/votes/all`);
                    // Refresh the data
                    await fetchWinners();
                    setUploadStatus({
                      type: 'success',
                      message: 'All winners and votes deleted successfully',
                    });
                    // Clear status after 3 seconds
                    setTimeout(() => {
                      setUploadStatus({ type: null, message: '' });
                    }, 3000);
                  } catch (error: any) {
                    console.error('Error clearing data:', error);
                    setUploadStatus({
                      type: 'error',
                      message: error.response?.data?.error || 'Failed to clear data',
                    });
                    setTimeout(() => {
                      setUploadStatus({ type: null, message: '' });
                    }, 3000);
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white text-xl font-bold hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-6 h-6" />
                  <span>Clear All Winners & Votes</span>
                </>
              )}
            </motion.button>

            {/* Winners List */}
            {winners.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>All Winners ({winners.length})</span>
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {winners
                    .sort((a, b) => {
                      // Sort by creation date (newest first)
                      const dateA = new Date(a.createdAt || 0).getTime();
                      const dateB = new Date(b.createdAt || 0).getTime();
                      return dateB - dateA;
                    })
                    .map((winner, index) => (
                    <motion.div
                      key={winner._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-cyan-300 text-sm font-semibold mb-1">
                            "{winner.questionText}"
                          </p>
                          <div className="flex items-center space-x-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <p className="text-white font-bold text-lg">{winner.winner}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-xl">{winner.voteCount}</p>
                          <p className="text-gray-400 text-xs">
                            {winner.totalVotes ? `of ${winner.totalVotes} votes` : 'votes'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Registered Users ({employees.length})</span>
                </h3>
                <div className="flex space-x-2">
                  {employees.length > 0 && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete ALL ${employees.length} users? This action cannot be undone!`)) return;
                        try {
                          setIsLoading(true);
                          await axios.delete(`${API_BASE_URL}/employees`);
                          await fetchEmployees();
                          setUploadStatus({
                            type: 'success',
                            message: 'All users deleted successfully!',
                          });
                          setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
                        } catch (error: any) {
                          console.error('Error deleting all employees:', error);
                          setUploadStatus({
                            type: 'error',
                            message: error.response?.data?.error || 'Failed to delete all users',
                          });
                          setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || isLoadingEmployees}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All</span>
                    </button>
                  )}
                  <button
                    onClick={fetchEmployees}
                    disabled={isLoadingEmployees}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoadingEmployees ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-cyan-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              </div>
            </motion.div>

            {/* Users List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30"
            >
              {isLoadingEmployees && employees.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : (() => {
                // Filter employees based on search query (case-insensitive)
                const filteredEmployees = employees.filter((emp) => {
                  const searchLower = searchQuery.toLowerCase();
                  const nameMatch = emp.name?.toLowerCase().includes(searchLower);
                  const emailMatch = emp.email?.toLowerCase().includes(searchLower);
                  return nameMatch || emailMatch;
                });

                // Pagination
                const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
                const startIndex = (currentPage - 1) * employeesPerPage;
                const endIndex = startIndex + employeesPerPage;
                const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

                return filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No users found</p>
                    <p className="text-sm">
                      {searchQuery ? 'Try a different search term' : 'Upload an Excel file in the Questions tab to add employees'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {paginatedEmployees.map((employee) => (
                        <motion.div
                          key={employee._id || employee.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`bg-white/5 rounded-xl p-4 border transition-all ${
                            editingEmployee && (editingEmployee._id || editingEmployee.id) === (employee._id || employee.id)
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-cyan-500/30 hover:border-cyan-500/50'
                          }`}
                        >
                          {editingEmployee && (editingEmployee._id || editingEmployee.id) === (employee._id || employee.id) ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-cyan-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 text-sm"
                                placeholder="Name"
                              />
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-cyan-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 text-sm"
                                placeholder="Email (or NA if not available)"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      setIsLoading(true);
                                      const employeeId = editingEmployee._id || editingEmployee.id;
                                      await axios.put(`${API_BASE_URL}/employees/${employeeId}`, {
                                        name: editName,
                                        email: (editEmail.trim() || 'NA').toLowerCase(),
                                      });
                                      await fetchEmployees();
                                      setEditingEmployee(null);
                                      setEditName("");
                                      setEditEmail("");
                                      setUploadStatus({
                                        type: 'success',
                                        message: 'User updated successfully!',
                                      });
                                      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
                                    } catch (error: any) {
                                      console.error('Error updating employee:', error);
                                      setUploadStatus({
                                        type: 'error',
                                        message: error.response?.data?.error || 'Failed to update user',
                                      });
                                      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }}
                                  disabled={isLoading || !editName.trim()}
                                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEmployee(null);
                                    setEditName("");
                                    setEditEmail("");
                                  }}
                                  disabled={isLoading}
                                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-bold text-sm transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                                  {employee.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold truncate">
                                    {employee.name}
                                  </p>
                                  <p className="text-gray-400 text-sm truncate">
                                    {employee.email || 'NA'}
                                  </p>
                                  {employee.gender && (
                                    <p className="text-gray-500 text-xs capitalize mt-1">
                                      {employee.gender}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingEmployee(employee);
                                    setEditName(employee.name || "");
                                    setEditEmail(employee.email || "");
                                  }}
                                  disabled={isLoading}
                                  className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                                >
                                  <Pencil className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Are you sure you want to delete ${employee.name}?`)) return;
                                    try {
                                      setIsLoading(true);
                                      const employeeId = employee._id || employee.id;
                                      await axios.delete(`${API_BASE_URL}/employees/${employeeId}`);
                                      await fetchEmployees();
                                      setUploadStatus({
                                        type: 'success',
                                        message: 'User deleted successfully!',
                                      });
                                      setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
                                    } catch (error: any) {
                                      console.error('Error deleting employee:', error);
                                      setUploadStatus({
                                        type: 'error',
                                        message: error.response?.data?.error || 'Failed to delete user',
                                      });
                                      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }}
                                  disabled={isLoading}
                                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 pt-4 border-t border-cyan-500/30">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-white font-semibold">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* Jackpot Tab */}
        {activeTab === "jackpot" && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30"
            >
              <div className="text-center mb-6">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-3xl font-black text-white mb-2">Jackpot Lucky Draw</h3>
                <p className="text-gray-400 text-lg">
                  Start the slot machine jackpot on the main display
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-white/5 rounded-xl p-6 border border-yellow-500/30">
                  <h4 className="text-white font-bold text-lg mb-3">How it works:</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>✓ Click "Open Jackpot" to show on TV/projector</li>
                    <li>✓ Slot machine appears with all employee names</li>
                    <li>✓ Click "🎲 Roll" to start the slot machine</li>
                    <li>✓ 3 random winners will be selected</li>
                    <li>✓ Winners highlighted in yellow glow (middle row)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {onStartJackpot && (
                    <motion.button
                      onClick={() => {
                        console.log('🎰 Admin: Opening Jackpot Display...');
                        setIsJackpotActive(true); // Set active state immediately
                        onStartJackpot();
                      }}
                      disabled={isJackpotActive}
                      className={`px-8 py-6 ${
                        isJackpotActive
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 hover:shadow-[0_0_50px_rgba(251,191,36,0.8)]"
                      } rounded-2xl text-white text-2xl font-black transition-all relative overflow-hidden`}
                      whileHover={!isJackpotActive ? { scale: 1.05 } : {}}
                      whileTap={!isJackpotActive ? { scale: 0.95 } : {}}
                    >
                      {isJackpotActive ? "✅ Jackpot Active" : "🎰 Open Jackpot"}
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => {
                      if (isRolling) return; // Prevent multiple clicks
                      
                      console.log('🎲 Admin: Rolling Jackpot...');
                      setIsRolling(true); // Disable button during roll
                      
                      const timestamp = Date.now().toString();
                      localStorage.setItem('jackpotRoll', timestamp);
                      window.dispatchEvent(new CustomEvent('jackpotRoll', { detail: { timestamp } }));
                      
                      // Broadcast multiple times for reliability
                      for (let i = 1; i <= 5; i++) {
                        setTimeout(() => {
                          localStorage.setItem('jackpotRoll', (parseInt(timestamp) + i).toString());
                          window.dispatchEvent(new CustomEvent('jackpotRoll'));
                          console.log(`📡 Roll broadcast attempt ${i}/5`);
                        }, i * 100);
                      }
                      
                      // Re-enable button after 5 seconds (roll duration)
                      setTimeout(() => {
                        setIsRolling(false);
                        console.log('✅ Roll completed, button re-enabled');
                      }, 5500); // 5 seconds roll + 0.5s buffer
                    }}
                    disabled={!isJackpotActive || isRolling}
                    className={`px-8 py-6 ${
                      isJackpotActive && !isRolling
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:shadow-[0_0_50px_rgba(168,85,247,0.8)]"
                        : "bg-gray-600 cursor-not-allowed opacity-50"
                    } rounded-2xl text-white text-2xl font-black transition-all relative overflow-hidden group`}
                    whileHover={isJackpotActive && !isRolling ? { scale: 1.05 } : {}}
                    whileTap={isJackpotActive && !isRolling ? { scale: 0.95 } : {}}
                  >
                    {isJackpotActive && !isRolling && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-30"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {isRolling ? "🎲 ROLLING... 🎲" : "🎲 ROLL 🎲"}
                    </span>
                  </motion.button>
                </div>

                {/* Close Jackpot Button */}
                {isJackpotActive && (
                  <motion.button
                    onClick={() => {
                      console.log('❌ Admin: Closing Jackpot...');
                      setIsJackpotActive(false);
                      setIsRolling(false); // Reset rolling state
                      localStorage.removeItem('jackpotActivated');
                      localStorage.removeItem('jackpotTriggerTime');
                      localStorage.removeItem('jackpotRoll');
                      window.dispatchEvent(new CustomEvent('jackpotClosed'));
                    }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white text-lg font-bold hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ❌ Close Jackpot & Reset
                  </motion.button>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm text-center">
                    <strong>Note:</strong> Make sure the TV/projector screen is open at{" "}
                    <code className="bg-black/30 px-2 py-1 rounded">?display=live</code>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}