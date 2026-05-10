import { useState, useEffect } from 'react';
import { Terminal, Activity, Globe, ShieldAlert, LogOut, Code, Play, CheckCircle } from 'lucide-react';
import './index.css';

// Mock simple auth
const AUTH_KEY = 'central_command_auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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
        <ArsenalWidget />
        <RadarWidget />
      </main>
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
    } catch (e) {
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

function RadarWidget() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/news`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
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
