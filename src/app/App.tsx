import { useState, useEffect } from "react";
import axios from "axios";
import { EntryScreen } from "./components/EntryScreen";
import { SignupScreen } from "./components/SignupScreen";
import { WaitingScreen } from "./components/WaitingScreen";
import { LiveQuestionScreen } from "./components/LiveQuestionScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { LiveQuestionDisplay } from "./components/LiveQuestionDisplay";
import { AdminPanel } from "./components/AdminPanel";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

type Screen =
  | "entry"
  | "signup"
  | "waiting"
  | "question"
  | "results"
  | "admin";

interface Question {
  id: string;
  _id?: string;
  text: string;
  duration: number;
  gender?: "male" | "female" | "both";
  activatedAt?: string | Date;
}

interface Winner {
  questionId: string;
  questionText: string;
  winner: string;
  voteCount: number;
}

interface Employee {
  _id: string;
  name: string;
  gender?: string;
}

// Vote tracking per question
interface VoteData {
  [questionId: string]: {
    votes: { [person: string]: number };
    userVoted: boolean;
    votedFor?: string;
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("entry");
  const [userName, setUserName] = useState("");
  const [userGender, setUserGender] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [allWinners, setAllWinners] = useState<Winner[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Vote tracking per question
  const [votes, setVotes] = useState<VoteData>({});

  // Fetch employees from database
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Check if admin mode via URL parameter
  const isAdminMode = window.location.search.includes("admin=true");
  
  // Check if live question display mode via URL parameter
  const isLiveDisplayMode = window.location.search.includes("display=live");

  const fetchEmployees = async (): Promise<Employee[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      return [];
    }
  };


  const handleEntry = () => {
    if (isAdminMode) {
      setCurrentScreen("admin");
    } else {
      setCurrentScreen("signup");
    }
  };

  const handleSignupComplete = (name: string) => {
    setUserName(name);
    setUserGender("");
    setCurrentScreen("waiting");
  };

  const handleStartQuestion = async (question: Question) => {
    // Fetch latest question data to get activatedAt timestamp for synchronized timer
    try {
      const questionId = question._id || question.id;
      const response = await axios.get(`${API_BASE_URL}/questions/${questionId}`);
      if (response.data) {
        setCurrentQuestion({
          id: response.data._id || response.data.id,
          _id: response.data._id,
          text: response.data.text,
          duration: response.data.duration,
          activatedAt: response.data.activatedAt,
          gender: response.data.gender, // Include gender for filtering
        });
      } else {
        setCurrentQuestion(question);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setCurrentQuestion(question);
    }
    
    // Check if user has already voted for this question from backend
    const qId = question.id || question._id || '';
    let hasVoted = false;
    let votedForPerson = "";
    try {
      const votesResponse = await axios.get(`${API_BASE_URL}/votes/question/${qId}`);
      if (votesResponse.data && votesResponse.data.votes) {
        const userVote = votesResponse.data.votes.find((vote: any) => vote.voterName === userName);
        if (userVote) {
          hasVoted = true;
          votedForPerson = userVote.votedFor;
          console.log(`✅ User ${userName} has already voted for: ${votedForPerson}`);
        }
      }
    } catch (error) {
      // If error, assume not voted
      console.error('Error checking vote status:', error);
    }
    
    // ALWAYS initialize fresh vote state for new question
    setVotes(prev => ({
      ...prev,
      [qId]: { votes: {}, userVoted: hasVoted, votedFor: votedForPerson },
    }));
    
    // Refresh employees list to ensure it's up to date
    await fetchEmployees();
    
    setCurrentScreen("question");
  };

  const handleVote = async (selectedPerson: string) => {
    if (!currentQuestion) return;
    
    const questionId = currentQuestion._id || currentQuestion.id;
    
    try {
      // Send vote to backend
      await axios.post(`${API_BASE_URL}/votes`, {
        questionId,
        voterName: userName,
        votedFor: selectedPerson,
      });
      
      // Update local state - mark user as voted for THIS question only
      const qId = currentQuestion.id || currentQuestion._id || '';
      setVotes(prev => ({
        ...prev,
        [qId]: { 
          ...(prev[qId] || { votes: {} }), 
          userVoted: true 
        },
      }));
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      // If backend fails (e.g., already voted), still mark as voted locally
      const qId = currentQuestion.id || currentQuestion._id || '';
      setVotes(prev => ({
        ...prev,
        [qId]: { 
          ...(prev[qId] || { votes: {} }), 
          userVoted: true 
        },
      }));
    }
  };

  const handleShowResults = async () => {
    // Calculate winner from actual votes for current question
    if (currentQuestion) {
      const questionId = currentQuestion._id || currentQuestion.id;
      
      // Deactivate and mark current question as completed
      try {
        await axios.post(`${API_BASE_URL}/questions/${questionId}/deactivate`);
        console.log(`Question ${questionId} marked as completed`);
      } catch (error) {
        console.error('Error deactivating question:', error);
      }
      
      // Note: Questions are now manually activated - no automatic scheduling

      // IMPORTANT: Mark question as completed in backend FIRST
      try {
        const questionId = currentQuestion._id || currentQuestion.id;
        console.log('🏁 Marking question as completed:', questionId);
        await axios.post(`${API_BASE_URL}/questions/${questionId}/complete`);
        console.log('✅ Question marked as completed in backend');
      } catch (error) {
        console.error('Error marking question as completed:', error);
      }

      // Check if we already have a winner for this question
      const existingWinner = allWinners.find(w => w.questionId === currentQuestion.id);
      
      if (!existingWinner) {
        try {
          // Try to get results from backend first
          const questionId = currentQuestion._id || currentQuestion.id;
          const response = await axios.get(`${API_BASE_URL}/votes/results/${questionId}`);
          const result = response.data;
          
          if (result && result.winner) {
            const winnerData = {
              questionId: currentQuestion.id,
              questionText: currentQuestion.text,
              winner: result.winner,
              voteCount: result.winnerVoteCount || 0,
            };
            
            // Save winner to backend
            try {
              await axios.post(`${API_BASE_URL}/winners`, {
                questionId: currentQuestion._id || currentQuestion.id,
                questionText: currentQuestion.text,
                winner: result.winner,
                voteCount: result.winnerVoteCount || 0,
                totalVotes: result.totalVotes || 0,
              });
            } catch (error) {
              console.error('Error saving winner to backend:', error);
            }
            
            setAllWinners((prevWinners) => [
              ...prevWinners,
              winnerData,
            ]);
          } else {
            // Fallback to local votes if backend doesn't have results
            const questionVotes = votes[currentQuestion.id];
            if (questionVotes && Object.keys(questionVotes.votes).length > 0) {
              let maxVotes = 0;
              let winner = "";
              
              Object.entries(questionVotes.votes).forEach(([person, voteCount]) => {
                if (voteCount > maxVotes) {
                  maxVotes = voteCount;
                  winner = person;
                }
              });
              
              const winnerData = {
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                winner,
                voteCount: maxVotes,
              };
              
              // Save winner to backend
              try {
                await axios.post(`${API_BASE_URL}/winners`, {
                  questionId: currentQuestion._id || currentQuestion.id,
                  questionText: currentQuestion.text,
                  winner,
                  voteCount: maxVotes,
                  totalVotes: Object.values(questionVotes.votes).reduce((sum: number, count) => sum + (count as number), 0),
                });
              } catch (error) {
                console.error('Error saving winner to backend:', error);
              }
              
              setAllWinners((prevWinners) => [
                ...prevWinners,
                winnerData,
              ]);
            }
          }
        } catch (error) {
          console.error('Error fetching results:', error);
          // Fallback to local votes
          const questionVotes = votes[currentQuestion.id];
          if (questionVotes && Object.keys(questionVotes.votes).length > 0) {
            let maxVotes = 0;
            let winner = "";
            
            Object.entries(questionVotes.votes).forEach(([person, voteCount]) => {
              if (voteCount > maxVotes) {
                maxVotes = voteCount;
                winner = person;
              }
            });
            
            setAllWinners((prevWinners) => [
              ...prevWinners,
              {
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                winner,
                voteCount: maxVotes,
              },
            ]);
          }
        }
      }
    }
    
    // Show results first
    setCurrentScreen("results");
    
    // Notify live display that results are ready
    const timestamp = Date.now().toString();
    localStorage.setItem('questionCompleted', timestamp);
    window.dispatchEvent(new CustomEvent('questionCompleted', {
      detail: { questionId: currentQuestion?.id, timestamp }
    }));
    
    // Dispatch multiple times to ensure all listeners catch it
    setTimeout(() => {
      localStorage.setItem('questionCompleted', (Date.now()).toString());
      window.dispatchEvent(new CustomEvent('questionCompleted'));
    }, 100);
    
    console.log('✅ Results ready, notified all displays');

    // Auto-return to waiting after 5 seconds (results will show, then go to waiting for next question)
    setTimeout(() => {
      setCurrentScreen("waiting");
      setCurrentQuestion(null);
      // Clear vote state for the completed question to ensure fresh start for next question
      if (currentQuestion) {
        const qId = currentQuestion.id || currentQuestion._id || '';
        setVotes(prev => {
          const updated = { ...prev };
          delete updated[qId];
          return updated;
        });
      }
    }, 5000);
  };


  // Live Question Display - accessible via URL parameter (?display=live)
  // This is for main screen display (TV/projector) in clubs
  if (isLiveDisplayMode) {
    return <LiveQuestionDisplay />;
  }

  // Admin Panel rendering - accessible via URL parameter (?admin=true)
  if (isAdminMode) {
    return (
      <AdminPanel
        onStartQuestion={handleStartQuestion}
        onShowResults={handleShowResults}
        liveVotes={Math.floor(Math.random() * 50)}
      />
    );
  }

  // Screen routing
  let screenComponent;
  switch (currentScreen) {
    case "entry":
      screenComponent = <EntryScreen onEnter={handleEntry} />;
      break;

    case "signup":
      screenComponent = <SignupScreen onComplete={handleSignupComplete} />;
      break;

    case "waiting":
      screenComponent = (
        <WaitingScreen
          userName={userName}
          onActiveQuestion={async (question) => {
            // Refresh employees before showing question
            await fetchEmployees();
            
            // Check if user has already voted for this question from backend
            const qId = question._id || question.id;
            let hasVoted = false;
            let votedForPerson = "";
            try {
              const votesResponse = await axios.get(`${API_BASE_URL}/votes/question/${qId}`);
              if (votesResponse.data && votesResponse.data.votes) {
                const userVote = votesResponse.data.votes.find((vote: any) => vote.voterName === userName);
                if (userVote) {
                  hasVoted = true;
                  votedForPerson = userVote.votedFor;
                  console.log(`✅ User ${userName} has already voted for: ${votedForPerson}`);
                }
              }
            } catch (error) {
              // If error, assume not voted
              console.error('Error checking vote status:', error);
            }
            
            // Initialize fresh vote state for this question
            setVotes(prev => ({
              ...prev,
              [qId]: { votes: {}, userVoted: hasVoted, votedFor: votedForPerson },
            }));
            
            setCurrentQuestion({
              id: question._id || question.id,
              _id: question._id,
              text: question.text,
              duration: question.duration,
              activatedAt: question.activatedAt,
              gender: question.gender, // Include gender for filtering
            });
            setCurrentScreen("question");
          }}
        />
      );
      break;

    case "question":
      screenComponent = currentQuestion ? (() => {
        // Filter employees based on question gender
        console.log('=== GENDER FILTERING DEBUG ===');
        console.log('Current Question:', currentQuestion);
        console.log('Question Gender:', currentQuestion.gender);
        console.log('Total Employees:', employees.length);
        console.log('Employees with gender:', employees.map(e => ({ name: e.name, gender: e.gender })));
        
        let filteredEmployees: string[];
        
        if (currentQuestion.gender === 'male') {
          const maleEmployees = employees.filter(emp => emp.gender?.toLowerCase() === 'male');
          filteredEmployees = maleEmployees.map(emp => emp.name);
          console.log(`🔵 Question for MALE only.`);
          console.log('Male employees found:', maleEmployees);
          console.log(`Filtered ${filteredEmployees.length} male employees from ${employees.length} total.`);
        } else if (currentQuestion.gender === 'female') {
          const femaleEmployees = employees.filter(emp => emp.gender?.toLowerCase() === 'female');
          filteredEmployees = femaleEmployees.map(emp => emp.name);
          console.log(`🟣 Question for FEMALE only.`);
          console.log('Female employees found:', femaleEmployees);
          console.log(`Filtered ${filteredEmployees.length} female employees from ${employees.length} total.`);
          console.log('Final filtered employee names:', filteredEmployees);
        } else {
          filteredEmployees = employees.map(emp => emp.name);
          console.log(`🟢 Question for BOTH genders. Showing all ${filteredEmployees.length} employees.`);
        }
        console.log('=== END DEBUG ===');
        
        return (
          <LiveQuestionScreen
            questionId={currentQuestion.id}
            question={currentQuestion.text}
            timeLimit={currentQuestion.duration}
            employees={filteredEmployees}
            currentUser={userName}
            hasAlreadyVoted={votes[currentQuestion.id]?.userVoted || false}
            alreadyVotedFor={votes[currentQuestion.id]?.votedFor || ""}
            onVote={handleVote}
            onTimeEnd={() => {
              // When time ends, automatically show results
              handleShowResults();
            }}
            activatedAt={currentQuestion.activatedAt}
          />
        );
      })() : (
        <WaitingScreen
          userName={userName}
          onActiveQuestion={(question) => {
            setCurrentQuestion({
              id: question._id || question.id,
              _id: question._id,
              text: question.text,
              duration: question.duration,
              gender: question.gender, // Include gender for filtering
            });
            setCurrentScreen("question");
          }}
        />
      );
      break;

    case "results":
      // Show only the winner for the current question
      const currentQuestionWinner = currentQuestion 
        ? allWinners.filter(w => w.questionId === currentQuestion.id)
        : allWinners.slice(-1); // If no current question, show last winner
      screenComponent = (
        <ResultsScreen
          winners={currentQuestionWinner}
        />
      );
      break;

    case "admin":
      screenComponent = (
        <AdminPanel
          onStartQuestion={handleStartQuestion}
          onShowResults={handleShowResults}
          liveVotes={Math.floor(Math.random() * 50)}
        />
      );
      break;

    default:
      screenComponent = <EntryScreen onEnter={handleEntry} />;
  }

  return <>{screenComponent}</>;
}