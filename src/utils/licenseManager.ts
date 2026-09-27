import { LicenseKey } from '../types';

const STORAGE_KEYS = 'hacker_prime_keys_v2';
const ACTIVE_SESSION_KEY = 'hacker_prime_active_session_v2';

export const ADMIN_PASSWORD = 'HACKER18';

// Generate random uppercase alphanumeric string of length n
function randomPart(length = 4): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function generateKeyFormat(): string {
  return `HACKER-${randomPart(4)}-${randomPart(4)}`;
}

// Local cache helper
export function getCachedKeys(): LicenseKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCachedKeys(keys: LicenseKey[]): void {
  localStorage.setItem(STORAGE_KEYS, JSON.stringify(keys));
}

// Fetch all keys from server (with localStorage fallback and sync)
export async function getAllKeys(): Promise<LicenseKey[]> {
  try {
    const res = await fetch('/api/keys');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        saveCachedKeys(data.keys);
        return data.keys;
      }
    }
  } catch (err) {
    console.warn('Network error fetching keys, using local cache:', err);
  }
  return getCachedKeys();
}

// Generate new key on server so ANY device can immediately use it
export async function createNewKey(durationDays: number): Promise<LicenseKey> {
  try {
    const res = await fetch('/api/keys/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationDays })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.key) {
        const cached = getCachedKeys();
        cached.unshift(data.key);
        saveCachedKeys(cached);
        return data.key;
      }
    }
  } catch (err) {
    console.error('Error generating key on server:', err);
  }

  // Fallback if server is unreachable
  const fallbackKey: LicenseKey = {
    key: generateKeyFormat(),
    durationDays,
    createdAt: Date.now(),
    activatedAt: null,
    expiresAt: null,
    status: 'active'
  };
  const cached = getCachedKeys();
  cached.unshift(fallbackKey);
  saveCachedKeys(cached);
  return fallbackKey;
}

// Revoke a key on the server (instantly cuts access across all devices)
export async function revokeKey(keyCode: string): Promise<boolean> {
  const cleanCode = keyCode.trim().toUpperCase();

  try {
    await fetch('/api/keys/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cleanCode })
    });
  } catch (err) {
    console.warn('Error revoking on server:', err);
  }

  // Update local cache
  const cached = getCachedKeys();
  const idx = cached.findIndex(k => k.key.toUpperCase() === cleanCode);
  if (idx !== -1) {
    cached[idx].status = 'revoked';
    saveCachedKeys(cached);
  }

  const active = getActiveSession();
  if (active && active.key.toUpperCase() === cleanCode) {
    clearActiveSession();
  }

  return true;
}

// Delete key completely
export async function deleteKey(keyCode: string): Promise<boolean> {
  const cleanCode = keyCode.trim().toUpperCase();

  try {
    await fetch('/api/keys/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cleanCode })
    });
  } catch (err) {
    console.warn('Error deleting on server:', err);
  }

  let cached = getCachedKeys();
  cached = cached.filter(k => k.key.toUpperCase() !== cleanCode);
  saveCachedKeys(cached);

  const active = getActiveSession();
  if (active && active.key.toUpperCase() === cleanCode) {
    clearActiveSession();
  }

  return true;
}

export interface ActivationResult {
  success: boolean;
  message: string;
  keyObj?: LicenseKey;
}

// ACTIVATE KEY FROM ANY DEVICE
// Connects to centralized server API so any key generated on Device A works on Device B
export async function activateLicenseKey(inputKey: string): Promise<ActivationResult> {
  const cleanKey = inputKey.trim().toUpperCase();
  if (!cleanKey) {
    return { success: false, message: 'Please enter a license key.' };
  }

  try {
    const res = await fetch('/api/keys/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cleanKey })
    });

    if (res.ok) {
      const data: ActivationResult = await res.json();
      if (data.success && data.keyObj) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data.keyObj));
        return data;
      }
      return data;
    }
  } catch (err) {
    console.warn('Server offline, checking local cache:', err);
  }

  // Offline / fallback check against cached keys
  const keys = getCachedKeys();
  const keyObj = keys.find(k => k.key.toUpperCase() === cleanKey);

  if (!keyObj) {
    return {
      success: false,
      message: 'Invalid License Key. Contact Admin for a valid key.'
    };
  }

  if (keyObj.status === 'revoked') {
    return {
      success: false,
      message: 'This license key has been REVOKED by the administrator.'
    };
  }

  const now = Date.now();
  if (keyObj.activatedAt && keyObj.expiresAt) {
    if (now > keyObj.expiresAt) {
      keyObj.status = 'expired';
      saveCachedKeys(keys);
      return {
        success: false,
        message: 'This license key has EXPIRED. Please get a new key.'
      };
    }
  } else {
    keyObj.activatedAt = now;
    keyObj.expiresAt = now + keyObj.durationDays * 24 * 60 * 60 * 1000;
    keyObj.status = 'in-use';
    saveCachedKeys(keys);
  }

  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(keyObj));
  return {
    success: true,
    message: `License Activated! Valid for ${keyObj.durationDays} Day(s).`,
    keyObj
  };
}

// Online session verification against server
export async function verifyKeyOnline(keyCode: string): Promise<{ valid: boolean; keyObj?: LicenseKey; reason?: string }> {
  try {
    const res = await fetch('/api/keys/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: keyCode })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.valid && data.keyObj) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data.keyObj));
        return { valid: true, keyObj: data.keyObj };
      }
      return { valid: false, reason: data.reason };
    }
  } catch {
    // If network temporary glitch, verify locally
  }

  const active = getActiveSession();
  if (!active || active.key.toUpperCase() !== keyCode.toUpperCase()) {
    return { valid: false, reason: 'Session expired.' };
  }
  if (active.status === 'revoked') {
    return { valid: false, reason: 'License key was REVOKED.' };
  }
  if (active.expiresAt && Date.now() > active.expiresAt) {
    return { valid: false, reason: 'License key has EXPIRED.' };
  }

  return { valid: true, keyObj: active };
}

// Retrieve currently active session on this device
export function getActiveSession(): LicenseKey | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session: LicenseKey = JSON.parse(raw);
    if (!session || !session.key) return null;

    if (session.status === 'revoked') {
      clearActiveSession();
      return null;
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
      session.status = 'expired';
      clearActiveSession();
      return null;
    }

    return session;
  } catch {
    clearActiveSession();
    return null;
  }
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

// Sync local keys with server once on startup so any existing keys are uploaded
export async function syncLocalKeysWithServer(): Promise<void> {
  try {
    const local = getCachedKeys();
    if (local.length > 0) {
      await fetch('/api/keys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: local })
      });
    }
  } catch {
    // ignore
  }
}

export function formatTimeRemaining(expiresAt: number | null): string {
  if (!expiresAt) return 'Pending Activation';
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'EXPIRED';

  const days = Math.floor(diff / (24 * 3600 * 1000));
  const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
