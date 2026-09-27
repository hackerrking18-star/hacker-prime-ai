import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { BALL_IMAGES } from './FireCircleBall';
import { 
  Zap, 
  Flame, 
  Crown, 
  History as HistoryIcon, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HistoryViewProps {
  history: PredictionResult[];
  onClearHistory: () => void;
  onRefresh: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onRefresh
}) => {
  const [showAll, setShowAll] = useState(false);

  const total = history.length;
  const wins = history.filter(h => h.win && !h.isJackpot).length;
  const jackpots = history.filter(h => h.isJackpot).length;
  const totalWins = wins + jackpots;
  const losses = history.filter(h => !h.win).length;
  const accuracy = total > 0 ? Math.round((totalWins / total) * 100) : 100;

  // Show only 6 predictions by default unless user toggles "Show all"
  const visibleHistory = showAll ? history : history.slice(0, 6);

  return (
    <div className="w-full flex flex-col gap-4 pb-20 animate-fadeIn">
      {/* Top Banner */}
      <div 
        className="w-full rounded-3xl p-5 sm:p-6 border bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/60 relative overflow-hidden"
        style={{
          borderColor: 'rgba(0, 245, 255, 0.3)',
          boxShadow: '0 0 25px rgba(0, 245, 255, 0.15)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <HistoryIcon size={18} />
            </div>
            <div>
              <h1 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-white">
                PREDICTION HISTORY
              </h1>
              <p className="text-[11px] text-slate-400">Verified live signal results & accuracy metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              title="Refresh"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClearHistory}
              title="Clear History"
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
          <div className="text-center p-2 rounded-xl bg-black/40 border border-cyan-500/20">
            <span className="block text-[10px] font-orbitron font-bold text-slate-400 uppercase">SIGNALS</span>
            <b className="font-orbitron text-sm sm:text-base text-cyan-300">{total}</b>
          </div>
          <div className="text-center p-2 rounded-xl bg-black/40 border border-emerald-500/20">
            <span className="block text-[10px] font-orbitron font-bold text-slate-400 uppercase">WINS</span>
            <b className="font-orbitron text-sm sm:text-base text-emerald-400">{wins}</b>
          </div>
          <div className="text-center p-2 rounded-xl bg-black/40 border border-yellow-500/20">
            <span className="block text-[10px] font-orbitron font-bold text-slate-400 uppercase">JACKPOTS</span>
            <b className="font-orbitron text-sm sm:text-base text-yellow-300">{jackpots}</b>
          </div>
          <div className="text-center p-2 rounded-xl bg-black/40 border border-purple-500/20">
            <span className="block text-[10px] font-orbitron font-bold text-slate-400 uppercase">ACCURACY</span>
            <b className="font-orbitron text-sm sm:text-base text-purple-300">{accuracy}%</b>
          </div>
        </div>
      </div>

      {/* History Items Container */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs font-orbitron font-bold text-slate-400">
          <span>SHOWING {visibleHistory.length} OF {total} SIGNALS</span>
          <span className="text-[10px] font-mono text-cyan-400">
            {showAll ? 'FULL HISTORY (SCROLLABLE)' : 'SHOWING TOP 6 RECENT'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border border-dashed border-white/15 bg-black/30 text-slate-500 font-orbitron text-xs">
            No predictions recorded yet. Launch a game to start generating signals.
          </div>
        ) : (
          <div className={`space-y-2.5 transition-all duration-300 ${showAll ? 'max-h-[70vh] overflow-y-auto pr-1' : ''}`}>
            {visibleHistory.map((h, i) => {
              const isJackpot = h.isJackpot;
              const isWin = h.win && !isJackpot;
              const isLoss = !h.win;

              const cardBorder = isJackpot
                ? 'border-yellow-400/60 bg-gradient-to-r from-amber-950/30 to-black/60 shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                : isWin
                ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 to-black/60 shadow-[0_0_15px_rgba(0,255,157,0.12)]'
                : 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 to-black/60 shadow-[0_0_15px_rgba(255,77,109,0.12)]';

              const ballImg = BALL_IMAGES[h.actualNum] || BALL_IMAGES[0];

              return (
                <div
                  key={`${h.period}-${i}`}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${cardBorder}`}
                >
                  {/* Left Metadata & Prediction vs Result */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-[#00f5ff]">
                        #{String(h.period).slice(-5)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({h.mode === '30s' ? '30 SEC' : '1 MIN'})
                      </span>

                      {/* Styled Neon Status Pills requested by user */}
                      {isJackpot ? (
                        /* Yellow Neon Pill with Styled Symbol */
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-black uppercase border"
                          style={{
                            background: 'rgba(255, 215, 0, 0.16)',
                            borderColor: '#ffd700',
                            color: '#fef08a',
                            boxShadow: '0 0 14px rgba(255, 215, 0, 0.45)'
                          }}
                        >
                          <Crown size={12} className="text-[#ffd700]" />
                          <span>JACKPOT ★</span>
                        </span>
                      ) : isWin ? (
                        /* Green Neon Pill with Styled Symbol */
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-black uppercase border"
                          style={{
                            background: 'rgba(0, 255, 157, 0.14)',
                            borderColor: '#00ff9d',
                            color: '#6ee7b7',
                            boxShadow: '0 0 14px rgba(0, 255, 157, 0.4)'
                          }}
                        >
                          <Zap size={12} className="text-[#00ff9d]" />
                          <span>WIN ✓</span>
                        </span>
                      ) : (
                        /* Red Neon Pill with Styled Symbol */
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-black uppercase border"
                          style={{
                            background: 'rgba(255, 77, 109, 0.14)',
                            borderColor: '#ff4d6d',
                            color: '#fca5a5',
                            boxShadow: '0 0 14px rgba(255, 77, 109, 0.4)'
                          }}
                        >
                          <Flame size={12} className="text-[#ff4d6d]" />
                          <span>LOSS ✕</span>
                        </span>
                      )}
                    </div>

                    {/* Prediction vs Actual Detail */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs font-mono">
                      <span className="text-slate-300">
                        Pred: <b className="text-amber-300 font-orbitron">{h.prediction}</b>
                        {h.predNum !== undefined && (
                          <span className="text-slate-400 ml-1">[{h.predNum}]</span>
                        )}
                      </span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span className="text-slate-300">
                        Actual: <b className="text-white font-orbitron">{h.actual}</b>
                        <span className="text-cyan-300 font-bold ml-1">({h.actualNum})</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Ball with Fire Aura */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full p-1 relative flex items-center justify-center">
                      {/* Fire Ring for ball */}
                      <div 
                        className="absolute inset-0 rounded-full animate-spin pointer-events-none"
                        style={{
                          animationDuration: '6s',
                          background: isJackpot 
                            ? 'conic-gradient(from 0deg, #ffd700, #ff8800, #ff0055, #ffd700)'
                            : isWin
                            ? 'conic-gradient(from 0deg, #00ff9d, #00f5ff, #10e07f, #00ff9d)'
                            : 'conic-gradient(from 0deg, #ff0055, #ff6600, #880022, #ff0055)',
                          maskImage: 'radial-gradient(circle, transparent 65%, black 67%)',
                          WebkitMaskImage: 'radial-gradient(circle, transparent 65%, black 67%)',
                          opacity: 0.8
                        }}
                      />
                      <img 
                        src={ballImg} 
                        alt={`Result Ball ${h.actualNum}`} 
                        className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative z-10"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scrolling Button: Show only 6 by default, toggle to show all with scrolling */}
        {history.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-cyan-950/40 to-black/60 hover:from-purple-900/60 hover:to-cyan-900/50 border border-cyan-400/40 text-cyan-300 font-orbitron font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all"
          >
            {showAll ? (
              <>
                <ChevronUp size={16} />
                <span>SHOW TOP 6 ONLY ↑</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>SHOW ALL PREDICTED HISTORY ({history.length} ITEMS) ↓</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
