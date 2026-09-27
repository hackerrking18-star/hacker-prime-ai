export interface Game {
  name: string;
  img: string;
  category: string;
  rank: number;
}

export interface LicenseKey {
  key: string; // Format: HACKER-XXXX-XXXX
  durationDays: number; // 1, 3, 5, 7, 30
  createdAt: number;
  activatedAt: number | null;
  expiresAt: number | null;
  status: 'active' | 'in-use' | 'expired' | 'revoked';
  notes?: string;
}

export interface PredictionResult {
  period: string;
  mode: '30s' | '1m';
  prediction: 'BIG' | 'SMALL' | 'SKIP';
  predNum: number;
  actual: 'BIG' | 'SMALL';
  actualNum: number;
  win: boolean;
  isJackpot: boolean;
  step: number;
  timestamp: number;
}

export interface ActivePrediction {
  period: string;
  size: 'BIG' | 'SMALL';
  n1: number;
  n2: number;
  confidence: number;
  step: number;
}

export type ThemeId = 
  | 'neon-hacker'
  | 'royal-gold'
  | 'emerald-vip'
  | 'crimson-vip'
  | 'ocean-diamond'
  | 'violet-crown';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  swatch: string;
  primaryGlow: string;
}
