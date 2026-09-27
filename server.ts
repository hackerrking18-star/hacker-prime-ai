import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Cloud Run health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'HACKER PRIME AI', timestamp: Date.now() });
});

// Standalone HTML file download and view routes
app.get('/download/hacker-prime-ai.html', (_req, res) => {
  const filePath = path.resolve(process.cwd(), 'public', 'hacker-prime-ai.html');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'hacker-prime-ai.html');
  } else {
    res.status(404).send('HTML file not found');
  }
});

app.get('/hacker-prime-ai.html', (_req, res) => {
  const filePath = path.resolve(process.cwd(), 'public', 'hacker-prime-ai.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('HTML file not found');
  }
});

// ===== CENTRALIZED LICENSE KEYS STORAGE (Shared across all devices) =====
export interface LicenseKey {
  key: string;
  durationDays: number;
  createdAt: number;
  activatedAt: number | null;
  expiresAt: number | null;
  status: 'active' | 'in-use' | 'expired' | 'revoked';
  notes?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const KEYS_FILE = path.resolve(DATA_DIR, 'keys.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getStoredKeys(): LicenseKey[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(KEYS_FILE)) {
      fs.writeFileSync(KEYS_FILE, '[]', 'utf-8');
      return [];
    }
    const content = fs.readFileSync(KEYS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    let updated = false;
    const keys = parsed.map((k: LicenseKey) => {
      if (k.status === 'in-use' && k.expiresAt && now > k.expiresAt) {
        updated = true;
        return { ...k, status: 'expired' as const };
      }
      return k;
    });

    if (updated) {
      fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
    }
    return keys;
  } catch (e) {
    console.error('Error reading keys:', e);
    return [];
  }
}

function saveStoredKeys(keys: LicenseKey[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving keys:', e);
  }
}

function randomPart(length = 4): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function generateKeyFormat(): string {
  return `HACKER-${randomPart(4)}-${randomPart(4)}`;
}

// GET all keys
app.get('/api/keys', (_req, res) => {
  const keys = getStoredKeys();
  res.json({ success: true, keys });
});

// GENERATE a new key (accessible from any device)
app.post('/api/keys/generate', (req, res) => {
  const durationDays = Number(req.body.durationDays) || 30;
  const keys = getStoredKeys();

  let newKeyCode = generateKeyFormat();
  while (keys.some(k => k.key === newKeyCode)) {
    newKeyCode = generateKeyFormat();
  }

  const newKey: LicenseKey = {
    key: newKeyCode,
    durationDays,
    createdAt: Date.now(),
    activatedAt: null,
    expiresAt: null,
    status: 'active'
  };

  keys.unshift(newKey);
  saveStoredKeys(keys);

  res.json({ success: true, key: newKey });
});

// ACTIVATE a key from any device
app.post('/api/keys/activate', (req, res) => {
  const inputKey = String(req.body.key || '').trim().toUpperCase();
  if (!inputKey) {
    return res.status(400).json({ success: false, message: 'Please enter a license key.' });
  }

  const keys = getStoredKeys();
  const keyObj = keys.find(k => k.key.toUpperCase() === inputKey);

  if (!keyObj) {
    return res.json({
      success: false,
      message: 'Invalid License Key. Contact Admin for a valid key.'
    });
  }

  if (keyObj.status === 'revoked') {
    return res.json({
      success: false,
      message: 'This license key has been REVOKED by the administrator.'
    });
  }

  const now = Date.now();

  // If already activated, check if expired
  if (keyObj.activatedAt && keyObj.expiresAt) {
    if (now > keyObj.expiresAt) {
      keyObj.status = 'expired';
      saveStoredKeys(keys);
      return res.json({
        success: false,
        message: 'This license key has EXPIRED. Please get a new key.'
      });
    }
  } else {
    // First-time activation
    keyObj.activatedAt = now;
    keyObj.expiresAt = now + keyObj.durationDays * 24 * 60 * 60 * 1000;
    keyObj.status = 'in-use';
    saveStoredKeys(keys);
  }

  return res.json({
    success: true,
    message: `License Activated! Valid for ${keyObj.durationDays} Day(s).`,
    keyObj
  });
});

// VERIFY key status across devices
app.post('/api/keys/verify', (req, res) => {
  const inputKey = String(req.body.key || '').trim().toUpperCase();
  const keys = getStoredKeys();
  const keyObj = keys.find(k => k.key.toUpperCase() === inputKey);

  if (!keyObj) {
    return res.json({ valid: false, reason: 'License key not found.' });
  }

  if (keyObj.status === 'revoked') {
    return res.json({ valid: false, reason: 'This license key was REVOKED by the administrator.' });
  }

  const now = Date.now();
  if (keyObj.expiresAt && now > keyObj.expiresAt) {
    keyObj.status = 'expired';
    saveStoredKeys(keys);
    return res.json({ valid: false, reason: 'This license key has EXPIRED.' });
  }

  return res.json({ valid: true, keyObj });
});

// REVOKE a key across all devices
app.post('/api/keys/revoke', (req, res) => {
  const inputKey = String(req.body.key || '').trim().toUpperCase();
  const keys = getStoredKeys();
  const index = keys.findIndex(k => k.key.toUpperCase() === inputKey);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Key not found.' });
  }

  keys[index].status = 'revoked';
  saveStoredKeys(keys);

  return res.json({ success: true, message: `Key ${inputKey} revoked successfully.` });
});

// DELETE a key
app.post('/api/keys/delete', (req, res) => {
  const inputKey = String(req.body.key || '').trim().toUpperCase();
  let keys = getStoredKeys();
  keys = keys.filter(k => k.key.toUpperCase() !== inputKey);
  saveStoredKeys(keys);

  return res.json({ success: true, message: `Key ${inputKey} deleted.` });
});

// SYNC client keys (migrates local keys if any exist)
app.post('/api/keys/sync', (req, res) => {
  const clientKeys: LicenseKey[] = Array.isArray(req.body.keys) ? req.body.keys : [];
  if (clientKeys.length === 0) {
    return res.json({ success: true, keys: getStoredKeys() });
  }

  const serverKeys = getStoredKeys();
  let changed = false;

  for (const ck of clientKeys) {
    if (!serverKeys.some(sk => sk.key.toUpperCase() === ck.key.toUpperCase())) {
      serverKeys.push(ck);
      changed = true;
    }
  }

  if (changed) {
    saveStoredKeys(serverKeys);
  }

  return res.json({ success: true, keys: serverKeys });
});

// ===== APPLICATION BOOTSTRAP =====
async function bootstrap() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(indexHtmlPath);

  if (isProduction && fs.existsSync(indexHtmlPath)) {
    // Production static serving
    console.log(`Serving static files from ${distDir}`);
    app.use(express.static(distDir));

    app.get('*', (_req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    // Development mode with Vite middleware
    console.log('Mounting Vite dev middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const rootIndex = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(rootIndex, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HACKER PRIME AI running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
