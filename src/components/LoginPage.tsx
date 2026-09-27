import React, { useState } from 'react';
import { activateLicenseKey } from '../utils/licenseManager';
import { LicenseKey } from '../types';
import { 
  Crown, 
  Key, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Sun,
  Download
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (keyObj: LicenseKey) => void;
  onOpenAdmin: () => void;
  onOpenBrightness: () => void;
  onToast: (msg: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenAdmin,
  onOpenBrightness,
  onToast
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await activateLicenseKey(licenseInput);
      setIsLoading(false);

      if (res.success && res.keyObj) {
        onToast(res.message);
        onLoginSuccess(res.keyObj);
      } else {
        setErrorMsg(res.message);
        onToast(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Failed to verify license with server. Please try again.');
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-md flex items-center justify-between gap-1.5 z-20 pt-2">
        <button
          onClick={onOpenBrightness}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-cyan-400/40 text-cyan-300 font-orbitron font-extrabold text-[10px] tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,255,0.2)]"
        >
          <Sun size={13} className="text-cyan-400" />
          <span>BRIGHTNESS</span>
        </button>

        {/* Download Standalone HTML */}
        <a
          href="/download/hacker-prime-ai.html"
          download="hacker-prime-ai.html"
          className="flex items-center gap-1 py-1.5 px-2.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-400/60 text-emerald-300 font-orbitron font-extrabold text-[10px] tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.35)]"
          title="Download Standalone .HTML File"
        >
          <Download size={13} className="text-emerald-400" />
          <span>.HTML FILE</span>
        </a>

        {/* Admin Panel Button */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-purple-950/60 hover:bg-purple-900/80 border border-purple-400/60 text-purple-200 font-orbitron font-extrabold text-[10px] sm:text-[11px] tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(176,38,255,0.35)]"
        >
          <ShieldCheck size={14} className="text-purple-300" />
          <span>ADMIN</span>
        </button>
      </div>

      {/* Center Login Card */}
      <div className="w-full max-w-[420px] my-auto py-6 z-20">
        <div 
          className="relative rounded-3xl p-6 sm:p-8 border-2 bg-gradient-to-b from-[#090e29] via-[#050818] to-[#02040d] text-center overflow-hidden shadow-2xl"
          style={{
            borderColor: '#00f5ff',
            boxShadow: '0 0 35px rgba(0,245,255,0.35), 0 0 80px rgba(176,38,255,0.2), inset 0 0 25px rgba(0,245,255,0.06)'
          }}
        >
          {/* Top Holographic Scanline */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

          {/* Logo Mark */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_25px_rgba(0,245,255,0.5)] mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#050716] flex items-center justify-center">
              <Crown size={36} className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
            </div>
          </div>

          {/* Brand Heading */}
          <h1 
            className="font-orbitron font-black text-2xl sm:text-3xl tracking-widest uppercase mb-1"
            style={{
              background: 'linear-gradient(90deg, #ffffff, #00f5ff 50%, #b026ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(0,245,255,0.4))'
            }}
          >
            HACKER PRIME AI
          </h1>
          <p className="text-[11px] font-orbitron font-bold text-cyan-300 tracking-widest uppercase mb-5">
            VIP PREDICTION ENGINE • DEVICE ACCESS
          </p>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 text-left animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form (Strictly NO leaked keys shown on page as requested) */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-orbitron font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Key size={13} className="text-cyan-400" />
                <span>DEVICE LICENSE KEY</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                  placeholder="HACKER-XXXX-XXXX"
                  maxLength={24}
                  className="w-full py-3.5 px-4 rounded-2xl bg-black/60 border border-cyan-500/40 text-cyan-200 placeholder-slate-600 font-mono font-extrabold text-sm sm:text-base tracking-widest text-center focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30 transition-all uppercase"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-center pt-1">
                Enter your generated admin license key to open in any device.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-black font-orbitron font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(0,245,255,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>VERIFYING LICENSE...</span>
                </>
              ) : (
                <>
                  <span>ACTIVATE & ENTER ENGINE</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Form ends */}
        </div>
      </div>

      {/* Footer */}
      <div className="z-20 text-center pb-2">
        <span className="text-[10px] font-orbitron text-cyan-400/80 tracking-widest font-bold">
          ⚡ POWERED BY HACKER PRIME AI
        </span>
      </div>
    </div>
  );
};
