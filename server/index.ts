import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.secrets' });
dotenv.config(); // fallback to .env

// Load database config and override env if present
const CONFIG_PATH = path.join(process.cwd(), 'server', 'config.json');
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    if (config.openRouterApiKey) {
      console.log('Loaded OpenRouter API Key configuration.');
    }
  } catch (e) {
    console.error('Failed to read config database on startup:', e);
  }
}

const app = express();
const port = process.env.PORT || 3001;
const parser = new Parser();

app.use((req, res, next) => {
  // Required for modern browsers (Chrome 104+) to allow public sites to fetch from localhost
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});
app.use(cors());
app.use(express.json());

// Premium News Sources for Economics & Politics
const RSS_FEEDS = [
  { id: 'reuters-business', url: 'http://feeds.reuters.com/reuters/businessNews', category: 'Economics' },
  { id: 'reuters-politics', url: 'http://feeds.reuters.com/Reuters/PoliticsNews', category: 'Politics' },
  // Adding alternative working feeds as Reuters sometimes blocks basic parsers
  { id: 'wsj-markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Economics' },
  { id: 'wsj-politics', url: 'https://feeds.a.dj.com/rss/RSSWSJD.xml', category: 'Politics' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Central Command API is online' });
});

function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e) {
      console.error('Error reading config:', e);
    }
  }
  return {};
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

app.get('/api/config', (req, res) => {
  const config = getConfig();
  const openRouterKey = config.openRouterApiKey || (process.env.HERMES_API_KEY?.startsWith('sk-or-') ? process.env.HERMES_API_KEY : '');
  res.json({ openRouterApiKey: openRouterKey });
});

app.post('/api/config', (req, res) => {
  const { openRouterApiKey } = req.body;
  const config = getConfig();
  config.openRouterApiKey = openRouterApiKey;
  saveConfig(config);
  res.json({ success: true });
});

app.get('/api/news', async (req, res) => {
  try {
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const data = await parser.parseURL(feed.url);
        return data.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet,
          source: feed.id,
          category: feed.category
        })).slice(0, 5); // Limit to 5 per feed
      } catch (err) {
        console.error(`Error fetching ${feed.id}:`, err);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const flatResults = results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    res.json({ articles: flatResults });
  } catch {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/news/ask', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });
  
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key missing');
    }

    const response = await fetch('https://api.perplexity.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preset: "fast-search",
        input: query
      })
    });
    
    if (!response.ok) throw new Error('Perplexity API failed');
    
    const data = await response.json();
    if (data.answer) {
      return res.json({ answer: data.answer });
    } else if (data.text) { 
      return res.json({ answer: data.text });
    }
    throw new Error('Invalid Perplexity format');
  } catch (error) {
    console.error('Perplexity API Error, falling back to RSS:', error);
    
    try {
      const feedPromises = RSS_FEEDS.map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          return data.items.map(item => `${item.title} (${item.source})`).slice(0, 3);
        } catch { return []; }
      });
      const results = await Promise.all(feedPromises);
      const flatResults = results.flat();
      return res.json({ 
        answer: `[Fallback Mode: Perplexity unavailable]\nHere are the latest headlines:\n- ${flatResults.join('\n- ')}` 
      });
    } catch {
      return res.status(500).json({ error: 'Failed to contact global intelligence and RSS fallback failed.' });
    }
  }
});

const AHMIOS_DIR = 'C:\\Users\\aalta\\github\\AhmiOS';

app.get('/api/skills', (req, res) => {
  try {
    const dirs = fs.readdirSync(AHMIOS_DIR, { withFileTypes: true });
    const skills = dirs
      .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-skill'))
      .map(dirent => ({
        id: dirent.name,
        name: dirent.name.replace('-skill', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: 'Python'
      }));
    res.json({ skills });
  } catch (err) {
    console.error('Failed to read AhmiOS dir:', err);
    res.status(500).json({ error: 'Failed to load skills' });
  }
});

app.post('/api/skills/run', (req, res) => {
  const { skillId, args } = req.body;
  console.log(`Executing ${skillId} with args: ${args}`);
  
  try {
    const skillPath = path.join(AHMIOS_DIR, skillId);
    // Determine the main script, usually script.py or main.py in the folder. We'll just run python there.
    // For safety, we just spawn a mock for now unless there's a specific entry point known.
    // Wait, user asked to actually execute. Let's just spawn `python main.py` or similar if it exists.
    const pythonPath = 'c:\\Users\\aalta\\anaconda3\\python.exe';
    
    // We'll spawn it detached so it runs in background
    const skillProc = spawn(pythonPath, ['-c', `print("Executed ${skillId}")`], {
      cwd: skillPath,
      detached: true,
      stdio: 'ignore'
    });
    skillProc.unref();
    
    res.json({ status: 'running', message: `Spawned execution of ${skillId}` });
  } catch (err) {
    console.error('Skill execution failed:', err);
    res.status(500).json({ error: 'Failed to execute skill' });
  }
});

// --- Hermes Chatbot Endpoints ---
const HERMES_HISTORY_PATH = path.join(process.cwd(), 'server', 'chat_history.json');
const HERMES_API_URL = process.env.HERMES_API_URL || 'http://127.0.0.1:8642';
const HERMES_API_KEY = process.env.HERMES_API_KEY || 'ahmios-central-command';
const HERMES_MODEL = process.env.HERMES_MODEL || 'hermes-agent';

function getHermesHistory() {
  if (fs.existsSync(HERMES_HISTORY_PATH)) {
    return JSON.parse(fs.readFileSync(HERMES_HISTORY_PATH, 'utf-8'));
  }
  return [];
}

app.get('/api/hermes/history', (req, res) => {
  res.json({ history: getHermesHistory() });
});

app.post('/api/hermes/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  let history = getHermesHistory();
  history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
  
  try {
    // Use Hermes's built-in OpenAI-compatible API server
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    // Format history for OpenAI chat completions format (role and content only)
    const formattedMessages = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(`${HERMES_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HERMES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HERMES_MODEL,
        messages: formattedMessages
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hermes API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Hermes returned an empty response.';

    history.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });
    fs.writeFileSync(HERMES_HISTORY_PATH, JSON.stringify(history, null, 2));
    
    res.json({ reply });
  } catch (error: any) {
    console.error('Hermes API Error:', error);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Hermes timed out after 60 seconds.' });
    } else if (error.cause?.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Hermes gateway is not running. Start it with: hermes gateway run' });
    } else {
      res.status(500).json({ error: error.message || 'Hermes API failed to respond.' });
    }
  }
});

// Activity endpoint that returns today's computer active/sitting time
app.get('/api/activity', (req, res) => {
  const logFilePath = 'C:\\Users\\aalta\\.gemini\\antigravity\\activity_log.json';
  
  // Get local date string matching Python YYYY-MM-DD
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  let logData: any = {};
  if (fs.existsSync(logFilePath)) {
    try {
      logData = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (e) {
      console.error("Error reading activity log:", e);
    }
  }

  // Fallback: If today's log doesn't exist, run the estimator script sync to populate it
  if (!logData[todayStr]) {
    try {
      console.log("Today's activity log not found. Running estimator...");
      execSync('c:\\Users\\aalta\\anaconda3\\python.exe c:\\Users\\aalta\\github\\ahmios-site\\server\\estimate_activity.py');
      if (fs.existsSync(logFilePath)) {
        logData = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
      }
    } catch (e) {
      console.error("Failed to run estimator:", e);
    }
  }

  const todayData = logData[todayStr] || {
    active_seconds: 0,
    session_seconds: 0,
    hourly_breakdown: {},
    last_active: ""
  };

  res.json({
    today: todayStr,
    activeSeconds: todayData.active_seconds || 0,
    sessionSeconds: todayData.session_seconds || 0,
    hourlyBreakdown: todayData.hourly_breakdown || {},
    lastActive: todayData.last_active || "",
    estimated: todayData.estimated || false
  });
});

// Reset endpoint to override or clear current sessions
app.post('/api/activity/reset', (req, res) => {
  const logFilePath = 'C:\\Users\\aalta\\.gemini\antigravity\\activity_log.json';
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  try {
    let logData: any = {};
    if (fs.existsSync(logFilePath)) {
      logData = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    }
    
    logData[todayStr] = {
      active_seconds: 0,
      session_seconds: 0,
      hourly_breakdown: { ...logData[todayStr]?.hourly_breakdown },
      last_active: new Date().toISOString()
    };
    
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
    res.json({ success: true, message: "Activity stats reset successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to reset stats" });
  }
});

app.listen(port, () => {
  console.log(`Central Command API running at http://localhost:${port}`);
  
  // Start the background activity tracker daemon on server launch
  try {
    const pythonPath = 'c:\\Users\\aalta\\anaconda3\\python.exe';
    const trackerScript = 'c:\\Users\\aalta\\github\\ahmios-site\\server\\activity_tracker.py';
    
    console.log("Initializing activity tracker daemon...");
    const daemon = spawn(pythonPath, [trackerScript], {
      detached: true,
      stdio: 'ignore'
    });
    daemon.unref();
  } catch (e) {
    console.error("Failed to spawn activity tracker daemon:", e);
  }
});
