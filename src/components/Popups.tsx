import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FireCircleBall } from './FireCircleBall';
import { CheckCircle2, XCircle, Crown, Zap, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface WinPopupProps {
  isOpen: boolean;
  period: string;
  prediction: string;
  predNum?: number;
  actual: string;
  actualNum: number;
  onClose: () => void;
}

export const GreenNeonWinPopup: React.FC<WinPopupProps> = ({
  isOpen,
  period,
  prediction,
  predNum,
  actual,
  actualNum,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#00ff9d', '#00f5ff', '#ffffff', '#b026ff']
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.7 },
            colors: ['#00ff9d', '#22d3ee']
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.7 },
            colors: ['#00ff9d', '#ffffff']
          });
        }, 300);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Green Neon Modal Container */}
      <div 
        className="relative w-full max-w-[380px] rounded-3xl p-6 text-center overflow-hidden border-2 bg-gradient-to-b from-[#061e14] via-[#040f0c] to-[#020706]"
        style={{
          borderColor: '#00ff9d',
          boxShadow: '0 0 35px rgba(0,255,157,0.45), 0 0 80px rgba(0,255,157,0.25), inset 0 0 25px rgba(0,255,157,0.15)',
        }}
      >
        {/* Background Laser Aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#00ff9d]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-orbitron font-extrabold tracking-widest uppercase mb-3 border"
          style={{
            background: 'rgba(0,255,157,0.12)',
            borderColor: '#00ff9d',
            color: '#6ee7b7',
            boxShadow: '0 0 14px rgba(0,255,157,0.4)'
          }}
        >
          <Zap size={14} className="text-[#00ff9d]" />
          <span>HACKER PRIME • SIGNAL WIN</span>
        </div>

        {/* Title */}
        <h2 
          className="font-orbitron font-black text-2xl sm:text-3xl tracking-wide uppercase mb-2"
          style={{
            background: 'linear-gradient(135deg, #ffffff 10%, #00ff9d 60%, #6ee7b7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(0,255,157,0.6))'
          }}
        >
          🎉 NEON VICTORY!
        </h2>
        <p className="text-xs text-slate-300 mb-2">Algorithm predicted target verified successfully</p>

        {/* Fire Circle Ball Display */}
        <div className="my-2">
          <FireCircleBall number={actualNum} size="md" label={`WIN BALL • ${actualNum}`} />
        </div>

        {/* Info Grid */}
        <div 
          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border my-4 bg-black/40"
          style={{ borderColor: 'rgba(0,255,157,0.25)' }}
        >
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PERIOD</span>
            <span className="block text-xs sm:text-sm font-mono font-bold text-[#00f5ff] mt-0.5">#{period.slice(-5)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PREDICTED</span>
            <span className="block text-xs sm:text-sm font-orbitron font-extrabold text-amber-300 mt-0.5">{prediction}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">RESULT</span>
            <span className="block text-xs sm:text-sm font-orbitron font-extrabold text-[#00ff9d] mt-0.5">{actual}</span>
          </div>
        </div>

        {/* Collect Win Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-orbitron font-black text-sm tracking-wider text-[#021008] uppercase cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #a7f3d0, #00ff9d 40%, #059669 100%)',
            boxShadow: '0 0 25px rgba(0,255,157,0.5), inset 0 1px 0 rgba(255,255,255,0.7)'
          }}
        >
          <CheckCircle2 size={18} />
          <span>COLLECT WIN ✓</span>
        </button>
      </div>
    </div>
  );
};

interface LossPopupProps {
  isOpen: boolean;
  period: string;
  prediction: string;
  predNum?: number;
  actual: string;
  actualNum: number;
  step: number;
  onClose: () => void;
}

export const RedNeonLossPopup: React.FC<LossPopupProps> = ({
  isOpen,
  period,
  prediction,
  actual,
  actualNum,
  step,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Red Neon Modal Container */}
      <div 
        className="relative w-full max-w-[380px] rounded-3xl p-6 text-center overflow-hidden border-2 bg-gradient-to-b from-[#22040c] via-[#140207] to-[#080103]"
        style={{
          borderColor: '#ff0055',
          boxShadow: '0 0 35px rgba(255,0,85,0.5), 0 0 85px rgba(255,0,85,0.25), inset 0 0 25px rgba(255,0,85,0.15)',
        }}
      >
        {/* Background Laser Aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#ff0055]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-orbitron font-extrabold tracking-widest uppercase mb-3 border"
          style={{
            background: 'rgba(255,0,85,0.14)',
            borderColor: '#ff0055',
            color: '#ff6a91',
            boxShadow: '0 0 14px rgba(255,0,85,0.4)'
          }}
        >
          <AlertTriangle size={14} className="text-[#ff0055]" />
          <span>RECOVERY PROTOCOL • LVL {step + 1}</span>
        </div>

        {/* Title */}
        <h2 
          className="font-orbitron font-black text-2xl sm:text-3xl tracking-wide uppercase mb-1.5"
          style={{
            background: 'linear-gradient(135deg, #ffffff 10%, #ff4d6d 60%, #ff0055 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(255,0,85,0.6))'
          }}
        >
          ⚡ ROUND MISSED
        </h2>
        <p className="text-xs text-rose-200/80 mb-2">Automated step multiplier applied for guaranteed recovery</p>

        {/* Ball Display */}
        <div className="my-2">
          <FireCircleBall number={actualNum} size="md" label={`RESULT • ${actualNum}`} />
        </div>

        {/* Info Grid */}
        <div 
          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border my-4 bg-black/50"
          style={{ borderColor: 'rgba(255,0,85,0.3)' }}
        >
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PERIOD</span>
            <span className="block text-xs sm:text-sm font-mono font-bold text-slate-200 mt-0.5">#{period.slice(-5)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PREDICTED</span>
            <span className="block text-xs sm:text-sm font-orbitron font-extrabold text-amber-300 mt-0.5">{prediction}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">ACTUAL</span>
            <span className="block text-xs sm:text-sm font-orbitron font-extrabold text-[#ff4d6d] mt-0.5">{actual}</span>
          </div>
        </div>

        {/* Step Progression Notice */}
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-[11px] text-rose-200/90 font-mono mb-4 flex items-center justify-between">
          <span className="text-slate-400 font-bold">NEXT MULTIPLIER:</span>
          <span className="font-orbitron font-extrabold text-[#ff4d6d]">STEP {step + 1} (3X RECOVERY)</span>
        </div>

        {/* Acknowledge Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-orbitron font-black text-sm tracking-wider text-white uppercase cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #ff4d6d, #ff0055 50%, #990033 100%)',
            boxShadow: '0 0 25px rgba(255,0,85,0.55), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}
        >
          <ArrowRight size={18} />
          <span>ENGAGE RECOVERY STEP ▶</span>
        </button>
      </div>
    </div>
  );
};

interface JackpotPopupProps {
  isOpen: boolean;
  period: string;
  prediction: string;
  actualNum: number;
  onClose: () => void;
}

export const YellowNeonJackpotPopup: React.FC<JackpotPopupProps> = ({
  isOpen,
  period,
  prediction,
  actualNum,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#fbbf24', '#ffffff', '#ff9900', '#00f5ff']
        });
        setTimeout(() => {
          confetti({
            particleCount: 90,
            angle: 90,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#f59e0b', '#ffffff']
          });
        }, 250);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Yellow / Golden Neon Modal Container */}
      <div 
        className="relative w-full max-w-[390px] rounded-3xl p-6 text-center overflow-hidden border-2 bg-gradient-to-b from-[#241a02] via-[#140e02] to-[#080501]"
        style={{
          borderColor: '#ffd700',
          boxShadow: '0 0 45px rgba(255,215,0,0.55), 0 0 95px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,215,0,0.2)',
        }}
      >
        {/* Background Laser Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-52 h-32 bg-[#ffd700]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-orbitron font-extrabold tracking-widest uppercase mb-3 border animate-bounce"
          style={{
            background: 'rgba(255,215,0,0.18)',
            borderColor: '#ffd700',
            color: '#fde68a',
            boxShadow: '0 0 18px rgba(255,215,0,0.5)'
          }}
        >
          <Crown size={15} className="text-[#ffd700]" />
          <span>VIP EXACT NUMBER JACKPOT (9X)</span>
        </div>

        {/* Title */}
        <h2 
          className="font-orbitron font-black text-2xl sm:text-3xl tracking-wide uppercase mb-1.5"
          style={{
            background: 'linear-gradient(135deg, #ffffff 10%, #ffd700 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.7))'
          }}
        >
          🌟 ULTRA JACKPOT!
        </h2>
        <p className="text-xs text-amber-200/90 mb-2">Exact number matched with maximum 9X multiplier payout</p>

        {/* Fire Circle Ball Display */}
        <div className="my-2 scale-105">
          <FireCircleBall number={actualNum} size="md" label={`JACKPOT BALL • ${actualNum}`} />
        </div>

        {/* Info Grid */}
        <div 
          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border my-4 bg-black/50"
          style={{ borderColor: 'rgba(255,215,0,0.35)' }}
        >
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PERIOD</span>
            <span className="block text-xs sm:text-sm font-mono font-bold text-amber-200 mt-0.5">#{period.slice(-5)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">PREDICTED</span>
            <span className="block text-xs sm:text-sm font-orbitron font-extrabold text-[#00f5ff] mt-0.5">{prediction}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-orbitron font-bold">JACKPOT</span>
            <span className="block text-xs sm:text-sm font-orbitron font-black text-[#ffd700] mt-0.5">BALL {actualNum}</span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-orbitron font-black text-sm tracking-wider text-[#1a1202] uppercase cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #fffbeb, #ffd700 40%, #f59e0b 80%, #b45309 100%)',
            boxShadow: '0 0 30px rgba(255,215,0,0.65), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <Crown size={18} />
          <span>CLAIM JACKPOT 👑</span>
        </button>
      </div>
    </div>
  );
};
