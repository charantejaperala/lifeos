import React, { useState, useEffect } from 'react';
import { fetchRealtimeQuizApi, submitQuizResultApi, fetchQuizHistoryApi } from '../api';
import { 
  Award, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  Flame,
  HelpCircle,
  BarChart3
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  level: 'Novice' | 'Intermediate' | 'Advanced';
  category: 'Inflation & Savings' | 'Taxation 2026' | 'Investments & SIP' | 'FIRE & Goal Math' | 'Risk & Debt';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip2026?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- NOVICE LEVEL ---
  {
    id: 'q1',
    level: 'Novice',
    category: 'Inflation & Savings',
    question: 'What is the recommended size of an Emergency Fund for a salaried individual?',
    options: [
      '1 Month of living expenses',
      '3 to 6 Months of essential monthly living expenses',
      '12 Months of gross annual income',
      '50% of your total net worth'
    ],
    correctIndex: 1,
    explanation: 'An emergency fund should cover 3 to 6 months of liquid living expenses (rent, groceries, EMIs, insurance) in high-yielding liquid funds or sweep-in FDs to handle unexpected job loss or medical events.',
    tip2026: 'Tip: Keep 1 month in liquid bank savings and 5 months in Liquid Mutual Funds for instant 24-hour redemptions.'
  },
  {
    id: 'q2',
    level: 'Novice',
    category: 'Inflation & Savings',
    question: 'According to the popular 50/30/20 budget rule, what percentage of your net income should go towards Savings & Goal Investments?',
    options: ['10%', '20%', '30%', '50%'],
    correctIndex: 1,
    explanation: 'The 50/30/20 rule suggests 50% for Needs, 30% for Wants, and at least 20% for Savings & Goal Investments.',
    tip2026: 'LIFEOS Insight: For early FIRE or aggressive goal targets, aim to scale savings rate from 20% up to 40%+ as income increases.'
  },
  {
    id: 'q3',
    level: 'Novice',
    category: 'Investments & SIP',
    question: 'What is the "Rule of 72" used for in financial planning?',
    options: [
      'To calculate maximum home loan eligibility',
      'To estimate how many years it takes to double your money at a given interest rate (72 ÷ Rate)',
      'To calculate tax exemptions under Section 80C',
      'To determine your retirement age'
    ],
    correctIndex: 1,
    explanation: 'Rule of 72: Dividing 72 by the annual return rate gives the approximate number of years to double your investment (e.g., 72 ÷ 12% = 6 years).',
  },

  // --- INTERMEDIATE LEVEL ---
  {
    id: 'q4',
    level: 'Intermediate',
    category: 'Inflation & Savings',
    question: 'If education costs ₹15 Lakhs today and education inflation runs at 8% per year, approximately how much will it cost in 10 years?',
    options: ['₹18.5 Lakhs', '₹22.2 Lakhs', '₹32.4 Lakhs', '₹45.0 Lakhs'],
    correctIndex: 2,
    explanation: 'Formula: Future Value = PV × (1 + r)^n = 15,00,000 × (1.08)^10 ≈ ₹32,38,387 (over 2.15x the original cost!).',
    tip2026: 'Key Takeaway: Always use inflation-adjusted targets in LIFEOS so you don\'t underfund long-term goals.'
  },
  {
    id: 'q5',
    level: 'Intermediate',
    category: 'Investments & SIP',
    question: 'Why is XIRR (Extended Internal Rate of Return) preferred over simple CAGR for measuring Mutual Fund SIP returns?',
    options: [
      'XIRR includes tax deductions automatically',
      'XIRR accounts for multiple cash flows occurring on different dates',
      'CAGR can only be calculated by certified financial planners',
      'XIRR is mandatory under RBI regulations'
    ],
    correctIndex: 1,
    explanation: 'SIP investments involve multiple transactions over time. XIRR calculates the exact annualized return taking into account the timing and magnitude of each individual instalment.',
  },
  {
    id: 'q6',
    level: 'Intermediate',
    category: 'Risk & Debt',
    question: 'What is considered a healthy maximum Debt-to-Income (DTI) ratio for total monthly EMI commitments?',
    options: ['Below 15%', '35% to 40% maximum', '65%', '80%'],
    correctIndex: 1,
    explanation: 'Financial advisors recommend keeping total loan EMIs (home loan, car loan, personal loan) below 35-40% of net monthly income to prevent cash flow bottlenecks.',
  },

  // --- ADVANCED LEVEL & 2026/2027 TRENDS ---
  {
    id: 'q7',
    level: 'Advanced',
    category: 'Taxation 2026',
    question: 'Under the updated Indian Tax Framework (Budget 2024/2025 onwards), what is the tax rate for Long Term Capital Gains (LTCG) on Equity Mutual Funds & Equity Shares above ₹1.25 Lakh exemption limit?',
    options: ['10%', '12.5%', '15%', '20%'],
    correctIndex: 1,
    explanation: 'LTCG tax on equity instruments is 12.5% for gains exceeding ₹1.25 Lakh per financial year (increased from 10% / ₹1 Lakh in prior tax provisions). Short Term Capital Gains (STCG) on equity is 20%.',
    tip2026: '2026/2027 Tax Rule: Plan tax harvesting up to ₹1.25L annually to lock in tax-free gains every financial year.'
  },
  {
    id: 'q8',
    level: 'Advanced',
    category: 'FIRE & Goal Math',
    question: 'In FIRE (Financial Independence, Retire Early) planning, what does the "Rule of 25" dictate for your target retirement corpus?',
    options: [
      'Corpus should equal 25 times your annual living expenses',
      'Corpus should equal 25 months of basic salary',
      'You must retire exactly 25 years after your first job',
      '25% of your corpus should remain in gold'
    ],
    correctIndex: 0,
    explanation: 'The Rule of 25 states that your FIRE corpus must be at least 25 times your projected annual expenses, based on a safe 4% annual withdrawal rate.',
    tip2026: 'Example: If annual living expense is ₹12 Lakhs, your FIRE target corpus is ₹3 Crores (12L × 25).'
  },
  {
    id: 'q9',
    level: 'Advanced',
    category: 'FIRE & Goal Math',
    question: 'What is "Sequence of Returns Risk" in goal-based retirement planning?',
    options: [
      'The risk of paying higher brokerage fees on frequent trades',
      'The risk of a severe market crash occurring right before or in the early years of withdrawing from your corpus',
      'The risk of bank interest rates rising above inflation',
      'The risk of missing a monthly SIP instalment'
    ],
    correctIndex: 1,
    explanation: 'Sequence of Returns Risk occurs when market downturns happen right as you begin drawing down your target corpus. LIFEOS solves this by de-risking goals into debt/liquid assets 18-24 months prior to target dates.',
  },
  {
    id: 'q10',
    level: 'Advanced',
    category: 'Taxation 2026',
    question: 'How are Sovereign Gold Bonds (SGB) taxed upon holding until full maturity (8 years)?',
    options: [
      'Taxed at slab rate',
      '12.5% LTCG tax with indexation',
      '100% Tax-Exempt on capital gains at maturity',
      '20% STCG tax'
    ],
    correctIndex: 2,
    explanation: 'Capital gains arising on redemption of Sovereign Gold Bonds to an individual upon 8-year maturity are completely EXEMPT from income tax! (Annual 2.5% interest received is taxable at slab rate).',
    tip2026: 'Gold Goal Strategy: Use SGB or Gold ETFs for long term family gold goals to maximize tax efficiency.'
  }
];

export const FinanceQuizView: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<'Novice' | 'Intermediate' | 'Advanced' | 'All'>('All');
  const [questionsList, setQuestionsList] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiEngineLabel, setAiEngineLabel] = useState<string>('Standard 2026 Question Bank');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Load saved score history
  const [quizStats, setQuizStats] = useState<{ attempts: number; highScore: number; totalPoints: number }>(() => {
    const saved = localStorage.getItem('lifeos_quiz_stats');
    return saved ? JSON.parse(saved) : { attempts: 0, highScore: 0, totalPoints: 0 };
  });

  const handleGenerateAIQuiz = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetchRealtimeQuizApi(activeLevel);
      if (res.questions && res.questions.length > 0) {
        setQuestionsList(res.questions as QuizQuestion[]);
        setAiEngineLabel(res.engine || 'Ollama AI Real-time (2026 Trends)');
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setUserAnswers({});
        setIsCompleted(false);
      }
    } catch (err) {
      console.warn('Quiz generation error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredQuestions = questionsList.filter(
    (q) => activeLevel === 'All' || q.level === activeLevel
  );

  const currentQuestion = (filteredQuestions.length > 0 ? filteredQuestions : questionsList)[currentIndex] || questionsList[0];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 100);
    }
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedOption }));
  };

  const handleNextQuestion = () => {
    const questionsToUse = filteredQuestions.length > 0 ? filteredQuestions : questionsList;
    if (currentIndex < questionsToUse.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Complete quiz
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQuestion.correctIndex ? 100 : 0);
      const newStats = {
        attempts: quizStats.attempts + 1,
        highScore: Math.max(quizStats.highScore, finalScore),
        totalPoints: quizStats.totalPoints + finalScore,
      };
      setQuizStats(newStats);
      localStorage.setItem('lifeos_quiz_stats', JSON.stringify(newStats));

      // Save to MongoDB Atlas
      submitQuizResultApi({
        score: finalScore,
        totalQuestions: questionsToUse.length,
        level: activeLevel,
        badge: getKnowledgeBadge(finalScore).title,
      });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers({});
    setIsCompleted(false);
  };

  const getKnowledgeBadge = (points: number) => {
    if (points >= 800) return { title: '👑 Wealth Architect (Advanced FIRE Expert)', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
    if (points >= 400) return { title: '🚀 Smart Strategist (Intermediate Planner)', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
    return { title: '🌱 Financial Aspirant (Novice Level)', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  };

  const badge = getKnowledgeBadge(score);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Financial IQ & Knowledge Engine 🧠</h1>
          <p>Test and elevate your financial literacy from scratch to advanced 2026/2027 wealth strategies.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="quiz-header-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: badge.bg, borderRadius: 20, border: `1px solid ${badge.color}`, fontSize: '12px', lineHeight: 1.2 }}>
            <Award size={16} color={badge.color} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 700, color: badge.color, whiteSpace: 'nowrap' }}>
              {badge.title}
            </span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">High Score</span>
          <span className="metric-value" style={{ color: '#10b981' }}>{quizStats.highScore} pts</span>
          <span className="metric-trend trend-up">Lifetime Total: {quizStats.totalPoints} pts</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Completed Assessments</span>
          <span className="metric-value" style={{ color: '#3b82f6' }}>{quizStats.attempts}</span>
          <span className="metric-trend trend-up">Updated with 2026 Tax Rules</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Current Question Level</span>
          <span className="metric-value" style={{ color: 'var(--text-main)' }}>
            {currentQuestion?.level || activeLevel} Mode
          </span>
          <span className="metric-trend trend-up">{filteredQuestions.length} Questions in Bank</span>
        </div>
      </div>

      <div className="metric-card quiz-selector-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Level:</span>
          {(['All', 'Novice', 'Intermediate', 'Advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              className={`fx-btn ${activeLevel === lvl ? 'active' : ''}`}
              onClick={() => {
                setActiveLevel(lvl);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setIsCompleted(false);
              }}
              style={{ padding: '6px 12px' }}
            >
              {lvl === 'Novice' && '🌱 Novice'}
              {lvl === 'Intermediate' && '🚀 Intermediate'}
              {lvl === 'Advanced' && '🔥 Advanced 2026'}
              {lvl === 'All' && '⚡ All Levels'}
            </button>
          ))}
        </div>
        
        <button
          className="btn-primary"
          onClick={handleGenerateAIQuiz}
          disabled={isGeneratingAI}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Sparkles size={14} className={isGeneratingAI ? 'spin' : ''} />
          <span>{isGeneratingAI ? 'Generating 2026 Questions...' : '✨ Generate Real-Time AI Quiz'}</span>
        </button>
      </div>

      {!isCompleted && currentQuestion && (
        <div className="metric-card quiz-question-card animate-fade-in">
          {/* Quiz Top Header & Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span className="goal-category-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                {currentQuestion.category} • {currentQuestion.level} Level
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                  Question {currentIndex + 1} of {(filteredQuestions.length > 0 ? filteredQuestions : questionsList).length}
                </span>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }} className="quiz-score-indicator">
                  Score: {score} pts
                </div>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="quiz-progress-track">
              <div 
                className="quiz-progress-fill" 
                style={{ 
                  width: `${((currentIndex + 1) / (filteredQuestions.length > 0 ? filteredQuestions : questionsList).length) * 100}%` 
                }} 
              />
            </div>
          </div>

          {/* Question Text */}
          <h2 className="quiz-question-title" style={{ marginTop: 16, marginBottom: 8, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35, fontSize: 20 }}>
            {currentQuestion.question}
          </h2>

          {/* Options Grid (2x2 on Desktop, 1 Column on Mobile) */}
          <div className="quiz-options-grid">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = isAnswered && i === currentQuestion.correctIndex;
              const isWrong = isAnswered && isSelected && i !== currentQuestion.correctIndex;

              let statusClass = '';
              if (isCorrect) statusClass = 'correct';
              else if (isWrong) statusClass = 'wrong';
              else if (isSelected) statusClass = 'selected';

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  disabled={isAnswered}
                  className={`quiz-option-button ${statusClass}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="quiz-option-badge">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{opt}</span>
                  </div>
                  {isAnswered && i === currentQuestion.correctIndex && (
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  )}
                  {isAnswered && isSelected && i !== currentQuestion.correctIndex && (
                    <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="quiz-explanation-box animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: selectedOption === currentQuestion.correctIndex ? '#10b981' : '#ef4444' }}>
                <HelpCircle size={18} />
                <span>{selectedOption === currentQuestion.correctIndex ? 'Correct Answer! 🎉' : 'Explanation & Strategy Breakdown:'}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: 13.5, marginTop: 6 }} className="quiz-explanation-text">
                {currentQuestion.explanation}
              </p>
              {currentQuestion.tip2026 && (
                <div style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 600, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }} className="quiz-tip-box">
                  <Sparkles size={16} style={{ flexShrink: 0 }} />
                  <span>{currentQuestion.tip2026}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            {!isAnswered ? (
              <button
                className="btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                style={{ opacity: selectedOption === null ? 0.5 : 1 }}
              >
                <span>Check Answer</span>
              </button>
            ) : (
              <button className="btn-primary" onClick={handleNextQuestion}>
                <span>{currentIndex < (filteredQuestions.length > 0 ? filteredQuestions : questionsList).length - 1 ? 'Next Question →' : 'View Final Assessment Results 🎉'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="metric-card quiz-completed-card animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="quiz-completed-badge" style={{ borderRadius: '50%', background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={32} />
          </div>

          <div>
            <h2 className="quiz-completed-title" style={{ fontWeight: 800, color: 'var(--text-main)' }}>Quiz Assessment Completed!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }} className="quiz-completed-sub">
              You scored <strong style={{ color: '#10b981' }}>{score} points</strong> out of {filteredQuestions.length * 100} points.
            </p>
          </div>

          <div style={{ padding: '10px 20px', borderRadius: 12, background: badge.bg, border: `1px solid ${badge.color}`, color: badge.color, fontWeight: 800 }} className="quiz-badge-result">
            {badge.title}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn-secondary" onClick={handleRestartQuiz}>
              <RotateCcw size={16} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
