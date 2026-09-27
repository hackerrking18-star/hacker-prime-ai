import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface CopyPredictionButtonProps {
  gameName: string;
  cycle: string;
  period: string;
  prediction: string;
  numberBall: number | null;
  step: number;
  confidence: number;
  onToast: (msg: string) => void;
}

export const CopyPredictionButton: React.FC<CopyPredictionButtonProps> = ({
  gameName,
  cycle,
  period,
  prediction,
  numberBall,
  step,
  confidence,
  onToast
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ballStr = numberBall !== null && numberBall !== undefined ? `${numberBall}` : 'AI AUTO';
    const confPct = Math.round(confidence * 100);

    const stylishText = `⚡ HACKER PRIME AI ⚡
━━━━━━━━━━━━━━━━━━━━━━
🎮 GAME : ${gameName || 'VIP WINGO'} (${cycle === '30s' ? '30 SEC' : '1 MIN'})
🎯 PERIOD : #${period ? period.slice(-5) : 'LIVE'}
🔮 PREDICTION : ${prediction || 'READY'}
🎱 FIRE BALL : ${ballStr} 🔥
📊 ACCURACY : ${confPct}% CONFIDENCE
🛡️ RECOVERY : STEP ${step}
👑 ALGO : HACKER PRIME VIP V4.9
━━━━━━━━━━━━━━━━━━━━━━
🔥 100% VERIFIED VIP SIGNAL`;

    try {
      await navigator.clipboard.writeText(stylishText);
      setCopied(true);
      onToast('⚡ HACKER PRIME AI PREDICTION COPIED!');
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = stylishText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      onToast('⚡ HACKER PRIME AI PREDICTION COPIED!');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative w-full py-3.5 px-5 rounded-2xl font-orbitron font-extrabold text-xs sm:text-sm tracking-widest uppercase cursor-pointer transition-all duration-200 border flex items-center justify-center gap-2 overflow-hidden shadow-lg ${
        copied
          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(0,255,157,0.45)]'
          : 'bg-cyan-950/60 border-cyan-400/70 text-cyan-200 hover:text-white hover:border-cyan-300 shadow-[0_0_20px_rgba(0,245,255,0.25)] hover:shadow-[0_0_30px_rgba(0,245,255,0.45)]'
      }`}
      style={{
        background: copied
          ? 'linear-gradient(135deg, rgba(16,224,127,0.25), rgba(5,150,105,0.35))'
          : 'linear-gradient(135deg, rgba(0,245,255,0.18), rgba(176,38,255,0.2))'
      }}
    >
      {/* Light sheen effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

      {copied ? (
        <>
          <Check size={18} className="text-emerald-400 animate-bounce" />
          <span>PREDICTION COPIED! ✓</span>
        </>
      ) : (
        <>
          <Copy size={17} className="text-cyan-400" />
          <span>COPY PREDICTION</span>
          <Sparkles size={14} className="text-yellow-400 opacity-80" />
        </>
      )}
    </button>
  );
};
