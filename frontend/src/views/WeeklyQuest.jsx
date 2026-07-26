import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, CheckCircle, Brain, AlertCircle, RefreshCw, Award, ArrowRight, Play, Loader2, Sparkles } from 'lucide-react';
import * as api from '../services/api';

export default function WeeklyQuest() {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const [submissionResult, setSubmissionResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchActiveQuest();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchActiveQuest = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getActiveWeeklyQuest();
      setQuest(data);
      if (data.alreadySubmitted) {
        setSubmissionResult(data.userSubmission);
        fetchLeaderboard(data.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'No active challenges found for this week.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (questId) => {
    setLoadingLeaderboard(true);
    try {
      const data = await api.getQuestLeaderboard(questId);
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const startQuiz = () => {
    setGameStarted(true);
    setTimer(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const selectAnswer = (questionId, optionKey) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quest.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await api.submitWeeklyQuest({
        weeklyQuestId: quest.id,
        answers: userAnswers,
        durationSeconds: timer
      });
      setSubmissionResult(res);
      fetchLeaderboard(quest.id);
    } catch (err) {
      alert(err.message || 'Failed to submit quest.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gameStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#8A8FA8' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#00C896', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
        <p style={{ fontSize: '0.875rem' }}>Loading Weekly Challenge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface" style={{ padding: '2rem', maxWidth: 440, margin: '0 auto', textAlign: 'center', borderColor: 'rgba(248,113,113,0.3)' }}>
        <AlertCircle style={{ width: 36, height: 36, color: '#F87171', margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 600, color: '#F1F2F4' }}>No Active Challenge</h2>
        <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.35rem', lineHeight: 1.5 }}>{error}</p>
        <button onClick={fetchActiveQuest} className="btn-ghost" style={{ marginTop: '1.25rem', margin: '1.25rem auto 0', fontSize: '0.75rem' }}>
          <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
        </button>
      </div>
    );
  }

  // ── Results Screen ──
  if (submissionResult) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="surface" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,200,150,0.15)', border: '2px solid #00C896', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C896' }}>
            <Trophy style={{ width: 28, height: 28 }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.375rem', fontWeight: 700, color: '#F1F2F4' }}>Challenge Completed</h2>
            <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.25rem' }}>Your answers have been recorded.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', width: '100%', maxWidth: 380, background: '#161822', padding: '1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#F1F2F4', display: 'block' }}>{submissionResult.score ?? submissionResult.Score}</span>
              <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>Points</span>
            </div>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#F1F2F4', display: 'block' }}>{submissionResult.durationSeconds ?? submissionResult.DurationSeconds}s</span>
              <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>Duration</span>
            </div>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#00C896', display: 'block' }}>+{submissionResult.tokensEarned ?? submissionResult.TokensEarned}</span>
              <span style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>Tokens</span>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#4B5068', maxWidth: 340 }}>
            New challenges release every week. Redeem earned tokens in the Rewards section.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <Trophy style={{ width: 16, height: 16, color: '#00C896' }} />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Leaderboard
            </h3>
          </div>

          {loadingLeaderboard ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4B5068', fontSize: '0.8125rem' }}>Loading standings...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((user, idx) => (
                <div key={idx} className="surface-2" style={{ padding: '0.65rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 4, background: idx === 0 ? 'rgba(0,200,150,0.2)' : '#08090E', color: idx === 0 ? '#00C896' : '#8A8FA8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      {user.rank}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4' }}>{user.userName}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', fontFamily: 'JetBrains Mono, monospace' }}>{user.score} pts</span>
                    <span style={{ fontSize: '0.675rem', color: '#4B5068', display: 'block' }}>{user.durationSeconds}s</span>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#4B5068', fontSize: '0.8125rem' }}>
                  Be the first to record a score this week.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Start / Intro ──
  if (!gameStarted) {
    return (
      <div className="surface" style={{ padding: '2rem', maxWidth: 540, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C896' }}>
          <Sparkles style={{ width: 24, height: 24 }} />
        </div>
        
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>{quest.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.5rem', lineHeight: 1.6 }}>{quest.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
          <div className="surface-2" style={{ padding: '0.875rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Speed Bonus</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock style={{ width: 13, height: 13, color: '#00C896' }} /> Time Matters
            </span>
          </div>
          <div className="surface-2" style={{ padding: '0.875rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Reward</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#00C896', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Up to {quest.rewardTokens} Tokens
            </span>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="btn-primary"
          style={{ width: '100%', maxWidth: 360, padding: '0.75rem' }}
        >
          <Play style={{ width: 15, height: 15, fill: 'currentColor' }} /> Start Weekly Challenge
        </button>
      </div>
    );
  }

  // ── Active Quiz ──
  const currentQuestion = quest.questions[currentQuestionIndex];
  const isSelected = (opt) => userAnswers[currentQuestion.id] === opt;

  return (
    <div className="surface" style={{ padding: '1.75rem', maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.875rem' }}>
        <div>
          <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Progress</span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4' }}>Question {currentQuestionIndex + 1} of {quest.questions.length}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Elapsed Time</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600, color: '#00C896', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock style={{ width: 13, height: 13 }} /> {timer}s
          </span>
        </div>
      </div>

      {/* Question */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4', lineHeight: 1.5 }}>
          {currentQuestion.questionText}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optVal = currentQuestion[`option${opt}`];
            const selected = isSelected(opt);
            return (
              <button
                key={opt}
                onClick={() => selectAnswer(currentQuestion.id, opt)}
                className={`surface-2${selected ? ' surface-accent' : ''}`}
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: selected ? 'rgba(0,200,150,0.1)' : undefined,
                  border: `1px solid ${selected ? '#00C896' : 'rgba(255,255,255,0.07)'}`,
                  color: selected ? '#00C896' : '#F1F2F4',
                  fontSize: '0.84rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 4, background: selected ? '#00C896' : '#08090E', color: selected ? '#08090E' : '#4B5068', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                  {opt}
                </span>
                <span>{optVal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
        <button
          onClick={nextQuestion}
          disabled={!userAnswers[currentQuestion.id]}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem', opacity: !userAnswers[currentQuestion.id] ? 0.4 : 1, cursor: !userAnswers[currentQuestion.id] ? 'not-allowed' : 'pointer' }}
        >
          {currentQuestionIndex === quest.questions.length - 1 ? 'Submit Answers' : 'Next Question'} <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}
