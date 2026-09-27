import React, { useState, useEffect } from 'react';
import { 
  ADMIN_PASSWORD, 
  getAllKeys, 
  createNewKey, 
  revokeKey, 
  deleteKey, 
  formatTimeRemaining 
} from '../utils/licenseManager';
import { LicenseKey } from '../types';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Copy, 
  Check, 
  Trash2, 
  Ban, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onSessionRevokedCheck?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onToast,
  onSessionRevokedCheck
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Generator state
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 1, 3, 5, 7, 30
  const [newlyGenerated, setNewlyGenerated] = useState<LicenseKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'in-use' | 'expired' | 'revoked'>('all');
  const [keysList, setKeysList] = useState<LicenseKey[]>([]);

  const refreshList = async () => {
    try {
      const keys = await getAllKeys();
      setKeysList(keys);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        refreshList();
      } else {
        setPasswordInput('');
        setAuthError('');
      }
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      onToast('👑 HACKER PRIME Admin Access Granted');
      await refreshList();
    } else {
      setAuthError('Incorrect Admin Password. Access Denied.');
    }
  };

  const handleGenerate = async () => {
    try {
      const key = await createNewKey(selectedDuration);
      setNewlyGenerated(key);
      await refreshList();
      onToast(`✓ Generated ${selectedDuration}-Day Key: ${key.key}`);
    } catch {
      onToast('Failed to generate key');
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedKey(code);
      onToast(`✓ Copied ${code} to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      onToast(`Key: ${code}`);
    }
  };

  const handleRevoke = async (keyCode: string) => {
    if (window.confirm(`Revoke key ${keyCode}? Any device currently using this key will immediately lose access.`)) {
      await revokeKey(keyCode);
      await refreshList();
      onToast(`🚫 Revoked key: ${keyCode}`);
      if (onSessionRevokedCheck) onSessionRevokedCheck();
    }
  };

  const handleDelete = async (keyCode: string) => {
    if (window.confirm(`Delete key ${keyCode} completely from registry?`)) {
      await deleteKey(keyCode);
      await refreshList();
      onToast(`🗑️ Deleted key: ${keyCode}`);
      if (onSessionRevokedCheck) onSessionRevokedCheck();
    }
  };

  const durations = [
    { label: '1 DAY', days: 1 },
    { label: '3 DAYS', days: 3 },
    { label: '5 DAYS', days: 5 },
    { label: '7 DAYS', days: 7 },
    { label: '30 DAYS', days: 30 }
  ];

  const filteredKeys = keysList.filter(k => {
    if (filterStatus === 'all') return true;
    return k.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border-2 bg-gradient-to-b from-[#0e071c] via-[#070414] to-[#03010a] text-white shadow-2xl"
        style={{
          borderColor: '#b026ff',
          boxShadow: '0 0 40px rgba(176,38,255,0.4), 0 0 90px rgba(0,245,255,0.15)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(176,38,255,0.6)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-purple-300">
                HACKER PRIME ADMIN
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">License Generator & Device Access Controller</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {!isAuthenticated ? (
            /* Password Authentication Screen */
            <form onSubmit={handleLogin} className="py-8 px-2 max-w-sm mx-auto text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(176,38,255,0.3)]">
                <Lock size={32} />
              </div>

              <div>
                <h3 className="font-orbitron font-extrabold text-base tracking-wider text-slate-100 mb-1">
                  SECURITY CLEARANCE REQUIRED
                </h3>
                <p className="text-xs text-slate-400">
                  Enter authorized administrator credentials to manage device licenses.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 justify-center">
                  <AlertCircle size={15} />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Admin Password..."
                  className="w-full py-3 px-4 rounded-xl bg-slate-900/90 border border-purple-500/40 text-white placeholder-slate-500 font-mono text-center tracking-widest focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                  autoFocus
                />

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white font-orbitron font-extrabold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  UNLOCK ADMIN PANEL
                </button>
              </div>
            </form>
          ) : (
            /* Admin Management Interface */
            <>
              {/* Generator Section */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-orbitron font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-yellow-400" />
                    GENERATE NEW DEVICE LICENSE KEY
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Format: HACKER-XXXX-XXXX</span>
                </div>

                {/* Duration Picker */}
                <div>
                  <label className="block text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider mb-2">
                    SELECT DURATION (VALID IN ANY DEVICE)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {durations.map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => setSelectedDuration(d.days)}
                        className={`py-2 px-1 text-center rounded-xl text-[10px] font-orbitron font-extrabold transition-all cursor-pointer border ${
                          selectedDuration === d.days
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-purple-300 shadow-[0_0_15px_rgba(176,38,255,0.5)]'
                            : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-black font-orbitron font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(176,38,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <PlusCircle size={16} />
                  <span>GENERATE {selectedDuration}-DAY KEY</span>
                </button>

                {/* Newly Generated Key Highlight */}
                {newlyGenerated && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center animate-fadeIn">
                    <div className="text-[10px] font-orbitron font-bold text-emerald-400 tracking-wider mb-1">
                      🎉 NEW LICENSE GENERATED ({newlyGenerated.durationDays} DAYS)
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-extrabold text-base sm:text-lg text-emerald-300 tracking-widest selection:bg-emerald-500/30">
                        {newlyGenerated.key}
                      </span>
                      <button
                        onClick={() => handleCopy(newlyGenerated.key)}
                        className="py-1 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-orbitron font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === newlyGenerated.key ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedKey === newlyGenerated.key ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Registry Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-orbitron font-extrabold text-slate-200">
                      GENERATED KEYS ({keysList.length})
                    </span>
                    <button 
                      onClick={refreshList}
                      title="Refresh keys list"
                      className="text-slate-400 hover:text-cyan-400 p-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 text-[10px] font-orbitron">
                    {(['all', 'active', 'in-use', 'expired', 'revoked'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setFilterStatus(tab)}
                        className={`px-2 py-0.5 rounded-lg uppercase cursor-pointer border ${
                          filterStatus === tab
                            ? 'bg-purple-600/40 border-purple-400 text-white'
                            : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredKeys.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    No keys found for "{filterStatus}". Generate keys using the panel above.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredKeys.map((k) => {
                      const isRevoked = k.status === 'revoked';
                      const isExpired = k.status === 'expired';
                      const isInUse = k.status === 'in-use';
                      const isActive = k.status === 'active';

                      const statusColor = isRevoked
                        ? 'text-red-400 bg-red-950/60 border-red-500/40'
                        : isExpired
                        ? 'text-slate-400 bg-slate-900 border-slate-700'
                        : isInUse
                        ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40'
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';

                      return (
                        <div
                          key={k.key}
                          className={`p-3 rounded-2xl border transition-all ${
                            isRevoked
                              ? 'bg-red-950/20 border-red-900/40 opacity-70'
                              : 'bg-slate-900/50 border-white/10 hover:border-purple-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-sm sm:text-base text-white tracking-wider">
                                {k.key}
                              </span>
                              <button
                                onClick={() => handleCopy(k.key)}
                                className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
                                title="Copy Key"
                              >
                                {copiedKey === k.key ? (
                                  <Check size={14} className="text-emerald-400" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-orbitron font-extrabold uppercase border ${statusColor}`}>
                              {k.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-purple-400" />
                              {k.durationDays}D Plan • {formatTimeRemaining(k.expiresAt)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Revoke Button (Mandatory user requirement) */}
                              {!isRevoked && (
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(k.key)}
                                  className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-[10px] font-orbitron font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Revoke access on all devices immediately"
                                >
                                  <Ban size={12} />
                                  <span>REVOKE</span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDelete(k.key)}
                                className="p-1 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                                title="Delete from list"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Lock / Exit Admin Button */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">
                  Keys work across any device until time expires or revoked.
                </span>
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(false)}
                  className="text-purple-400 hover:text-purple-300 font-orbitron font-bold text-[11px] cursor-pointer"
                >
                  🔒 LOCK PANEL
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
