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
    const qList = quest?.questions || quest?.Questions || [];
    if (!qList || qList.length === 0) {
      alert('No questions available for this weekly challenge yet.');
      return;
    }
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
    const qList = quest?.questions || quest?.Questions || [];
    if (currentQuestionIndex < qList.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const qId = quest?.id || quest?.Id;
      const res = await api.submitWeeklyQuest({
        weeklyQuestId: qId,
        answers: userAnswers,
        durationSeconds: timer
      });
      setSubmissionResult(res);
      fetchLeaderboard(qId);
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

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#EAB308', label: '🥇 #1', bonus: '+50 Bonus' };
    if (rank === 2) return { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', text: '#94A3B8', label: '🥈 #2', bonus: '+30 Bonus' };
    if (rank === 3) return { bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.4)', text: '#D97706', label: '🥉 #3', bonus: '+15 Bonus' };
    return { bg: '#08090E', border: 'rgba(255,255,255,0.06)', text: '#8A8FA8', label: `#${rank}`, bonus: null };
  };

  // ── Results Screen ──
  if (submissionResult) {
    const rank = submissionResult.rank ?? submissionResult.Rank ?? submissionResult.userSubmission?.rank ?? 0;
    const bonusTokens = submissionResult.bonusTokens ?? submissionResult.BonusTokens ?? (rank === 1 ? 50 : rank === 2 ? 30 : rank === 3 ? 15 : 0);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="surface" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,200,150,0.15)', border: '2px solid #00C896', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C896' }}>
            <Trophy style={{ width: 28, height: 28 }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.375rem', fontWeight: 700, color: '#F1F2F4' }}>Challenge Completed</h2>
            <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.25rem' }}>Your answers and speed have been recorded.</p>
          </div>

          {rank > 0 && rank <= 3 && (
            <div style={{ width: '100%', maxWidth: 380, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#EAB308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <Sparkles style={{ width: 14, height: 14 }} /> Top 3 Leaderboard Bonus!
              </span>
              <p style={{ fontSize: '0.75rem', color: '#F1F2F4', marginTop: '0.2rem' }}>
                You ranked <b>#{rank}</b> this week and earned <b>+{bonusTokens} Extra Tokens</b> for accuracy & speed!
              </p>
            </div>
          )}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy style={{ width: 16, height: 16, color: '#00C896' }} />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Weekly Leaderboard
                </h3>
              </div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(0,200,150,0.1)', color: '#00C896', border: '1px solid rgba(0,200,150,0.2)', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 600 }}>
                Top 3 Extra Rewards
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#8A8FA8', margin: 0, lineHeight: 1.4 }}>
              Ranked by <b>Correct Answers</b> first. If tied, <b>Fastest Submission Time</b> breaks the tie!
            </p>
          </div>

          {loadingLeaderboard ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4B5068', fontSize: '0.8125rem' }}>Loading standings...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((user, idx) => {
                const badge = getRankBadge(user.rank);
                return (
                  <div key={idx} className="surface-2" style={{ padding: '0.65rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: badge.bonus ? `3px solid ${badge.text}` : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ height: 24, padding: '0 0.45rem', borderRadius: 4, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {badge.label}
                      </span>
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', display: 'block' }}>{user.userName}</span>
                        {badge.bonus && (
                          <span style={{ fontSize: '0.625rem', color: badge.text, fontWeight: 600 }}>{badge.bonus} Tokens</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', fontFamily: 'JetBrains Mono, monospace' }}>{user.score} pts</span>
                      <span style={{ fontSize: '0.675rem', color: '#4B5068', display: 'block' }}>⏱️ {user.durationSeconds}s</span>
                    </div>
                  </div>
                );
              })}
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
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>{quest?.title || quest?.Title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.5rem', lineHeight: 1.6 }}>{quest?.description || quest?.Description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
          <div className="surface-2" style={{ padding: '0.875rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Speed Tie-Breaker</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock style={{ width: 13, height: 13, color: '#00C896' }} /> Faster = Higher Rank
            </span>
          </div>
          <div className="surface-2" style={{ padding: '0.875rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Base Reward</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#00C896', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Up to {quest?.rewardTokens || quest?.RewardTokens || 100} Tokens
            </span>
          </div>
        </div>

        {/* Top 3 Bonus Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', maxWidth: 360 }}>
          <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top 3 Leaderboard Extra Bonus</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '100%' }}>
            <div className="surface-2" style={{ padding: '0.65rem 0.35rem', textAlign: 'center', border: '1px solid rgba(234,179,8,0.25)', background: 'rgba(234,179,8,0.06)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.65rem', color: '#EAB308', fontWeight: 700, display: 'block' }}>🥇 RANK #1</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F1F2F4' }}>+50 Tokens</span>
            </div>
            <div className="surface-2" style={{ padding: '0.65rem 0.35rem', textAlign: 'center', border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(148,163,184,0.06)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, display: 'block' }}>🥈 RANK #2</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F1F2F4' }}>+30 Tokens</span>
            </div>
            <div className="surface-2" style={{ padding: '0.65rem 0.35rem', textAlign: 'center', border: '1px solid rgba(217,119,6,0.25)', background: 'rgba(217,119,6,0.06)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.65rem', color: '#D97706', fontWeight: 700, display: 'block' }}>🥉 RANK #3</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F1F2F4' }}>+15 Tokens</span>
            </div>
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
  const questions = quest?.questions || quest?.Questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="surface" style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle style={{ width: 36, height: 36, color: '#F87171', margin: '0 auto 1rem' }} />
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#F1F2F4', fontWeight: 600 }}>No Questions Available</h3>
        <p style={{ fontSize: '0.85rem', color: '#8A8FA8', marginTop: '0.5rem', lineHeight: 1.5 }}>This weekly challenge does not have active questions yet.</p>
        <button onClick={() => setGameStarted(false)} className="btn-ghost" style={{ marginTop: '1.25rem', fontSize: '0.8rem' }}>
          Back to Challenge Details
        </button>
      </div>
    );
  }

  const questionId = currentQuestion.id || currentQuestion.Id;
  const questionText = currentQuestion.questionText || currentQuestion.QuestionText || '';
  const isSelected = (opt) => userAnswers[questionId] === opt;
  const hasAnswered = !!userAnswers[questionId];

  return (
    <div className="surface" style={{ padding: '1.75rem', maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.875rem' }}>
        <div>
          <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', display: 'block' }}>Progress</span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4' }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
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
          {questionText}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optVal = currentQuestion[`option${opt}`] ?? currentQuestion[`Option${opt}`] ?? '';
            const selected = isSelected(opt);
            return (
              <button
                key={opt}
                onClick={() => selectAnswer(questionId, opt)}
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
                <span style={{ width: 22, height: 22, borderRadius: 4, background: selected ? '#00C896' : '#08090E', color: selected ? '#08090E' : '#4B5068', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
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
          disabled={!hasAnswered}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem', opacity: !hasAnswered ? 0.4 : 1, cursor: !hasAnswered ? 'not-allowed' : 'pointer' }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Submit Answers' : 'Next Question'} <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}
