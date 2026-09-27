import React from 'react';
import { Sun, Sparkles, X, Eye, Sliders, Zap } from 'lucide-react';

interface BrightnessModalProps {
  isOpen: boolean;
  brightness: number; // e.g. 0.3 to 1.6 (default 1.0)
  neonIntensity: number; // e.g. 0.5 to 1.8 (default 1.0)
  scanlines: boolean;
  onBrightnessChange: (val: number) => void;
  onNeonIntensityChange: (val: number) => void;
  onScanlinesToggle: () => void;
  onClose: () => void;
}

export const BrightnessModal: React.FC<BrightnessModalProps> = ({
  isOpen,
  brightness,
  neonIntensity,
  scanlines,
  onBrightnessChange,
  onNeonIntensityChange,
  onScanlinesToggle,
  onClose
}) => {
  if (!isOpen) return null;

  const presets = [
    { label: 'Stealth 50%', val: 0.5 },
    { label: 'Balanced 85%', val: 0.85 },
    { label: 'Standard 100%', val: 1.0 },
    { label: 'Vivid 130%', val: 1.3 },
    { label: 'Overdrive 160%', val: 1.6 }
  ];

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-[420px] rounded-3xl p-6 overflow-hidden border-2 bg-gradient-to-b from-[#0a1128] via-[#05091a] to-[#02040c] text-white shadow-2xl"
        style={{
          borderColor: '#00f5ff',
          boxShadow: '0 0 35px rgba(0,245,255,0.35), 0 0 80px rgba(176,38,255,0.2)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(0,245,255,0.5)]">
              <Sun size={18} />
            </div>
            <div>
              <h3 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-cyan-300">
                NEON BRIGHTNESS
              </h3>
              <p className="text-[10px] text-slate-400">Futuristic visual illumination control</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Master Brightness Slider */}
        <div className="mb-5 bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-orbitron font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" />
              GLOBAL ILLUMINATION
            </span>
            <span className="font-mono font-extrabold text-sm text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              {Math.round(brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.6"
            step="0.05"
            value={brightness}
            onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f5ff]"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>30% Dim</span>
            <span>100% Native</span>
            <span>160% Blazing</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <span className="block text-[11px] font-orbitron font-bold text-slate-400 uppercase tracking-wider mb-2">
            LIGHT PRESETS
          </span>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => {
              const active = Math.abs(brightness - p.val) < 0.04;
              return (
                <button
                  key={p.label}
                  onClick={() => onBrightnessChange(p.val)}
                  className={`py-2 px-1 text-center rounded-xl text-[10px] font-orbitron font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black border-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Neon Glow Multiplier Slider */}
        <div className="mb-5 bg-purple-950/20 p-4 rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-orbitron font-bold text-slate-200 flex items-center gap-1.5">
              <Zap size={14} className="text-purple-400" />
              NEON GLOW INTENSITY
            </span>
            <span className="font-mono font-extrabold text-sm text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-500/30">
              {Math.round(neonIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={neonIntensity}
            onChange={(e) => onNeonIntensityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#b026ff]"
          />
        </div>

        {/* Holographic Scanlines Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <span className="text-xs font-orbitron font-bold text-slate-200 flex items-center gap-2">
            <Eye size={15} className="text-emerald-400" />
            CYBER SCANLINE OVERLAYS
          </span>
          <button
            onClick={onScanlinesToggle}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              scanlines ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                scanlines ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-orbitron font-extrabold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-98 cursor-pointer"
        >
          APPLY LIGHT SETTINGS ✓
        </button>
      </div>
    </div>
  );
};
