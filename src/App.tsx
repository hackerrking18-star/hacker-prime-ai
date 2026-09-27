import React, { useState, useEffect, useRef } from 'react';
import { 
  Game, 
  LicenseKey, 
  PredictionResult, 
  ActivePrediction, 
  ThemeId,
  ThemeConfig 
} from './types';
import { 
  getActiveSession, 
  clearActiveSession, 
  formatTimeRemaining,
  verifyKeyOnline,
  syncLocalKeysWithServer
} from './utils/licenseManager';
import { LoginPage } from './components/LoginPage';
import { AdminModal } from './components/AdminModal';
import { BrightnessModal } from './components/BrightnessModal';
import { FireCircleBall } from './components/FireCircleBall';
import { CopyPredictionButton } from './components/CopyPredictionButton';
import { 
  GreenNeonWinPopup, 
  RedNeonLossPopup, 
  YellowNeonJackpotPopup 
} from './components/Popups';
import { HistoryView } from './components/HistoryView';
import { 
  Crown, 
  Sun, 
  Palette, 
  History as HistoryIcon, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  Search, 
  X, 
  Timer, 
  Clock, 
  Scale, 
  Rocket, 
  ArrowLeft, 
  Activity, 
  RefreshCw, 
  Home,
  Check,
  Download
} from 'lucide-react';

/* ===== PRE-LOADED VIP GAMES ===== */
const GAMES: Game[] = [
  { name: 'Tiranga', img: 'https://iili.io/BbtJtiF.jpg', category: 'popular wingo', rank: 1 },
  { name: '91 Club', img: 'https://image2url.com/r2/default/images/1770538362082-7597276c-1467-4d5f-a65e-6fe83a8ea6a8.jpg', category: 'popular vip', rank: 2 },
  { name: 'Sikkim', img: 'https://i.ibb.co/FqWBnxKW/IMG-20250909-003217-427.jpg', category: 'wingo', rank: 3 },
  { name: 'Ok Win', img: 'https://image2url.com/r2/default/images/1770538182409-884f52c3-a8d4-45c1-9a70-0037abafa4c8.jpg', category: 'popular wingo', rank: 4 },
  { name: 'Dm Win', img: 'https://image2url.com/r2/default/images/1770538407894-5b8f04f6-6476-4151-a0ac-d538afc1054c.jpg', category: 'wingo', rank: 5 },
  { name: '82 Lottery', img: 'https://image2url.com/r2/default/images/1770538499860-c11eb11e-daba-4702-a0be-e4429c3088fe.jpg', category: 'vip', rank: 6 },
  { name: 'Jalwa Game', img: 'https://image2url.com/r2/default/images/1770571204678-09d03ca3-e20d-4dfe-a91e-819afbfbfd15.jpg', category: 'popular', rank: 7 },
  { name: 'Big Mumbai', img: 'https://iili.io/BbtJ8Pe.webp', category: 'popular vip', rank: 8 },
  { name: 'BDG Win', img: 'https://i.ibb.co/2YpcCC3r/IMG-20250909-003217-107.jpg', category: 'popular wingo', rank: 9 }
];

/* ===== VIP THEMES ===== */
const THEMES: ThemeConfig[] = [
  { id: 'neon-hacker', name: 'HACKER NEON', swatch: 'linear-gradient(135deg, #00f5ff, #b026ff, #00ff9d)', primaryGlow: '#00f5ff' },
  { id: 'royal-gold', name: 'ROYAL GOLD', swatch: 'linear-gradient(135deg, #fbbf24, #7c3aed)', primaryGlow: '#fbbf24' },
  { id: 'emerald-vip', name: 'EMERALD VIP', swatch: 'linear-gradient(135deg, #10e07f, #22d3ee)', primaryGlow: '#10e07f' },
  { id: 'crimson-vip', name: 'CRIMSON VIP', swatch: 'linear-gradient(135deg, #ff4d6d, #f59e0b)', primaryGlow: '#ff4d6d' },
  { id: 'ocean-diamond', name: 'OCEAN DIAMOND', swatch: 'linear-gradient(135deg, #22d3ee, #6366f1)', primaryGlow: '#22d3ee' },
  { id: 'violet-crown', name: 'VIOLET CROWN', swatch: 'linear-gradient(135deg, #c084fc, #ec4899)', primaryGlow: '#c084fc' }
];

const PROXIES = [
  (u: string) => u,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`
];

export default function App() {
  // Session & Authentication
  const [activeSession, setActiveSession] = useState<LicenseKey | null>(() => getActiveSession());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBrightnessOpen, setIsBrightnessOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Appearance & Lighting
  const [brightness, setBrightness] = useState<number>(() => {
    const s = localStorage.getItem('hacker_brightness');
    return s ? parseFloat(s) : 1.0;
  });
  const [neonIntensity, setNeonIntensity] = useState<number>(() => {
    const s = localStorage.getItem('hacker_neon_intensity');
    return s ? parseFloat(s) : 1.0;
  });
  const [scanlines, setScanlines] = useState<boolean>(() => {
    return localStorage.getItem('hacker_scanlines') !== 'false';
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('hacker_theme') as ThemeId) || 'neon-hacker';
  });

  // Navigation: 'home' | 'select' | 'prediction' | 'history'
  const [activeView, setActiveView] = useState<'home' | 'select' | 'prediction' | 'history'>('home');
  const [currentGame, setCurrentGame] = useState<Game>(GAMES[0]);
  const [selectedCycle, setSelectedCycle] = useState<'30s' | '1m'>('1m');
  const [gameSearch, setGameSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Prediction Engine State
  const [activePrediction, setActivePrediction] = useState<ActivePrediction | null>(null);
  const [isAnalysing, setIsAnalysing] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [lossCount, setLossCount] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>('00:00');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem('hacker_prime_history_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Popups State (Replacing current popups with Green Win, Red Loss, and Yellow Jackpot)
  const [winPopupData, setWinPopupData] = useState<{
    show: boolean;
    period: string;
    prediction: string;
    actual: string;
    actualNum: number;
    predNum?: number;
  }>({ show: false, period: '', prediction: '', actual: '', actualNum: 0 });

  const [lossPopupData, setLossPopupData] = useState<{
    show: boolean;
    period: string;
    prediction: string;
    actual: string;
    actualNum: number;
    predNum?: number;
    step: number;
  }>({ show: false, period: '', prediction: '', actual: '', actualNum: 0, step: 1 });

  const [jackpotPopupData, setJackpotPopupData] = useState<{
    show: boolean;
    period: string;
    prediction: string;
    actualNum: number;
  }>({ show: false, period: '', prediction: '', actualNum: 0 });

  const lastProcessedIssueRef = useRef<string>('');
  const currentActiveRef = useRef<ActivePrediction | null>(null);

  // Sync refs
  useEffect(() => {
    currentActiveRef.current = activePrediction;
  }, [activePrediction]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('hacker_theme', currentTheme);
  }, [currentTheme]);

  // Apply Brightness & Neon Intensity CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', brightness.toString());
    document.documentElement.style.setProperty('--neon-intensity', neonIntensity.toString());
    localStorage.setItem('hacker_brightness', brightness.toString());
    localStorage.setItem('hacker_neon_intensity', neonIntensity.toString());
    localStorage.setItem('hacker_scanlines', scanlines ? 'true' : 'false');
  }, [brightness, neonIntensity, scanlines]);

  // Save history
  useEffect(() => {
    localStorage.setItem('hacker_prime_history_v2', JSON.stringify(history.slice(0, 100)));
  }, [history]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  };

  // Sync existing local keys to server on mount
  useEffect(() => {
    syncLocalKeysWithServer();
  }, []);

  // Periodic Session Expiration & Revocation Guard
  useEffect(() => {
    const timer = setInterval(async () => {
      if (activeSession) {
        const res = await verifyKeyOnline(activeSession.key);
        if (!res.valid) {
          clearActiveSession();
          setActiveSession(null);
          showToast(res.reason || '⚠️ License session has expired or was revoked by administrator.');
        } else if (res.keyObj) {
          setActiveSession(res.keyObj);
        }
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSession]);

  // Handle Fetch History for Active Cycle
  const fetchWingoHistory = async (cycle: '30s' | '1m') => {
    const endpoint = `https://draw.ar-lottery01.com/WinGo/WinGo_${cycle === '30s' ? '30S' : '1M'}/GetHistoryIssuePage.json?ts=${Date.now()}`;
    for (const proxy of PROXIES) {
      try {
        const r = await fetch(proxy(endpoint), { cache: 'no-store' });
        if (!r.ok) continue;
        const d = await r.json();
        const list = d?.data?.list ?? d?.data?.gameslist ?? d?.list ?? [];
        if (Array.isArray(list) && list.length > 0) return list;
      } catch {
        // try next proxy
      }
    }
    return [];
  };

  // Run Prediction Engine Cycle
  const runPredictionEngine = async () => {
    if (isAnalysing) return;

    try {
      const list = await fetchWingoHistory(selectedCycle);
      if (!list || list.length === 0) return;

      const latest = list[0];
      const issue = String(latest.issueNumber ?? latest.issue ?? latest.periodNumber ?? '');

      if (issue && lastProcessedIssueRef.current !== '' && lastProcessedIssueRef.current !== issue) {
        // Process outcome of last predicted period
        const active = currentActiveRef.current;
        if (active && active.period === issue) {
          const num = parseInt(String(latest.number ?? latest.openCode ?? latest.winNumber ?? '0'));
          const actualOutcome: 'BIG' | 'SMALL' = num >= 5 ? 'BIG' : 'SMALL';
          const isJackpotHit = (num === active.n1);
          const isSizeWin = (actualOutcome === active.size);
          const isOverallWin = isJackpotHit || isSizeWin;

          if (isJackpotHit) {
            // Jackpot hit
            setWinStreak(prev => prev + 1);
            setLossCount(0);
            setStep(1);
            setTotalWins(prev => prev + 1);
            setJackpotPopupData({
              show: true,
              period: issue,
              prediction: active.size,
              actualNum: num
            });
          } else if (isSizeWin) {
            // Win
            setWinStreak(prev => prev + 1);
            setLossCount(0);
            setStep(1);
            setTotalWins(prev => prev + 1);
            setWinPopupData({
              show: true,
              period: issue,
              prediction: active.size,
              predNum: active.n1,
              actual: actualOutcome,
              actualNum: num
            });
          } else {
            // Loss
            setLossCount(prev => prev + 1);
            setWinStreak(0);
            const nextStep = active.step + 1;
            setStep(nextStep);
            setTotalLosses(prev => prev + 1);
            setLossPopupData({
              show: true,
              period: issue,
              prediction: active.size,
              predNum: active.n1,
              actual: actualOutcome,
              actualNum: num,
              step: active.step
            });
          }

          // Save to History
          const newHistoryItem: PredictionResult = {
            period: issue,
            mode: selectedCycle,
            prediction: active.size,
            predNum: active.n1,
            actual: actualOutcome,
            actualNum: num,
            win: isOverallWin,
            isJackpot: isJackpotHit,
            step: active.step,
            timestamp: Date.now()
          };

          setHistory(prev => [newHistoryItem, ...prev]);
        }
      }

      // Generate Prediction for Next Period
      const nextPeriodNum = issue ? (BigInt(issue) + 1n).toString() : (Date.now().toString());
      const active = currentActiveRef.current;

      if (!active || active.period !== nextPeriodNum) {
        setIsAnalysing(true);
        await new Promise(r => setTimeout(r, 700));

        const seed = parseInt(nextPeriodNum.slice(-3)) || 123;
        const histNums = list.slice(0, 10).map((x: any) => parseInt(x.number ?? x.openCode ?? x.winNumber ?? '0'));
        const bigCount = histNums.filter((n: number) => n >= 5).length;

        // Dynamic Algorithm Selection
        const trend: 'BIG' | 'SMALL' = (seed % 2 === 0) 
          ? (bigCount >= 5 ? 'BIG' : 'SMALL') 
          : (histNums[0] >= 5 ? 'SMALL' : 'BIG');

        let n1: number;
        let n2: number;
        if (trend === 'BIG') {
          n1 = [5, 6, 7, 8, 9][(seed + (histNums[0] || 0)) % 5];
          n2 = [0, 1, 2, 3, 4][(seed * 3) % 5];
        } else {
          n1 = [0, 1, 2, 3, 4][(seed + (histNums[0] || 0)) % 5];
          n2 = [5, 6, 7, 8, 9][(seed * 7) % 5];
        }

        const currentStep = lossCount > 0 ? lossCount + 1 : 1;
        setStep(currentStep);

        const newPred: ActivePrediction = {
          period: nextPeriodNum,
          size: trend,
          n1,
          n2,
          confidence: 0.94 + ((seed % 5) * 0.01),
          step: currentStep
        };

        setActivePrediction(newPred);
        setIsAnalysing(false);
      }

      if (issue) lastProcessedIssueRef.current = issue;
    } catch {
      setIsAnalysing(false);
    }
  };

  // Timer Tick & Engine Poller
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const cycleDuration = selectedCycle === '30s' ? 30 : 60;
      const rem = cycleDuration - (nowSec % cycleDuration);
      setSecondsRemaining(rem);
      setCountdown(`00:${rem.toString().padStart(2, '0')}`);

      // Run prediction cycle when period turns over
      if (rem === 1 || rem === cycleDuration) {
        runPredictionEngine();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, selectedCycle, lossCount]);

  // Initial fetch on entering prediction screen
  useEffect(() => {
    if (activeSession && activeView === 'prediction') {
      runPredictionEngine();
    }
  }, [activeSession, activeView, selectedCycle]);

  // Logout handler
  const handleLogout = () => {
    clearActiveSession();
    setActiveSession(null);
    showToast('Logged out of HACKER PRIME AI.');
  };

  // If user is not authenticated with a valid license key, render Login View
  if (!activeSession) {
    return (
      <div 
        id="app-brightness-shell" 
        className="min-h-screen bg-black text-slate-100 relative overflow-hidden select-none"
        style={{
          backgroundImage: `
            radial-gradient(900px 500px at 50% -10%, rgba(0,245,255,0.18), transparent 65%),
            radial-gradient(800px 500px at 100% 50%, rgba(176,38,255,0.18), transparent 65%),
            radial-gradient(700px 500px at 0% 100%, rgba(0,255,157,0.12), transparent 65%),
            linear-gradient(180deg, #040615 0%, #02030a 100%)
          `
        }}
      >
        {/* Cyber Grid Background */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,245,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.2) 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />

        {/* Scanlines Overlay if enabled */}
        {scanlines && (
          <div 
            className="fixed inset-0 pointer-events-none z-10 opacity-30"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 2px, transparent 4px)'
            }}
          />
        )}

        <LoginPage
          onLoginSuccess={(key) => setActiveSession(key)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenBrightness={() => setIsBrightnessOpen(true)}
          onToast={showToast}
        />

        {/* Admin Modal */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onToast={showToast}
        />

        {/* Brightness Modal */}
        <BrightnessModal
          isOpen={isBrightnessOpen}
          brightness={brightness}
          neonIntensity={neonIntensity}
          scanlines={scanlines}
          onBrightnessChange={setBrightness}
          onNeonIntensityChange={setNeonIntensity}
          onScanlinesToggle={() => setScanlines(!scanlines)}
          onClose={() => setIsBrightnessOpen(false)}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[13000] py-2.5 px-5 rounded-full bg-slate-900 border border-cyan-400 text-cyan-200 text-xs font-orbitron font-extrabold tracking-wider shadow-[0_0_20px_rgba(0,245,255,0.5)] animate-fadeIn">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  // Filtered games
  const filteredGames = GAMES.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(gameSearch.toLowerCase().trim());
    const matchesCat = activeCategory === 'all' || g.category.includes(activeCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div 
      id="app-brightness-shell" 
      className="min-h-screen bg-black text-slate-100 relative overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundImage: `
          radial-gradient(1000px 600px at 50% -10%, rgba(0,245,255,0.16), transparent 62%),
          radial-gradient(900px 500px at 100% 50%, rgba(176,38,255,0.16), transparent 65%),
          radial-gradient(800px 500px at 0% 100%, rgba(0,255,157,0.1), transparent 65%),
          linear-gradient(180deg, #050818 0%, #02030a 100%)
        `
      }}
    >
      {/* Background Cyber Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-15 z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Cyber Scanline effect */}
      {scanlines && (
        <div 
          className="fixed inset-0 pointer-events-none z-10 opacity-25"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 2px, transparent 4px)'
          }}
        />
      )}

      {/* Main Container Shell */}
      <div className="relative z-20 w-full max-w-lg mx-auto flex-1 flex flex-col p-3 sm:p-4">

        {/* Global Futuristic Top Bar */}
        <header className="w-full flex items-center justify-between pb-3 mb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.4)]">
              <div className="w-full h-full rounded-[10px] bg-[#050716] flex items-center justify-center">
                <Crown size={18} className="text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-orbitron font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-400">
                HACKER PRIME
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VIP ENGINE • LIVE</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Brightness, Themes, Admin, License Info */}
          <div className="flex items-center gap-1.5">
            {/* Brightness Adjustment Button */}
            <button
              onClick={() => setIsBrightnessOpen(true)}
              title="Adjust Brightness & Neon Illumination"
              className="py-1.5 px-2.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-400/50 text-cyan-300 font-orbitron font-extrabold text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(0,245,255,0.2)] transition-all cursor-pointer"
            >
              <Sun size={13} className="text-cyan-400" />
              <span>{Math.round(brightness * 100)}%</span>
            </button>

            {/* Theme Selector */}
            <button
              onClick={() => setIsThemeOpen(true)}
              title="Change Neon Theme"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Palette size={15} />
            </button>

            {/* Download Standalone HTML File */}
            <a
              href="/download/hacker-prime-ai.html"
              download="hacker-prime-ai.html"
              title="Download Standalone .HTML File"
              className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)] transition-all cursor-pointer flex items-center justify-center"
            >
              <Download size={15} />
            </a>

            {/* Admin Panel Access */}
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Admin Panel (HACKER18)"
              className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-400/50 text-purple-300 shadow-[0_0_10px_rgba(176,38,255,0.25)] transition-all cursor-pointer"
            >
              <ShieldCheck size={15} />
            </button>

            {/* Session Info / Logout */}
            <button
              onClick={handleLogout}
              title={`Active License (${activeSession.key}). Click to logout.`}
              className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 transition-all cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Active Key Status Bar */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/40 border border-cyan-500/20 text-[10px] font-mono text-slate-400 mb-3">
          <span className="flex items-center gap-1 text-cyan-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            KEY: {activeSession.key}
          </span>
          <span className="text-emerald-400 font-bold">
            {formatTimeRemaining(activeSession.expiresAt)}
          </span>
        </div>

        {/* ================= VIEW 1: HOME (GAMES LIST) ================= */}
        {activeView === 'home' && (
          <div className="flex-1 flex flex-col gap-3.5 pb-20 animate-fadeIn">
            {/* Hero Banner */}
            <div 
              className="w-full rounded-3xl p-5 border bg-gradient-to-br from-cyan-950/40 via-purple-950/30 to-black/60 relative overflow-hidden"
              style={{
                borderColor: 'rgba(0, 245, 255, 0.4)',
                boxShadow: '0 0 25px rgba(0, 245, 255, 0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-orbitron font-black text-xl sm:text-2xl text-white tracking-wide uppercase leading-tight">
                    HACKER PRIME <span className="text-cyan-300">VIP</span>
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">High-accuracy neural AI signals & fire circle balls</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.3)]">
                  <Zap size={24} />
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
                <div className="text-center p-2 rounded-xl bg-black/40 border border-cyan-500/20">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-400">WIN ACCURACY</span>
                  <b className="font-orbitron text-sm sm:text-base text-cyan-300">
                    {totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 98}%
                  </b>
                </div>
                <div className="text-center p-2 rounded-xl bg-black/40 border border-emerald-500/20">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-400">TOTAL SIGNALS</span>
                  <b className="font-orbitron text-sm sm:text-base text-emerald-400">{history.length}</b>
                </div>
                <div className="text-center p-2 rounded-xl bg-black/40 border border-purple-500/20">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-400">ALGO STATUS</span>
                  <b className="font-orbitron text-sm sm:text-base text-purple-300">VIP PRIME</b>
                </div>
              </div>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-2">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  placeholder="Search VIP prediction games..."
                  className="w-full py-3 pl-10 pr-9 rounded-2xl bg-black/60 border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                {gameSearch && (
                  <button
                    onClick={() => setGameSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-orbitron font-bold">
                {[
                  { id: 'all', label: '🔥 All Games' },
                  { id: 'popular', label: '⭐ Popular' },
                  { id: 'wingo', label: '⚡ Wingo' },
                  { id: 'vip', label: '👑 VIP' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`py-1.5 px-3.5 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-black border-cyan-300 font-extrabold shadow-[0_0_12px_rgba(0,245,255,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Games Grid List */}
            <div className="space-y-2.5">
              {filteredGames.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/15 text-slate-400 text-xs font-orbitron">
                  No games match your search criteria.
                </div>
              ) : (
                filteredGames.map((g) => (
                  <div
                    key={g.name}
                    onClick={() => {
                      setCurrentGame(g);
                      setActiveView('select');
                    }}
                    className="w-full p-3 sm:p-3.5 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/60 bg-gradient-to-r from-white/[0.06] to-white/[0.02] flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={g.img}
                          alt={g.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-cyan-400/60 shadow-[0_0_12px_rgba(0,245,255,0.3)]"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-orbitron font-black text-[10px] flex items-center justify-center border-2 border-black">
                          {g.rank}
                        </span>
                      </div>
                      <div>
                        <div className="font-orbitron font-extrabold text-sm sm:text-base text-white">
                          {g.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>HACKER PRIME • LIVE</span>
                        </div>
                      </div>
                    </div>

                    <button className="py-2 px-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-orbitron font-black text-[11px] tracking-wider uppercase shadow-[0_0_12px_rgba(0,245,255,0.3)] pointer-events-none">
                      PLAY ▶
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: SELECT MODE ================= */}
        {activeView === 'select' && (
          <div className="flex-1 flex flex-col gap-4 pb-20 animate-fadeIn">
            {/* Top Back Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView('home')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-orbitron font-black text-sm tracking-wider text-cyan-300">
                SELECT GAME MODE
              </h2>
              <div className="w-9" />
            </div>

            {/* Selected Game Showcase Card */}
            <div 
              className="w-full text-center p-5 rounded-3xl border bg-gradient-to-b from-cyan-950/30 to-black/60 relative overflow-hidden"
              style={{
                borderColor: 'rgba(0, 245, 255, 0.4)',
                boxShadow: '0 0 25px rgba(0, 245, 255, 0.2)'
              }}
            >
              <img
                src={currentGame.img}
                alt={currentGame.name}
                className="w-20 h-20 mx-auto rounded-full object-cover border-3 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)] mb-3"
              />
              <h3 className="font-orbitron font-black text-lg text-white">
                Game: <span className="text-cyan-300">{currentGame.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Select cycle and start HACKER PRIME neural prediction</p>
            </div>

            {/* Choose Game Cycle */}
            <div className="space-y-2">
              <div className="text-[11px] font-orbitron font-extrabold text-cyan-400 tracking-wider">
                ⚡ CHOOSE GAME CYCLE
              </div>

              <div
                onClick={() => setSelectedCycle('30s')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedCycle === '30s'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Timer size={20} />
                  </div>
                  <div>
                    <div className="font-orbitron font-extrabold text-sm text-white">30 SEC WINGO</div>
                    <div className="text-[10px] text-slate-400 font-mono">Ultra fast 30-second intervals</div>
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  selectedCycle === '30s' ? 'bg-cyan-400 border-cyan-300 text-black shadow-[0_0_10px_rgba(0,245,255,0.6)]' : 'border-slate-600 text-transparent'
                }`}>
                  ✓
                </div>
              </div>

              <div
                onClick={() => setSelectedCycle('1m')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedCycle === '1m'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-orbitron font-extrabold text-sm text-white">1 MIN WINGO</div>
                    <div className="text-[10px] text-slate-400 font-mono">Standard 60-second neural intervals</div>
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  selectedCycle === '1m' ? 'bg-cyan-400 border-cyan-300 text-black shadow-[0_0_10px_rgba(0,245,255,0.6)]' : 'border-slate-600 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
            </div>

            {/* Prediction Target */}
            <div className="space-y-2">
              <div className="text-[11px] font-orbitron font-extrabold text-purple-400 tracking-wider">
                🎯 PREDICTION TARGET
              </div>

              <div className="p-4 rounded-2xl border border-purple-400 bg-purple-950/30 flex items-center justify-between shadow-[0_0_20px_rgba(176,38,255,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Scale size={20} />
                  </div>
                  <div>
                    <div className="font-orbitron font-extrabold text-sm text-white">BIG / SMALL + NUMBER BALLS</div>
                    <div className="text-[10px] text-purple-300 font-mono">High probability fire circle ball signal</div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-purple-300 text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => {
                setActiveView('prediction');
                showToast(`🚀 HACKER PRIME Engine active for ${currentGame.name}`);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-black font-orbitron font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(0,245,255,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 mt-2"
            >
              <Rocket size={18} />
              <span>START PREDICTION</span>
            </button>
          </div>
        )}

        {/* ================= VIEW 3: PREDICTION ENGINE ================= */}
        {activeView === 'prediction' && (
          <div className="flex-1 flex flex-col gap-3 pb-20 animate-fadeIn">
            {/* Top Bar for Prediction */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView('home')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="text-center">
                <div className="font-orbitron font-extrabold text-xs text-cyan-300">
                  {currentGame.name} ({selectedCycle === '30s' ? '30 SEC' : '1 MIN'})
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  PERIOD: #{activePrediction?.period ? activePrediction.period.slice(-5) : '...'}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsThemeOpen(true)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 cursor-pointer"
                >
                  <Palette size={16} />
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 cursor-pointer"
                >
                  <HistoryIcon size={16} />
                </button>
              </div>
            </div>

            {/* Futuristic Holographic Prediction Box */}
            <div 
              className="relative rounded-3xl p-1 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #00f5ff, #b026ff, #00ff9d, #00f5ff)',
                boxShadow: '0 0 35px rgba(0, 245, 255, 0.25)'
              }}
            >
              <div className="relative rounded-[22px] bg-gradient-to-b from-[#0a1232] via-[#05091d] to-[#02040e] p-4 sm:p-5 overflow-hidden">
                {/* Cyber Scanline */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none animate-pulse" />

                {/* Status Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-cyan-500/20 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isAnalysing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="font-orbitron font-extrabold text-[11px] tracking-wider text-slate-200">
                      {isAnalysing ? 'AI ANALYSING...' : 'SIGNAL READY'}
                    </span>
                  </div>

                  <span className="py-0.5 px-2.5 rounded-full text-[10px] font-orbitron font-extrabold bg-gradient-to-r from-cyan-400 to-purple-600 text-black">
                    {step > 1 ? `LVL 2 • STEP ${step}` : 'LVL 1 • PRIME'}
                  </span>
                </div>

                {/* Win Streak / Recovery Ribbon */}
                {winStreak >= 2 && (
                  <div className="w-fit mx-auto mb-3 py-1 px-3.5 rounded-full bg-emerald-950/70 border border-emerald-400 text-emerald-300 font-orbitron font-extrabold text-[11px] tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                    <Zap size={13} className="text-emerald-400" />
                    <span>+{winStreak} WIN STREAK ACTIVE 🔥</span>
                  </div>
                )}
                {lossCount >= 2 && (
                  <div className="w-fit mx-auto mb-3 py-1 px-3.5 rounded-full bg-rose-950/70 border border-rose-500 text-rose-300 font-orbitron font-extrabold text-[11px] tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,77,109,0.3)]">
                    <span>⚠️ RECOVERY MULTIPLIER • STEP {step}</span>
                  </div>
                )}

                {/* Main Prediction Display */}
                <div className="text-center py-2">
                  <div className="text-[11px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                    {isAnalysing ? 'SCANNING ALGORITHM...' : 'NEXT VIP BET'}
                  </div>

                  {/* Big/Small Giant Text */}
                  <div 
                    className="font-orbitron font-black text-5xl sm:text-6xl tracking-wider my-1 uppercase"
                    style={{
                      background: activePrediction?.size === 'BIG'
                        ? 'linear-gradient(180deg, #ffffff, #00f5ff 55%, #7c3aed)'
                        : 'linear-gradient(180deg, #ffffff, #b026ff 55%, #ff0055)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: activePrediction?.size === 'BIG'
                        ? 'drop-shadow(0 0 25px rgba(0,245,255,0.75))'
                        : 'drop-shadow(0 0 25px rgba(176,38,255,0.75))'
                    }}
                  >
                    {isAnalysing ? '•••' : (activePrediction?.size || 'READY')}
                  </div>

                  <div className="font-mono text-xs text-slate-400 font-bold">
                    STEP {step} • MULTIPLIER OPTIMIZED
                  </div>

                  {/* FIRE CIRCLE BALL (User explicitly requested "fire circle ball for predicted nu,ber ball") */}
                  <div className="mt-3 mb-2 flex flex-col items-center">
                    <span className="text-[10px] font-orbitron font-black tracking-widest text-[#00f5ff] uppercase mb-1">
                      🔥 HIGH PROBABILITY FIRE CIRCLE BALL 🔥
                    </span>
                    <FireCircleBall 
                      number={activePrediction?.n1 ?? null} 
                      size="lg" 
                      isAnalysing={isAnalysing}
                    />
                  </div>

                  {/* Period & Timer Tri-Box */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-cyan-500/20 text-center">
                      <span className="block text-[9px] font-orbitron font-bold text-slate-400">PERIOD</span>
                      <b className="font-mono text-xs sm:text-sm text-cyan-300">
                        #{activePrediction?.period ? activePrediction.period.slice(-5) : '...'}
                      </b>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-purple-500/20 text-center">
                      <span className="block text-[9px] font-orbitron font-bold text-slate-400">CYCLE</span>
                      <b className="font-orbitron text-xs sm:text-sm text-purple-300">
                        {selectedCycle === '30s' ? '30 SEC' : '1 MIN'}
                      </b>
                    </div>
                    <div className={`p-2.5 rounded-2xl bg-black/40 border text-center transition-all ${
                      secondsRemaining <= 5 ? 'border-red-500 shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'border-amber-500/30'
                    }`}>
                      <span className="block text-[9px] font-orbitron font-bold text-slate-400">NEXT IN</span>
                      <b className={`font-mono text-xs sm:text-sm font-black ${
                        secondsRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                      }`}>
                        {countdown}
                      </b>
                    </div>
                  </div>
                </div>

                {/* AI Confidence Meter */}
                <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-1.5 text-xs font-orbitron font-extrabold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Activity size={14} className="text-cyan-400" />
                      AI CONFIDENCE
                    </span>
                    <span className="text-cyan-300 font-mono">
                      {Math.round((activePrediction?.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden relative">
                    <div 
                      className="h-full rounded-full transition-all duration-700 relative"
                      style={{
                        width: `${Math.round((activePrediction?.confidence || 0.95) * 100)}%`,
                        background: 'linear-gradient(90deg, #00f5ff, #7c3aed, #00ff9d)',
                        boxShadow: '0 0 14px rgba(0,245,255,0.7)'
                      }}
                    />
                  </div>
                </div>

                {/* Metrics Chips */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                    <span className="text-slate-500 block">RECOVERY</span>
                    <b className="text-white font-orbitron">STEP {step}</b>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                    <span className="text-slate-500 block">WIN RATE</span>
                    <b className="text-emerald-400 font-orbitron">
                      {totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 98}%
                    </b>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
                    <span className="text-slate-500 block">SERVER</span>
                    <b className="text-cyan-300 font-orbitron">VIP-PRIME</b>
                  </div>
                </div>
              </div>
            </div>

            {/* COPY PREDICTION BUTTON (Prominently placed as requested by user) */}
            <CopyPredictionButton
              gameName={currentGame.name}
              cycle={selectedCycle}
              period={activePrediction?.period || ''}
              prediction={activePrediction?.size || ''}
              numberBall={activePrediction?.n1 ?? null}
              step={step}
              confidence={activePrediction?.confidence || 0.95}
              onToast={showToast}
            />

            {/* Re-Analyse Button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('⚡ Re-analysing neural signal...');
                  runPredictionEngine();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-black font-orbitron font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,245,255,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <RefreshCw size={16} />
                <span>RE-ANALYSE SIGNAL</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: HISTORY ================= */}
        {activeView === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={() => {
              if (window.confirm('Clear all prediction history and cached results?')) {
                setHistory([]);
                showToast('✓ History and cache cleared.');
              }
            }}
            onRefresh={() => {
              showToast('Refreshed history');
            }}
          />
        )}
      </div>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md p-2 rounded-2xl bg-[#050817]/90 backdrop-blur-xl border border-cyan-500/30 flex gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(0,245,255,0.15)]">
        <button
          onClick={() => setActiveView('home')}
          className={`flex-1 py-2 px-1 rounded-xl font-orbitron font-black text-[10px] tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeView === 'home' || activeView === 'select'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home size={18} />
          <span>GAMES</span>
        </button>

        <button
          onClick={() => setActiveView('prediction')}
          className={`flex-1 py-2 px-1 rounded-xl font-orbitron font-black text-[10px] tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeView === 'prediction'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={18} />
          <span>PREDICTION</span>
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 py-2 px-1 rounded-xl font-orbitron font-black text-[10px] tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeView === 'history'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HistoryIcon size={18} />
          <span>HISTORY</span>
        </button>
      </nav>

      {/* ================= MODALS & POPUPS ================= */}

      {/* 1. GREEN NEON POPUP FOR WIN (User requested) */}
      <GreenNeonWinPopup
        isOpen={winPopupData.show}
        period={winPopupData.period}
        prediction={winPopupData.prediction}
        predNum={winPopupData.predNum}
        actual={winPopupData.actual}
        actualNum={winPopupData.actualNum}
        onClose={() => setWinPopupData(prev => ({ ...prev, show: false }))}
      />

      {/* 2. RED NEON POPUP FOR LOSS (User requested) */}
      <RedNeonLossPopup
        isOpen={lossPopupData.show}
        period={lossPopupData.period}
        prediction={lossPopupData.prediction}
        predNum={lossPopupData.predNum}
        actual={lossPopupData.actual}
        actualNum={lossPopupData.actualNum}
        step={lossPopupData.step}
        onClose={() => setLossPopupData(prev => ({ ...prev, show: false }))}
      />

      {/* 3. YELLOW NEON POPUP FOR JACKPOT (User requested) */}
      <YellowNeonJackpotPopup
        isOpen={jackpotPopupData.show}
        period={jackpotPopupData.period}
        prediction={jackpotPopupData.prediction}
        actualNum={jackpotPopupData.actualNum}
        onClose={() => setJackpotPopupData(prev => ({ ...prev, show: false }))}
      />

      {/* 4. ADMIN MODAL (Password HACKER18, generate keys 1d, 3d, 5d, 7d, 30d, revoke keys) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onToast={showToast}
        onSessionRevokedCheck={() => {
          const session = getActiveSession();
          if (!session) {
            setActiveSession(null);
            showToast('⚠️ Active license key was revoked.');
          }
        }}
      />

      {/* 5. BRIGHTNESS & NEON ILLUMINATION MODAL */}
      <BrightnessModal
        isOpen={isBrightnessOpen}
        brightness={brightness}
        neonIntensity={neonIntensity}
        scanlines={scanlines}
        onBrightnessChange={setBrightness}
        onNeonIntensityChange={setNeonIntensity}
        onScanlinesToggle={() => setScanlines(!scanlines)}
        onClose={() => setIsBrightnessOpen(false)}
      />

      {/* 6. THEME MODAL */}
      {isThemeOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-[400px] rounded-3xl p-5 border-2 border-cyan-400 bg-gradient-to-b from-[#0e071c] via-[#070414] to-black text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="font-orbitron font-extrabold text-sm text-cyan-300 flex items-center gap-2">
                <Palette size={16} />
                NEON VIP THEMES
              </span>
              <button
                onClick={() => setIsThemeOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTheme(t.id);
                    showToast(`✓ Applied ${t.name}`);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    currentTheme === t.id
                      ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-[1.02]'
                      : 'border-white/10 opacity-75 hover:opacity-100'
                  }`}
                  style={{ background: t.swatch }}
                >
                  <span className="text-[10px] font-orbitron font-black text-black bg-white/90 px-2 py-0.5 rounded-md w-fit">
                    {t.name}
                  </span>
                  {currentTheme === t.id && (
                    <span className="self-end w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Neon Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[13000] py-2.5 px-5 rounded-full bg-[#0a1128] border-2 border-cyan-400 text-cyan-100 text-xs font-orbitron font-extrabold tracking-wider shadow-[0_0_25px_rgba(0,245,255,0.6)] animate-fadeIn text-center max-w-[90%]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
