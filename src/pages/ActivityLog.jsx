import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ userSummary: [], todayActive: [], recentLogins: [] });
  const [productivity, setProductivity] = useState({ data: [], userStats: [] });
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [filters, setFilters] = useState({ username: '', action: '', dateFrom: '', dateTo: '' });
  const [searchUser, setSearchUser] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchAll(); }, [page]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, logRes, prodRes] = await Promise.all([
        axiosInstance.get('/activity-log/summary', { params: { dateFrom: filters.dateFrom, dateTo: filters.dateTo } }),
        axiosInstance.get('/activity-log', { params: { ...filters, page, limit: 50 } }),
        axiosInstance.get('/productivity-log', { params: { dateFrom: filters.dateFrom, dateTo: filters.dateTo } })
      ]);
      if (sumRes.data.success) setSummary(sumRes.data);
      if (logRes.data.success) { setLogs(logRes.data.data); setTotal(logRes.data.total); }
      if (prodRes.data.success) setProductivity(prodRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchUserDetail = async (username) => {
    try {
      const res = await axiosInstance.get(`/activity-log/user/${username}`, { params: { dateFrom: filters.dateFrom, dateTo: filters.dateTo, action: filters.action } });
      if (res.data.success) { setUserDetail({ username, ...res.data }); setTab('userDetail'); }
    } catch (err) { console.error(err); }
  };

  const handleSearch = () => { if (searchUser.trim()) fetchUserDetail(searchUser.trim()); };
  const handleFilter = () => { setPage(1); fetchAll(); };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const formatTime = (s) => { if (!s) return '0m'; const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const getStars = (score) => '⭐'.repeat(Math.min(5, Math.max(0, Math.round(score)))) + '☆'.repeat(5 - Math.min(5, Math.max(0, Math.round(score))));
  const getScore = (u) => { if (!u.totalActiveSeconds) return 0; const r = u.totalActiveSeconds / (u.totalActiveSeconds + (u.totalIdleSeconds||1)); return Math.round(r * 5 * 10) / 10; };
  const getActionColor = (a) => ({ login:'#4caf50', logout:'#f44336', page_visit:'#2196f3', create:'#9c27b0', update:'#ff9800', delete:'#e91e63' }[a] || '#607d8b');
  const getActionIcon = (a) => ({ login:'🔑', logout:'🚪', page_visit:'👁️', create:'➕', update:'✏️', delete:'🗑️' }[a] || '📋');

  return (
    <div style={{ padding: '16px' }}>
      <style>{`
        .al-wrap { background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden; }
        .al-head { background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); padding:24px 28px; color:#fff; }
        .al-head h4 { margin:0; font-size:22px; font-weight:800; }
        .al-head p { margin:4px 0 0; opacity:0.7; font-size:12px; }
        .al-tabs { display:flex; background:#f5f5f5; border-bottom:2px solid #e0e0e0; overflow-x:auto; }
        .al-tab { padding:12px 18px; cursor:pointer; font-weight:600; font-size:12px; border:none; background:none; color:#666; position:relative; white-space:nowrap; }
        .al-tab.active { color:#302b63; background:#fff; }
        .al-tab.active::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:3px; background:linear-gradient(90deg,#302b63,#764ba2); }
        .al-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; padding:16px; }
        .al-stat { border-radius:12px; padding:16px; color:#fff; text-align:center; }
        .al-stat h2 { margin:0; font-size:24px; font-weight:800; }
        .al-stat span { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9; }
        .al-search { display:flex; gap:8px; padding:16px; background:#fafbff; border-bottom:1px solid #eee; flex-wrap:wrap; align-items:center; }
        .al-search input,.al-search select { padding:8px 12px; border:1.5px solid #e0e7ff; border-radius:8px; font-size:12px; outline:none; }
        .al-search input:focus { border-color:#302b63; }
        .al-btn { padding:8px 14px; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; }
        .al-table { width:100%; border-collapse:collapse; font-size:11px; }
        .al-table th { background:#f8faff; padding:10px 12px; text-align:left; font-weight:700; border-bottom:2px solid #e0e7ff; font-size:10px; text-transform:uppercase; }
        .al-table td { padding:8px 12px; border-bottom:1px solid #f0f0f0; }
        .al-table tr:hover { background:#f8f9ff; }
        .al-badge { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:12px; font-size:9px; font-weight:700; color:#fff; }
        .al-ip { font-family:monospace; font-size:11px; color:#1565c0; background:#e3f2fd; padding:2px 6px; border-radius:4px; }
        .al-online { display:flex; align-items:center; gap:8px; padding:10px 14px; background:linear-gradient(90deg,#e8f5e9,#f1f8e9); border-radius:8px; margin:4px 0; border-left:3px solid #4caf50; }
        .al-dot { width:8px; height:8px; background:#4caf50; border-radius:50%; animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        .al-timeline { position:relative; padding-left:24px; }
        .al-timeline::before { content:''; position:absolute; left:8px; top:0; bottom:0; width:2px; background:#e0e7ff; }
        .al-tl-item { position:relative; margin-bottom:12px; padding:10px 14px; background:#f8faff; border-radius:10px; border:1px solid #e8edf5; }
        .al-tl-item::before { content:''; position:absolute; left:-20px; top:14px; width:10px; height:10px; border-radius:50%; background:#667eea; border:2px solid #fff; box-shadow:0 0 0 2px #667eea; }
        .al-prod-card { background:#fff; border:1px solid #e8edf5; border-radius:12px; padding:16px; transition:all 0.2s; border-top:3px solid #667eea; }
        .al-prod-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .al-bar { height:6px; background:#e8edf5; border-radius:3px; margin-top:8px; overflow:hidden; }
        .al-bar-fill { height:100%; border-radius:3px; transition:width 0.6s; }
        .al-pag { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-top:1px solid #eee; }
        .al-pag button { padding:6px 14px; border:1.5px solid #e0e7ff; border-radius:6px; background:#fff; font-weight:600; font-size:11px; color:#302b63; cursor:pointer; }
        .al-pag button:hover:not(:disabled) { background:#302b63; color:#fff; }
        .al-pag button:disabled { opacity:0.4; cursor:not-allowed; }
        .al-user-header { display:flex; align-items:center; gap:16px; padding:20px; background:linear-gradient(135deg,#667eea22,#764ba222); border-bottom:1px solid #e8edf5; }
        .al-avatar { width:50px; height:50px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:20px; }
      `}</style>

      <div className="al-wrap">
        <div className="al-head">
          <h4>📊 Activity Log & Productivity Monitor</h4>
          <p>Mouse clicks • Keyboard activity • Active/Idle time • Login IP • Session tracking • Performance scores</p>
        </div>

        <div className="al-tabs">
          <button className={`al-tab ${tab==='dashboard'?'active':''}`} onClick={()=>setTab('dashboard')}>🏠 Dashboard</button>
          <button className={`al-tab ${tab==='productivity'?'active':''}`} onClick={()=>setTab('productivity')}>⚡ Productivity</button>
          <button className={`al-tab ${tab==='activity'?'active':''}`} onClick={()=>setTab('activity')}>📋 All Activity</button>
          <button className={`al-tab ${tab==='logins'?'active':''}`} onClick={()=>setTab('logins')}>🔑 Logins</button>
          {userDetail && <button className={`al-tab ${tab==='userDetail'?'active':''}`} onClick={()=>setTab('userDetail')}>👤 {userDetail.username}</button>}
        </div>

        {/* SEARCH BAR - always visible */}
        <div className="al-search">
          <input type="text" placeholder="🔍 Search user..." value={searchUser} onChange={e=>setSearchUser(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()} style={{width:160}} />
          <button className="al-btn" style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff'}} onClick={handleSearch}>Search User</button>
          <span style={{color:'#999',fontSize:11}}>|</span>
          <select value={filters.action} onChange={e=>setFilters(p=>({...p,action:e.target.value}))}>
            <option value="">All Tasks</option>
            <option value="login">🔑 Login</option>
            <option value="page_visit">👁️ Page Visit</option>
            <option value="create">➕ Create</option>
            <option value="update">✏️ Update</option>
            <option value="delete">🗑️ Delete</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={e=>setFilters(p=>({...p,dateFrom:e.target.value}))} />
          <input type="date" value={filters.dateTo} onChange={e=>setFilters(p=>({...p,dateTo:e.target.value}))} />
          <button className="al-btn" style={{background:'#302b63',color:'#fff'}} onClick={handleFilter}>Apply Filter</button>
          <button className="al-btn" style={{background:'#f44336',color:'#fff'}} onClick={()=>{setFilters({username:'',action:'',dateFrom:'',dateTo:''});setSearchUser('');setUserDetail(null);setPage(1);setTimeout(fetchAll,100);}}>✕ Clear</button>
        </div>

        {/* DASHBOARD */}
        {tab==='dashboard' && <>
          <div className="al-grid">
            <div className="al-stat" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}><h2>{summary.todayActive?.length||0}</h2><span>🟢 Active Today</span></div>
            <div className="al-stat" style={{background:'linear-gradient(135deg,#f093fb,#f5576c)'}}><h2>{summary.recentLogins?.length||0}</h2><span>🔑 Logins</span></div>
            <div className="al-stat" style={{background:'linear-gradient(135deg,#4facfe,#00f2fe)'}}><h2>{productivity.userStats?.reduce((a,b)=>a+(b.totalClicks||0),0)}</h2><span>🖱️ Clicks</span></div>
            <div className="al-stat" style={{background:'linear-gradient(135deg,#43e97b,#38f9d7)'}}><h2>{productivity.userStats?.reduce((a,b)=>a+(b.totalKeyStrokes||0),0)}</h2><span>⌨️ Keys</span></div>
            <div className="al-stat" style={{background:'linear-gradient(135deg,#fa709a,#fee140)'}}><h2>{formatTime(productivity.userStats?.reduce((a,b)=>a+(b.totalActiveSeconds||0),0))}</h2><span>⏱️ Active</span></div>
            <div className="al-stat" style={{background:'linear-gradient(135deg,#a18cd1,#fbc2eb)'}}><h2>{total}</h2><span>📋 Total Logs</span></div>
          </div>
          <div style={{padding:'16px'}}>
            <h6 style={{fontWeight:700,color:'#1a237e',marginBottom:10}}>🟢 Active Today</h6>
            {summary.todayActive?.map((u,i)=>(
              <div className="al-online" key={i} style={{cursor:'pointer'}} onClick={()=>fetchUserDetail(u.username)}>
                <div className="al-dot"></div>
                <strong style={{fontSize:12}}>{u.username}</strong>
                <span className="al-ip">{u.ipAddress}</span>
                <span style={{marginLeft:'auto',fontSize:10,color:'#666'}}>{formatDate(u.lastSeen)}</span>
              </div>
            ))}
            {!summary.todayActive?.length && <p style={{color:'#999',fontSize:12}}>No active users</p>}
          </div>
        </>}

        {/* PRODUCTIVITY */}
        {tab==='productivity' && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,padding:16}}>
          {productivity.userStats?.map((u,i)=>{
            const score=getScore(u); const pct=u.totalActiveSeconds/((u.totalActiveSeconds||0)+(u.totalIdleSeconds||1))*100;
            return <div className="al-prod-card" key={i} style={{cursor:'pointer'}} onClick={()=>fetchUserDetail(u.username)}>
              <div style={{display:'flex',justifyContent:'space-between'}}><strong style={{color:'#1a237e',fontSize:14}}>{u.username}</strong><span style={{fontSize:11,fontWeight:700,color:score>=3.5?'#2e7d32':'#e65100'}}>{score.toFixed(1)}/5</span></div>
              <div style={{fontSize:16,margin:'6px 0'}}>{getStars(score)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,fontSize:11,color:'#555'}}>
                <span>🖱️ {u.totalClicks?.toLocaleString()} clicks</span><span>⌨️ {u.totalKeyStrokes?.toLocaleString()} keys</span>
                <span>⏱️ {formatTime(u.totalActiveSeconds)} active</span><span>💤 {formatTime(u.totalIdleSeconds)} idle</span>
                <span>📄 {u.totalPages} pages</span><span>📅 {u.daysWorked} days</span>
              </div>
              <div className="al-bar"><div className="al-bar-fill" style={{width:`${pct}%`,background:pct>70?'linear-gradient(90deg,#43e97b,#38f9d7)':pct>40?'linear-gradient(90deg,#fa709a,#fee140)':'linear-gradient(90deg,#f5576c,#f093fb)'}}></div></div>
              <div style={{fontSize:9,color:'#888',textAlign:'right',marginTop:3}}>{Math.round(pct)}% productive</div>
            </div>;
          })}
          {!productivity.userStats?.length && <p style={{color:'#999',padding:20}}>No data yet. Users er activity start hole data ashbe.</p>}
        </div>}

        {/* ALL ACTIVITY */}
        {tab==='activity' && <>
          <div style={{overflowX:'auto'}}>
            <table className="al-table">
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Page</th><th>IP</th><th>Details</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6" style={{textAlign:'center',padding:30}}>Loading...</td></tr> :
                logs.length===0 ? <tr><td colSpan="6" style={{textAlign:'center',padding:30,color:'#999'}}>No activity</td></tr> :
                logs.map((l,i)=><tr key={i}>
                  <td style={{whiteSpace:'nowrap'}}>{formatDate(l.createdAt)}</td>
                  <td><strong style={{color:'#1a237e',cursor:'pointer'}} onClick={()=>fetchUserDetail(l.username)}>{l.username}</strong></td>
                  <td><span className="al-badge" style={{background:getActionColor(l.action)}}>{getActionIcon(l.action)} {l.action}</span></td>
                  <td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.page}</td>
                  <td><span className="al-ip">{l.ipAddress}</span></td>
                  <td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#666'}}>{l.details}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="al-pag">
            <span style={{fontSize:11,color:'#666'}}>Page {page} • {logs.length}/{total}</span>
            <div style={{display:'flex',gap:6}}><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><button disabled={page*50>=total} onClick={()=>setPage(p=>p+1)}>Next →</button></div>
          </div>
        </>}

        {/* LOGINS */}
        {tab==='logins' && <div style={{padding:16}}>
          {summary.recentLogins?.map((l,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'#fff',border:'1px solid #e8edf5',borderRadius:10,marginBottom:8,cursor:'pointer'}} onClick={()=>fetchUserDetail(l.username)}>
            <div className="al-avatar">{l.username?.charAt(0)?.toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,color:'#1a237e'}}>{l.username}</div><div style={{fontSize:9,color:'#888',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.userAgent?.substring(0,80)}</div></div>
            <div style={{textAlign:'right',flexShrink:0}}><span className="al-ip">{l.ipAddress}</span><div style={{fontSize:10,color:'#666',marginTop:3}}>{formatDate(l.createdAt)}</div></div>
          </div>)}
          {!summary.recentLogins?.length && <p style={{color:'#999'}}>No logins yet</p>}
        </div>}

        {/* USER DETAIL */}
        {tab==='userDetail' && userDetail && <>
          <div className="al-user-header">
            <div className="al-avatar">{userDetail.username?.charAt(0)?.toUpperCase()}</div>
            <div>
              <h5 style={{margin:0,fontSize:18,fontWeight:800,color:'#1a237e'}}>{userDetail.username}</h5>
              {userDetail.stats && <div style={{fontSize:11,color:'#666',marginTop:4}}>
                Total: {userDetail.stats.totalActions} actions • {userDetail.stats.activeDays} days • {userDetail.stats.uniquePages} pages • {userDetail.stats.totalLogins} logins
                {userDetail.stats.totalCreates>0 && ` • ${userDetail.stats.totalCreates} creates`}
                {userDetail.stats.totalUpdates>0 && ` • ${userDetail.stats.totalUpdates} updates`}
                {userDetail.stats.totalDeletes>0 && ` • ${userDetail.stats.totalDeletes} deletes`}
              </div>}
              {userDetail.stats && <div style={{fontSize:10,color:'#888',marginTop:2}}>First: {formatDate(userDetail.stats.firstSeen)} • Last: {formatDate(userDetail.stats.lastSeen)}</div>}
            </div>
          </div>

          {/* User's productivity */}
          {userDetail.productivity?.length > 0 && <div style={{padding:16}}>
            <h6 style={{fontWeight:700,color:'#302b63',marginBottom:10}}>⚡ Daily Productivity</h6>
            <div style={{overflowX:'auto'}}>
              <table className="al-table">
                <thead><tr><th>Date</th><th>🖱️ Clicks</th><th>⌨️ Keys</th><th>⏱️ Active</th><th>💤 Idle</th><th>📄 Pages</th><th>IP</th></tr></thead>
                <tbody>{userDetail.productivity.map((p,i)=><tr key={i}>
                  <td style={{fontWeight:600}}>{p.sessionDate}</td>
                  <td>{p.mouseClicks}</td><td>{p.keyStrokes}</td>
                  <td style={{color:'#2e7d32',fontWeight:600}}>{formatTime(p.activeSeconds)}</td>
                  <td style={{color:'#c62828'}}>{formatTime(p.idleSeconds)}</td>
                  <td>{p.pagesVisited}</td><td><span className="al-ip">{p.ipAddress}</span></td>
                </tr>)}</tbody>
              </table>
            </div>
          </div>}

          {/* User's login sessions */}
          {userDetail.sessions?.length > 0 && <div style={{padding:'0 16px 16px'}}>
            <h6 style={{fontWeight:700,color:'#302b63',marginBottom:10}}>🔑 Login Sessions</h6>
            {userDetail.sessions.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'#f8faff',borderRadius:8,marginBottom:6,fontSize:11}}>
              <span>🔑</span><span className="al-ip">{s.ipAddress}</span><span style={{color:'#666',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.userAgent?.substring(0,60)}</span><span style={{fontWeight:600}}>{formatDate(s.createdAt)}</span>
            </div>)}
          </div>}

          {/* User's activity timeline */}
          <div style={{padding:'0 16px 16px'}}>
            <h6 style={{fontWeight:700,color:'#302b63',marginBottom:10}}>📋 Activity Timeline</h6>
            <div className="al-timeline">
              {userDetail.activities?.slice(0,100).map((a,i)=><div className="al-tl-item" key={i}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span className="al-badge" style={{background:getActionColor(a.action)}}>{getActionIcon(a.action)} {a.action}</span>
                  <span style={{fontSize:10,color:'#888'}}>{formatDate(a.createdAt)}</span>
                </div>
                <div style={{fontSize:11,marginTop:4,color:'#333'}}>{a.page}</div>
                {a.details && <div style={{fontSize:10,color:'#666',marginTop:2}}>{a.details}</div>}
              </div>)}
            </div>
          </div>
        </>}
      </div>
    </div>
  );
};

export default ActivityLog;
