import { useState, useEffect } from 'react';
import { Terminal, Activity, Globe, ShieldAlert, LogOut, Code, Play, Clock, AlertTriangle, Coffee, Sparkles } from 'lucide-react';
import './index.css';

// Mock simple auth
const AUTH_KEY = 'central_command_auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <ShieldAlert size={32} color="var(--accent-red)" />
            <h1 style={{ fontSize: '24px', margin: 0 }}>RESTRICTED ACCESS</h1>
          </div>
          
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p style={{ color: 'var(--accent-red)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          
          <button type="submit" className="glass-button primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
            Initialize Protocol
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>CENTRAL COMMAND</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div className="status-dot"></div>
              <span style={{ fontSize: '12px', color: 'var(--accent-green)' }}>System Online</span>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', flex: 1 }}>
          <button className="glass-button" style={{ justifyContent: 'flex-start' }}><Activity size={18}/> Dashboard</button>
          <button className="glass-button" style={{ justifyContent: 'flex-start' }}><Code size={18}/> The Arsenal</button>
          <button className="glass-button" style={{ justifyContent: 'flex-start' }}><Globe size={18}/> The Radar</button>
        </nav>

        <button onClick={handleLogout} className="glass-button" style={{ justifyContent: 'center', color: 'var(--accent-red)', borderColor: 'rgba(255, 51, 102, 0.3)' }}>
          <LogOut size={18} /> Terminate Session
        </button>
      </aside>

      {/* Main Content Grid */}
      <main className="main-content">
        <ActivityWidget />
        <ArsenalWidget />
        <RadarWidget />
      </main>
    </div>
  );
}

interface ActivityData {
  today: string;
  activeSeconds: number;
  sessionSeconds: number;
  hourlyBreakdown: Record<string, number>;
  lastActive: string;
  estimated: boolean;
}

function ActivityWidget() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchActivity = () => {
    fetch(`${API_URL}/api/activity`)
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
        setError(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000); // Refresh every 15s for high responsiveness
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset current session and active time?')) return;
    try {
      const res = await fetch(`${API_URL}/api/activity/reset`, { method: 'POST' });
      if (res.ok) {
        fetchActivity();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}>
        <Activity size={32} color="var(--accent-cyan)" className="animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '12px', borderColor: 'var(--accent-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-red)' }}>
          <AlertTriangle size={24} />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Activity Telemetry Offline</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Could not connect to the local active-hours daemon. Make sure the local Express server is running on port 3001.</p>
        <button className="glass-button" onClick={fetchActivity} style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '6px 12px' }}>Retry Connection</button>
      </div>
    );
  }

  const activeHours = Math.floor(data.activeSeconds / 3600);
  const activeMins = Math.floor((data.activeSeconds % 3600) / 60);
  
  const sessionMins = Math.floor(data.sessionSeconds / 60);
  
  // Calculate health state based on session sitting time
  let healthMessage = 'Ergonomic status nominal. Keep up the great pace!';
  let healthColor = 'var(--accent-green)';
  
  if (sessionMins >= 60) {
    healthMessage = 'ALERT: Prolonged sitting detected! Please stand up and stretch immediately.';
    healthColor = 'var(--accent-red)';
  } else if (sessionMins >= 45) {
    healthMessage = `Break threshold approaching. Plan to stand or walk in ${60 - sessionMins} mins.`;
    healthColor = '#ffaa00';
  } else {
    if (sessionMins > 0) {
      healthMessage = `Current work session active for ${sessionMins} mins. Stand break target in ${45 - sessionMins} mins.`;
    } else {
      healthMessage = 'Sitting time reset. User currently standing or taking a break.';
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={26} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>Active Workspace Uptime</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>System-level ergonomics & focus telemetry</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {data.estimated && (
            <span style={{ fontSize: '11px', color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)', background: 'rgba(138,43,226,0.05)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
              ESTIMATED FROM LOGS
            </span>
          )}
          <span className="status-dot" style={{ backgroundColor: data.sessionSeconds > 0 ? 'var(--accent-green)' : '#ffaa00' }}></span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: data.sessionSeconds > 0 ? 'var(--accent-green)' : '#ffaa00' }}>
            {data.sessionSeconds > 0 ? 'USER ACTIVE' : 'USER IDLE'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1: Total Hours Today */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Uptime Today</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
                {activeHours}h {activeMins}m
              </span>
              <span style={{ fontSize: '14px', color: 'var(--accent-cyan)' }}>
                ({(data.activeSeconds / 3600).toFixed(1)}h)
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Consecutive Sitting Time */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: `rgba(${sessionMins >= 45 ? '255, 51, 102' : '0, 255, 102'}, 0.1)`, color: healthColor }}>
            <Coffee size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sitting Session</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>
                {sessionMins}m
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                consecutive
              </span>
            </div>
            {/* Visual Gauge */}
            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (sessionMins / 60) * 100)}%`, background: healthColor, transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Health Status Card */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', borderLeft: `4px solid ${healthColor}` }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ergonomic Guidance</span>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
            {healthMessage}
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '11px', padding: 0, textDecoration: 'underline' }}>
              Reset Session
            </button>
            <button onClick={fetchActivity} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '11px', padding: 0, textDecoration: 'underline' }}>
              Sync Log
            </button>
          </div>
        </div>

      </div>

      {/* Hourly Breakdown Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Hourly Breakdown (Today)</span>
        
        <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 10px 0 10px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          {Object.entries(data.hourlyBreakdown).map(([hour, sec]) => {
            const minActive = Math.round(sec / 60);
            const heightPct = Math.min(100, (sec / 3600) * 100);
            const hrInt = parseInt(hour, 10);
            const displayLabel = hrInt % 4 === 0 ? `${String(hrInt).padStart(2, '0')}:00` : '';

            return (
              <div key={hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                {/* Bar */}
                <div 
                  title={`${hour}:00 - ${minActive} mins active`}
                  style={{ 
                    width: '70%', 
                    height: `${Math.max(4, heightPct)}%`, 
                    background: sec > 0 ? 'linear-gradient(to top, var(--accent-cyan), var(--accent-purple))' : 'rgba(255,255,255,0.03)', 
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.3s ease',
                    boxShadow: sec > 0 ? '0 0 10px rgba(0, 240, 255, 0.15)' : 'none',
                    cursor: 'pointer'
                  }}
                />
                {/* Label */}
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', height: '12px', overflow: 'visible', whiteSpace: 'nowrap' }}>
                  {displayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ArsenalWidget() {
  const [skills, setSkills] = useState<{id: string, name: string, type: string}[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/skills`)
      .then(res => res.json())
      .then(data => setSkills(data.skills))
      .catch(console.error);
  }, []);

  const runSkill = async (id: string) => {
    setExecuting(id);
    setOutput(prev => [...prev, `> Initializing ${id}...`]);
    try {
      const res = await fetch(`${API_URL}/api/skills/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: id, command: 'execute' })
      });
      const data = await res.json();
      setTimeout(() => {
        setOutput(prev => [...prev, `[SUCCESS] ${data.message}`]);
        setExecuting(null);
      }, 1500); // Simulate some execution time
    } catch {
      setOutput(prev => [...prev, `[ERROR] Failed to execute ${id}`]);
      setExecuting(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Code size={24} color="var(--accent-purple)" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>The Arsenal</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {skills.map(skill => (
          <div key={skill.id} className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 4px 0' }}>{skill.name}</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{skill.type}</span>
            <button 
              className="glass-button" 
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px' }}
              onClick={() => runSkill(skill.id)}
              disabled={executing !== null}
            >
              {executing === skill.id ? <Activity size={14} className="animate-pulse" /> : <Play size={14} />}
              {executing === skill.id ? 'Running...' : 'Execute'}
            </button>
          </div>
        ))}
      </div>

      {output.length > 0 && (
        <div style={{ background: '#000', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: 'auto', fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-green)', maxHeight: '150px', overflowY: 'auto' }}>
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Article {
  title: string;
  link: string;
  category: string;
  pubDate: string;
  contentSnippet: string;
}

function RadarWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/news`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Globe size={24} color="var(--accent-cyan)" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>The Radar</h2>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', padding: '2px 8px', borderRadius: '12px' }}>LIVE</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Activity size={32} color="var(--accent-cyan)" className="animate-pulse" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '500px', paddingRight: '8px' }}>
          {articles.map((article, i) => (
            <a key={i} href={article.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', transition: 'transform 0.2s' }} 
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: article.category === 'Economics' ? 'var(--accent-green)' : 'var(--accent-purple)', fontWeight: 'bold' }}>
                    {article.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(article.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', margin: '0 0 8px 0', lineHeight: 1.4 }}>{article.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.contentSnippet}
                </p>
              </div>
            </a>
          ))}
          {articles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No signals detected. Waiting for intel.</p>}
        </div>
      )}
    </div>
  );
}
