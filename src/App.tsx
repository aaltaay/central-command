import { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Globe, ShieldAlert, LogOut, Code, Play, Clock, Sparkles, MessageSquare, Send, TestTube, Coins } from 'lucide-react';
import './index.css';

const AUTH_KEY = 'central_command_auth';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mockMode, setMockMode] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <ShieldAlert size={32} color="var(--danger)" />
            <h1 style={{ fontSize: '24px', margin: 0 }}>RESTRICTED ACCESS</h1>
          </div>
          <input 
            type="password" 
            placeholder="Enter Access Code" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
            Initialize Protocol
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Sidebar */}
      <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={28} color="var(--accent)" />
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>AhmiOS</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--success)' }}>System Online</span>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', flex: 1 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}><Activity size={18}/> Activity Tracker</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}><Code size={18}/> The Arsenal</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}><Globe size={18}/> The Radar</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}><MessageSquare size={18}/> Hermes Uplink</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}><Coins size={18}/> Token Usage</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <TestTube size={18} color={mockMode ? 'var(--accent)' : 'var(--text-muted)'} />
          <label style={{ fontSize: '14px', cursor: 'pointer', flex: 1 }}>Mock Mode (Test UI)</label>
          <input type="checkbox" checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} />
        </div>

        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', color: 'var(--danger)' }}>
          <LogOut size={18} /> Terminate
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '10px' }}>
        <ActivityWidget mockMode={mockMode} />
        <ArsenalWidget mockMode={mockMode} />
        <RadarWidget mockMode={mockMode} />
        <OpenRouterWidget mockMode={mockMode} />
      </main>

      {/* Right Sidebar - Hermes Chat */}
      <aside className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <HermesChatWidget mockMode={mockMode} />
      </aside>
    </div>
  );
}

// --- Widgets ---

function HermesChatWidget({ mockMode }: { mockMode: boolean }) {
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (mockMode) {
      setHistory([{ role: 'assistant', content: '[Mock] Hermes uplink established.' }]);
      return;
    }
    fetch(`${API_URL}/api/hermes/history`)
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(console.error);
  }, [mockMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const stopThinking = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    if (mockMode) {
      setTimeout(() => {
        setHistory(prev => [...prev, { role: 'assistant', content: `[Mock Response] I received: "${userMsg}"` }]);
        setLoading(false);
      }, 1000);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch(`${API_URL}/api/hermes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
        signal: abortController.signal
      });
      const data = await res.json();
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply || data.error }]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setHistory(prev => [...prev, { role: 'assistant', content: '[Terminated] The connection was forcibly closed by user.' }]);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: 'Error connecting to Hermes daemon.' }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="chat-window">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '16px', margin: 0 }}>Hermes Uplink</h2>
        </div>
        <span className="badge">LIVE</span>
      </div>
      
      <div className="chat-history" ref={scrollRef}>
        {history.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No history found.</p>}
        {history.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'hermes'}`}>
            <span style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-msg hermes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="loading-dot" style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thinking...</span>
            </div>
            <button 
              className="btn-secondary" 
              style={{ padding: '2px 8px', fontSize: '10px', color: 'var(--danger)', cursor: 'pointer', border: '1px solid var(--danger)' }}
              onClick={stopThinking}
              type="button"
            >
              STOP
            </button>
          </div>
        )}
      </div>

      <form className="chat-input-wrapper" onSubmit={sendMsg}>
        <input 
          type="text" 
          placeholder="Ask Hermes..." 
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }} disabled={loading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function ArsenalWidget({ mockMode }: { mockMode: boolean }) {
  const [skills, setSkills] = useState<{id: string, name: string, type: string}[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [argsMap, setArgsMap] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (mockMode) {
      setSkills([{ id: 'mock-skill', name: 'Mock Scraper', type: 'Python' }]);
      return;
    }
    fetch(`${API_URL}/api/skills`)
      .then(res => res.json())
      .then(data => setSkills(data.skills))
      .catch(console.error);
  }, [mockMode]);

  const runSkill = async (id: string) => {
    setExecuting(id);
    const args = argsMap[id] || '';
    setOutput(prev => [...prev, `> Initializing ${id} with args: [${args}]...`]);
    
    if (mockMode) {
      setTimeout(() => {
        setOutput(prev => [...prev, `[SUCCESS] Mock execution of ${id} completed.`]);
        setExecuting(null);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/skills/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: id, args })
      });
      const data = await res.json();
      setOutput(prev => [...prev, `[INFO] ${data.message || data.error}`]);
    } catch {
      setOutput(prev => [...prev, `[ERROR] Failed to execute ${id}`]);
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px', margin: 0 }}>The Arsenal</h2>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {skills.map(skill => (
          <div key={skill.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>{skill.name}</h3>
            <input 
              type="text" 
              placeholder="Arguments (optional)" 
              value={argsMap[skill.id] || ''}
              onChange={e => setArgsMap({...argsMap, [skill.id]: e.target.value})}
              style={{ marginBottom: '10px', fontSize: '12px', padding: '0.5rem' }}
            />
            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0.5rem' }}
              onClick={() => runSkill(skill.id)}
              disabled={executing !== null}
            >
              {executing === skill.id ? <Activity size={14} className="animate-pulse" /> : <Play size={14} />}
              {executing === skill.id ? 'Running' : 'Execute'}
            </button>
          </div>
        ))}
      </div>

      {output.length > 0 && (
        <div style={{ background: '#000', padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', marginTop: 'auto', fontFamily: 'monospace', fontSize: '12px', color: 'var(--success)', maxHeight: '150px', overflowY: 'auto' }}>
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function RadarWidget({ mockMode }: { mockMode: boolean }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const askRadar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    if (mockMode) {
      setTimeout(() => {
        setResponse('[Mock] Global intelligence acquired: All systems nominal.');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/news/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResponse(data.answer || data.error);
    } catch (err) {
      setResponse('Error establishing uplink to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px', margin: 0 }}>The Radar</h2>
        </div>
        <span className="badge">PERPLEXITY</span>
      </div>

      <form onSubmit={askRadar} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Ask about live news (e.g., 'Is Anthropic's new model blocked?')" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {loading ? <Activity size={18} className="animate-pulse" /> : <Sparkles size={18} />}
          Scan
        </button>
      </form>

      {(response || loading) && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '14px', lineHeight: 1.6, minHeight: '100px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}>
              <Activity size={18} className="animate-pulse" />
              <span>Querying global signals...</span>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />
          )}
        </div>
      )}
    </div>
  );
}

// Minimal Activity Widget stub for layout completion
function ActivityWidget({ mockMode }: { mockMode: boolean }) {
  const [sessionMins, setSessionMins] = useState(0);

  useEffect(() => {
    if (mockMode) {
      setSessionMins(30);
      return;
    }
    fetch(`${API_URL}/api/activity`)
      .then(res => res.json())
      .then(data => setSessionMins(Math.floor(data.sessionSeconds / 60)))
      .catch(() => {});
  }, [mockMode]);

  return (
    <div className="glass-panel">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Active Workspace Uptime</h2>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', flex: 1 }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CURRENT SESSION</span>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{sessionMins}m</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', flex: 2 }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ERGONOMIC STATUS</span>
          <div style={{ fontSize: '16px', color: sessionMins > 60 ? 'var(--danger)' : 'var(--success)' }}>
            {sessionMins > 60 ? 'Prolonged sitting detected.' : 'Status Nominal.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpenRouterWidget({ mockMode }: { mockMode: boolean }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_api_key') || '');
  const [data, setData] = useState<{ usage: number; limit: number; is_free_tier: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('openrouter_api_key', val);
  };

  const fetchUsage = async () => {
    if (!apiKey) {
      setError('Please provide an API key');
      return;
    }
    setLoading(true);
    setError('');
    
    if (mockMode) {
      setTimeout(() => {
        setData({ usage: 4.50, limit: 10.00, is_free_tier: false });
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        setError('Invalid API key or failed to fetch');
      }
    } catch (err) {
      setError('Error connecting to OpenRouter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) fetchUsage();
  }, [mockMode, apiKey]);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Coins size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px', margin: 0 }}>OpenRouter Usage</h2>
        </div>
        <span className="badge">TOKENS</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="password" 
          placeholder="OpenRouter API Key (sk-or-...)" 
          value={apiKey}
          onChange={(e) => saveKey(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={fetchUsage} disabled={loading || !apiKey}>
          {loading ? <Activity size={18} className="animate-pulse" /> : 'Check'}
        </button>
      </div>
      
      {error && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Spend / Limit</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              ${data.usage.toFixed(4)} / ${data.limit ? data.limit.toFixed(2) : '∞'}
            </span>
          </div>
          
          {data.limit > 0 && (
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min((data.usage / data.limit) * 100, 100)}%`, 
                height: '100%', 
                background: (data.usage / data.limit) > 0.8 ? 'var(--danger)' : 'var(--accent)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          )}

          {data.is_free_tier && (
            <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '-5px' }}>
              Currently on Free Tier limitations.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
