import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import Parser from 'rss-parser';

const app = express();
const port = process.env.PORT || 3001;
const parser = new Parser();

app.use(cors());
app.use(express.json());

// Path to the user's skills directory
const SKILLS_DIR = 'C:\\Users\\aalta\\Antigravity Skills';

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
  } catch (error) {
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

app.listen(port, () => {
  console.log(`Central Command API running at http://localhost:${port}`);
});
