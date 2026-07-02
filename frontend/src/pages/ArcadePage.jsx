import { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Coins, Trophy, Star, Zap, Brain, Target, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ── Utility ───────────────────────────────────────────────────────────────────
async function claimReward(amount, game, updateUser) {
  try {
    const res = await api.post('/api/users/me/reward', { amount, game });
    updateUser({ credits: res.data.credits });
    toast.success(`🎉 +${res.data.earned} Credits earned from ${game}!`);
  } catch {
    toast.error('Failed to claim reward. Please try again.');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME 1: Memory Match
// ══════════════════════════════════════════════════════════════════════════════
const EMOJIS = ['🌟','🎯','🚀','💎','🔮','🎭','🌈','⚡'];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function MemoryMatch({ onWin }) {
  const [cards, setCards] = useState(() =>
    shuffle([...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })))
  );
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleFlip = (card) => {
    if (locked || card.flipped || card.matched || selected.length === 2) return;
    const next = [...cards];
    next[card.id] = { ...card, flipped: true };
    setCards(next);
    const newSelected = [...selected, { ...card, flipped: true }];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      setTimeout(() => {
        const [a, b] = newSelected;
        setCards(prev => prev.map(c => {
          if (c.id === a.id || c.id === b.id) {
            return a.emoji === b.emoji
              ? { ...c, matched: true }
              : { ...c, flipped: false };
          }
          return c;
        }));
        setSelected([]);
        setLocked(false);
        setCards(prev => {
          const allDone = prev.every(c => c.matched || (c.id === a.id || c.id === b.id ? a.emoji === b.emoji : false));
          if (prev.filter(c => !c.matched).length === 2 && a.emoji === b.emoji) {
            setWon(true);
            onWin(20);
          }
          return prev;
        });
      }, 800);
    }
  };

  // Check win after state update
  useEffect(() => {
    if (cards.every(c => c.matched) && cards.length > 0 && !won) {
      setWon(true);
      onWin(20);
    }
  }, [cards]);

  const restart = () => {
    setCards(shuffle([...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
    setSelected([]);
    setMoves(0);
    setWon(false);
    setLocked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Moves: <span className="text-white font-bold">{moves}</span></span>
        <span>Matched: <span className="text-green-400 font-bold">{cards.filter(c => c.matched).length / 2}/{EMOJIS.length}</span></span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleFlip(card)}
            className={`aspect-square rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-300 border ${
              card.matched
                ? 'border-green-500/50 bg-green-500/10 scale-95'
                : card.flipped
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '❓'}
          </button>
        ))}
      </div>
      {won && (
        <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 font-bold text-lg">🎉 You won in {moves} moves! +20 Credits!</p>
          <button onClick={restart} className="mt-3 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-all">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME 2: Number Guess
// ══════════════════════════════════════════════════════════════════════════════
function NumberGuess({ onWin }) {
  const [target] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [guess, setGuess] = useState('');
  const [hints, setHints] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const MAX = 6;

  const handleGuess = () => {
    const n = parseInt(guess);
    if (!n || n < 1 || n > 20) { toast.error('Enter a number between 1 and 20!'); return; }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (n === target) {
      const reward = Math.max(10, 30 - newAttempts * 4);
      setHints(prev => [...prev, { n, hint: '✅ Correct!', color: 'text-green-400' }]);
      setWon(true);
      onWin(reward);
    } else {
      const hint = n < target ? `📈 ${n} is too LOW` : `📉 ${n} is too HIGH`;
      const color = n < target ? 'text-blue-400' : 'text-red-400';
      setHints(prev => [...prev, { n, hint, color }]);
      if (newAttempts >= MAX) setLost(true);
    }
    setGuess('');
  };

  const restart = () => window.location.reload();

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm text-center">Guess a number between <span className="text-white font-bold">1 – 20</span></p>
      <div className="flex justify-center gap-1 mb-2">
        {Array.from({ length: MAX }).map((_, i) => (
          <div key={i} className={`w-6 h-2 rounded-full transition-all ${i < attempts ? (won ? 'bg-green-500' : lost ? 'bg-red-500' : 'bg-orange-400') : 'bg-white/10'}`} />
        ))}
      </div>

      {!won && !lost && (
        <div className="flex gap-2">
          <input
            type="number" min={1} max={20} value={guess}
            onChange={e => setGuess(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuess()}
            placeholder="Your guess..."
            className="input-field flex-1 text-center text-lg font-bold"
          />
          <button onClick={handleGuess} className="btn-primary px-5">Guess</button>
        </div>
      )}

      <div className="space-y-1 max-h-36 overflow-y-auto">
        {hints.map((h, i) => (
          <div key={i} className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg bg-white/5 ${h.color}`}>
            <span className="font-bold">{h.n}</span>
            <span>{h.hint}</span>
          </div>
        ))}
      </div>

      {won && (
        <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 font-bold">🎉 Correct! Number was {target}!</p>
        </div>
      )}
      {lost && (
        <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 font-bold">Game over! The number was {target}.</p>
          <button onClick={restart} className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-all">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME 3: Quick Math Quiz
// ══════════════════════════════════════════════════════════════════════════════
function genQuestion() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random() * 30) + 1; b = Math.floor(Math.random() * 30) + 1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 30) + 10; b = Math.floor(Math.random() * 10) + 1; answer = a - b; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b; }
  // Generate 4 choices
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w !== answer && w > 0) wrongs.add(w);
  }
  const choices = shuffle([answer, ...[...wrongs]]);
  return { question: `${a} ${op} ${b}`, answer, choices };
}

function MathQuiz({ onWin }) {
  const TOTAL = 5;
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(genQuestion);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (done || selected !== null) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          nextQuestion(false);
          return 10;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qIndex, selected, done]);

  const nextQuestion = useCallback((correct) => {
    const newScore = correct ? score + 1 : score;
    if (qIndex + 1 >= TOTAL) {
      const reward = newScore >= 4 ? 30 : newScore >= 3 ? 20 : newScore >= 2 ? 10 : 5;
      setScore(newScore);
      setDone(true);
      if (newScore >= 2) onWin(reward);
    } else {
      setScore(newScore);
      setQIndex(i => i + 1);
      setQ(genQuestion());
      setSelected(null);
      setTimeLeft(10);
    }
  }, [qIndex, score]);

  const handleAnswer = (choice) => {
    if (selected !== null) return;
    setSelected(choice);
    setTimeout(() => nextQuestion(choice === q.answer), 600);
  };

  if (done) {
    const reward = score >= 4 ? 30 : score >= 3 ? 20 : score >= 2 ? 10 : 5;
    return (
      <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <p className="text-3xl mb-2">{score >= 4 ? '🏆' : score >= 3 ? '🎉' : score >= 2 ? '😊' : '😔'}</p>
        <p className="text-white font-bold text-lg">Score: {score}/{TOTAL}</p>
        {score >= 2
          ? <p className="text-green-400 text-sm mt-1">+{reward} Credits earned!</p>
          : <p className="text-gray-400 text-sm mt-1">Need 2+ correct to earn credits. Try again!</p>
        }
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Question <span className="text-white font-bold">{qIndex + 1}/{TOTAL}</span></span>
        <span className={`font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-yellow-400'}`}>⏱ {timeLeft}s</span>
        <span className="text-gray-400">Score: <span className="text-green-400 font-bold">{score}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${(timeLeft / 10) * 100}%` }} />
      </div>
      <div className="text-center py-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-3xl font-bold text-white">{q.question} = ?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(c)}
            disabled={selected !== null}
            className={`py-3 rounded-xl font-bold text-lg transition-all ${
              selected === null ? 'bg-white/5 border border-white/15 text-white hover:bg-purple-500/20 hover:border-purple-500/40'
              : selected === c
                ? c === q.answer ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
                : c === q.answer ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-white/5 border border-white/10 text-gray-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME 4: Reaction Speed Test
// ══════════════════════════════════════════════════════════════════════════════
function ReactionGame({ onWin }) {
  const [phase, setPhase] = useState('idle'); // idle | wait | go | result
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  const start = () => {
    setPhase('wait');
    setReactionTime(null);
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setPhase('go');
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'wait') {
      clearTimeout(timerRef.current);
      setPhase('idle');
      toast.error('Too early! Wait for GREEN!');
    } else if (phase === 'go') {
      const rt = Date.now() - startTime;
      setReactionTime(rt);
      const reward = rt < 250 ? 30 : rt < 400 ? 20 : rt < 600 ? 15 : 10;
      setPhase('result');
      onWin(reward);
    }
  };

  const rating = reactionTime
    ? reactionTime < 250 ? { label: '⚡ Lightning Fast!', color: 'text-yellow-400' }
    : reactionTime < 400 ? { label: '🚀 Super Fast!', color: 'text-green-400' }
    : reactionTime < 600 ? { label: '👍 Good Reaction!', color: 'text-blue-400' }
    : { label: '🐢 Keep Practicing!', color: 'text-purple-400' }
    : null;

  const reward = reactionTime
    ? reactionTime < 250 ? 30 : reactionTime < 400 ? 20 : reactionTime < 600 ? 15 : 10
    : 0;

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm text-center">Wait for the button to turn <span className="text-green-400 font-bold">GREEN</span>, then click as fast as you can!</p>

      <button
        onClick={phase === 'idle' || phase === 'result' ? start : handleClick}
        className={`w-full py-12 rounded-2xl text-2xl font-bold transition-all duration-200 border-2 ${
          phase === 'idle' || phase === 'result'
            ? 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/30'
            : phase === 'wait'
            ? 'bg-red-500/20 border-red-500/50 text-red-400 cursor-not-allowed'
            : 'bg-green-500/30 border-green-400 text-green-300 animate-pulse cursor-pointer scale-[1.02]'
        }`}
      >
        {phase === 'idle' ? '▶ Start Game'
          : phase === 'wait' ? '🔴 Wait...'
          : phase === 'go' ? '🟢 CLICK NOW!'
          : '▶ Play Again'}
      </button>

      {phase === 'result' && rating && (
        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <p className={`text-xl font-bold ${rating.color}`}>{rating.label}</p>
          <p className="text-white text-2xl font-black">{reactionTime}ms</p>
          <p className="text-yellow-400 font-semibold">+{reward} Credits earned!</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ARCADE PAGE
// ══════════════════════════════════════════════════════════════════════════════
const GAMES = [
  {
    id: 'memory', title: 'Memory Match', icon: Brain,
    color: 'from-purple-500 to-pink-500', shadowColor: 'shadow-purple-500/20',
    reward: '+20 Credits', desc: 'Flip cards and match all emoji pairs to earn credits!',
    component: MemoryMatch,
  },
  {
    id: 'guess', title: 'Number Guess', icon: Target,
    color: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20',
    reward: '+10–30 Credits', desc: 'Guess the secret number in 6 attempts. Fewer guesses = more credits!',
    component: NumberGuess,
  },
  {
    id: 'math', title: 'Math Quiz', icon: Zap,
    color: 'from-yellow-500 to-orange-500', shadowColor: 'shadow-yellow-500/20',
    reward: '+5–30 Credits', desc: 'Answer 5 quick math questions before the timer runs out!',
    component: MathQuiz,
  },
  {
    id: 'reaction', title: 'Reaction Speed', icon: Timer,
    color: 'from-green-500 to-teal-500', shadowColor: 'shadow-green-500/20',
    reward: '+10–30 Credits', desc: 'Click when the button turns green. Faster reaction = more credits!',
    component: ReactionGame,
  },
];

export default function ArcadePage() {
  const { user, updateUser } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [key, setKey] = useState(0);

  const handleWin = useCallback(async (amount) => {
    await claimReward(amount, activeGame, updateUser);
  }, [activeGame, updateUser]);

  const openGame = (gameId) => {
    setActiveGame(gameId);
    setKey(k => k + 1);
  };

  const closeGame = () => setActiveGame(null);

  const game = GAMES.find(g => g.id === activeGame);
  const GameComponent = game?.component;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Gamepad2 className="text-white" size={26} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">AI Arcade</h1>
          <p className="text-gray-500 text-sm">Play games • Earn credits • Generate more AI content</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/30"
             style={{ background: 'rgba(234,179,8,0.08)' }}>
          <Coins size={16} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold">{user?.credits ?? 0} Credits</span>
        </div>
      </div>

      {/* Low Credits Banner */}
      {(user?.credits ?? 0) < 20 && (
        <div className="p-4 rounded-2xl border border-orange-500/30 flex items-center gap-3"
             style={{ background: 'rgba(249,115,22,0.08)' }}>
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-orange-400 font-bold">Running low on credits!</p>
            <p className="text-gray-400 text-sm">Play any game below to earn free credits and keep generating!</p>
          </div>
        </div>
      )}

      {/* Active Game Modal */}
      {activeGame && game && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(10,10,30,0.98)' }}>
            {/* Game header */}
            <div className={`p-5 bg-gradient-to-r ${game.color} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <game.icon className="text-white" size={22} />
                <div>
                  <h2 className="text-white font-bold text-lg">{game.title}</h2>
                  <p className="text-white/70 text-xs">Reward: {game.reward}</p>
                </div>
              </div>
              <button onClick={closeGame}
                      className="text-white/70 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
                ✕
              </button>
            </div>
            <div className="p-5">
              <GameComponent key={key} onWin={handleWin} />
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {GAMES.map(g => {
          const Icon = g.icon;
          return (
            <div key={g.id}
                 className="group relative p-6 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer"
                 style={{ background: 'rgba(255,255,255,0.02)' }}
                 onClick={() => openGame(g.id)}>

              {/* Glow bg */}
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity bg-gradient-to-br ${g.color}`} />

              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-4 shadow-lg ${g.shadowColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={26} />
                </div>

                <h3 className="text-white font-bold text-lg mb-1">{g.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{g.desc}</p>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold text-sm">
                    <Coins size={14} /> {g.reward}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openGame(g.id); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${g.color} hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md`}
                  >
                    Play Now →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="p-5 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-yellow-400" />
          <h3 className="text-white font-bold">How Credits Work</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl mb-1">🎮</p>
            <p className="text-gray-300 font-medium">Play a game</p>
            <p className="text-gray-500 text-xs">Choose any game from above</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-gray-300 font-medium">Win & earn</p>
            <p className="text-gray-500 text-xs">Credits added instantly</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-2xl mb-1">✨</p>
            <p className="text-gray-300 font-medium">Generate AI</p>
            <p className="text-gray-500 text-xs">Use credits on any tool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
