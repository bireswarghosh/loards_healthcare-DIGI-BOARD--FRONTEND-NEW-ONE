import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ userSummary: [], todayActive: [], recentLogins: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [filters, setFilters] = useState({ username: '', action: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchSummary(); fetchLogs(); }, [page, filters]);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get('/activity-log/summary', { params: { dateFrom: filters.dateFrom, dateTo: filters.dateTo } });
      if (res.data.success) setSummary(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/activity-log', { params: { ...filters, page, limit: 50 } });
      if (res.data.success) { setLogs(res.data.data); setTotal(res.data.total); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const getActionColor = (action) => {
    const colors = { login: '#4caf50', logout: '#f44336', page_visit: '#2196f3', create: '#9c27b0', update: '#ff9800', delete: '#e91e63' };
    return colors[action] || '#607d8b';
  };
  const getActionIcon = (action) => {
    const icons = { login: '🔑', logout: '🚪', page_visit: '👁️', create: '➕', update: '✏️', delete: '🗑️' };
    return icons[action] || '📋';
  };

  return (
    <div style={{ padding: '20px' }}>
      <style>{`
        .al-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 20px; }
        .al-header { background: linear-gradient(135deg, #1a237e, #4a148c); padding: 24px 30px; color: #fff; }
        .al-header h4 { margin: 0; font-size: 22px; font-weight: 700; }
        .al-header p { margin: 4px 0 0; opacity: 0.8; font-size: 13px; }
        .al-tabs { display: flex; gap: 0; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; }
        .al-tab { padding: 14px 24px; cursor: pointer; font-weight: 600; font-size: 13px; border: none; background: none; color: #666; transition: all 0.2s; position: relative; }
        .al-tab.active { color: #1a237e; background: #fff; }
        .al-tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #1a237e, #4a148c); border-radius: 3px 3px 0 0; }
        .al-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 20px; }
        .al-stat { background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; padding: 20px; color: #fff; text-align: center; }
        .al-stat:nth-child(2) { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .al-stat:nth-child(3) { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .al-stat:nth-child(4) { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        .al-stat h2 { margin: 0; font-size: 32px; font-weight: 800; }
        .al-stat span { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
        .al-online { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #e8f5e9; border-radius: 10px; margin: 4px 0; }
        .al-online .dot { width: 10px; height: 10px; background: #4caf50; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .al-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .al-table th { background: #f8faff; padding: 12px 14px; text-align: left; font-weight: 700; color: #333; border-bottom: 2px solid #e0e7ff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .al-table td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; }
        .al-table tr:hover { background: #f8f9ff; }
        .al-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; color: #fff; }
        .al-ip { font-family: 'Courier New', monospace; font-size: 12px; color: #1565c0; background: #e3f2fd; padding: 3px 8px; border-radius: 6px; }
        .al-filter { display: flex; flex-wrap: wrap; gap: 12px; padding: 16px 20px; background: #fafbff; border-bottom: 1px solid #e8edf5; align-items: center; }
        .al-filter input, .al-filter select { padding: 8px 12px; border: 1.5px solid #e0e7ff; border-radius: 8px; font-size: 12px; outline: none; }
        .al-filter input:focus, .al-filter select:focus { border-color: #1a237e; }
        .al-perf { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 20px; }
        .al-perf-card { background: #fff; border: 1px solid #e8edf5; border-radius: 12px; padding: 18px; transition: all 0.2s; }
        .al-perf-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .al-perf-card h5 { margin: 0 0 8px; font-size: 15px; color: #1a237e; font-weight: 700; }
        .al-perf-card .meta { font-size: 11px; color: #888; }
        .al-perf-card .bar { height: 6px; background: #e0e7ff; border-radius: 3px; margin-top: 10px; overflow: hidden; }
        .al-perf-card .bar-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 3px; transition: width 0.5s; }
        .al-login-card { background: #fff; border: 1px solid #e8edf5; border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; margin-bottom: 10px; transition: all 0.2s; }
        .al-login-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .al-login-card .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
        .al-pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #e8edf5; }
        .al-pagination button { padding: 8px 16px; border: 2px solid #e0e7ff; border-radius: 8px; background: #fff; font-weight: 600; font-size: 12px; color: #1a237e; cursor: pointer; }
        .al-pagination button:hover:not(:disabled) { background: #1a237e; color: #fff; }
        .al-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="al-card">
        <div className="al-header">
          <h4>📊 Activity Log & Performance Monitor</h4>
          <p>Track user activities, login history, IP addresses & performance across the system</p>
        </div>

        <div className="al-tabs">
          <button className={`al-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>🏠 Dashboard</button>
          <button className={`al-tab ${tab === 'logins' ? 'active' : ''}`} onClick={() => setTab('logins')}>🔑 Login History</button>
          <button className={`al-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>📋 All Activity</button>
          <button className={`al-tab ${tab === 'performance' ? 'active' : ''}`} onClick={() => setTab('performance')}>📈 Performance</button>
        </div>

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <>
            <div className="al-stats">
              <div className="al-stat">
                <h2>{summary.todayActive?.length || 0}</h2>
                <span>Active Today</span>
              </div>
              <div className="al-stat">
                <h2>{summary.recentLogins?.length || 0}</h2>
                <span>Recent Logins</span>
              </div>
              <div className="al-stat">
                <h2>{summary.userSummary?.length || 0}</h2>
                <span>Total Users Tracked</span>
              </div>
              <div className="al-stat">
                <h2>{total}</h2>
                <span>Total Activities</span>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>🟢 Currently Active Today</h6>
              {summary.todayActive?.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No active users today</p>}
              {summary.todayActive?.map((u, i) => (
                <div className="al-online" key={i}>
                  <div className="dot"></div>
                  <strong style={{ fontSize: 13 }}>{u.username}</strong>
                  <span className="al-ip">{u.ipAddress}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666' }}>Last: {formatDate(u.lastSeen)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LOGIN HISTORY TAB */}
        {tab === 'logins' && (
          <div style={{ padding: '20px' }}>
            <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 16 }}>🔑 Recent Login History</h6>
            {summary.recentLogins?.map((l, i) => (
              <div className="al-login-card" key={i}>
                <div className="avatar">{l.username?.charAt(0)?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{l.username}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{l.userAgent?.substring(0, 80)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="al-ip">{l.ipAddress}</span>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{formatDate(l.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALL ACTIVITY TAB */}
        {tab === 'activity' && (
          <>
            <div className="al-filter">
              <input type="text" placeholder="Username" value={filters.username} onChange={e => setFilters(p => ({ ...p, username: e.target.value }))} />
              <select value={filters.action} onChange={e => setFilters(p => ({ ...p, action: e.target.value }))}>
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="page_visit">Page Visit</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} />
              <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} />
              <button onClick={() => { setFilters({ username: '', action: '', dateFrom: '', dateTo: '' }); setPage(1); }} style={{ padding: '8px 14px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕ Clear</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Page</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#999' }}>No activity found</td></tr>
                  ) : logs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{formatDate(log.createdAt)}</td>
                      <td><strong style={{ color: '#1a237e' }}>{log.username}</strong></td>
                      <td>
                        <span className="al-badge" style={{ background: getActionColor(log.action) }}>
                          {getActionIcon(log.action)} {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.page}</td>
                      <td><span className="al-ip">{log.ipAddress}</span></td>
                      <td style={{ fontSize: 11, color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="al-pagination">
              <span style={{ fontSize: 12, color: '#666' }}>Showing {logs.length} of {total} records</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}

        {/* PERFORMANCE TAB */}
        {tab === 'performance' && (
          <>
            <div className="al-filter">
              <span style={{ fontSize: 12, fontWeight: 600 }}>Date Range:</span>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} />
              <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} />
            </div>
            <div className="al-perf">
              {summary.userSummary?.map((u, i) => {
                const maxActions = Math.max(...summary.userSummary.map(x => x.totalActions));
                const pct = maxActions > 0 ? (u.totalActions / maxActions) * 100 : 0;
                return (
                  <div className="al-perf-card" key={i}>
                    <h5>{u.username}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div className="meta">🔢 Actions: <strong>{u.totalActions}</strong></div>
                      <div className="meta">📅 Active Days: <strong>{u.activeDays}</strong></div>
                      <div className="meta">📄 Pages: <strong>{u.pagesVisited}</strong></div>
                      <div className="meta">🔑 Logins: <strong>{u.loginCount}</strong></div>
                    </div>
                    <div className="meta" style={{ marginTop: 6 }}>Last: {formatDate(u.lastActivity)}</div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }}></div></div>
                  </div>
                );
              })}
              {summary.userSummary?.length === 0 && <p style={{ color: '#999', padding: 20 }}>No performance data yet</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
