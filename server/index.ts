import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';

const app = express();
const port = process.env.PORT || 3001;
const parser = new Parser();

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

// A simple mock list of skills for now, since parsing them requires file system ops
app.get('/api/skills', (req, res) => {
  res.json({
    skills: [
      { id: 'apify-google-places', name: 'Google Places Scraper', type: 'Python' },
      { id: 'apify-instagram', name: 'Instagram Scraper', type: 'Python' },
      { id: 'firecrawl', name: 'Firecrawl Search', type: 'Node' },
      { id: 'youtube', name: 'YouTube Intel', type: 'Python' },
    ]
  });
});

app.post('/api/skills/run', (req, res) => {
  const { skillId, command } = req.body;
  // This is a basic mock execution for safety and speed. 
  // In reality, this would map to a specific script in the SKILLS_DIR.
  console.log(`Executing ${skillId} with command: ${command}`);
  
  // Just returning a mock success response for now
  res.json({ status: 'running', message: `Started execution of ${skillId}` });
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
      execSync('c:\\Users\\aalta\\anaconda3\\python.exe c:\\Users\\aalta\\github\\central-command\\server\\estimate_activity.py');
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
    const trackerScript = 'c:\\Users\\aalta\\github\\central-command\\server\\activity_tracker.py';
    
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
