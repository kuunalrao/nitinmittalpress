/* ═══════════════════════════════════════════════════════════
   NITIN MITTAL PRESS — app.js  v1.0
   GitHub Pages + GAS JSONP Architecture
   Replace GAS_URL with your deployed Apps Script URL
═══════════════════════════════════════════════════════════ */

var GAS_URL = 'https://script.google.com/macros/s/AKfycbwJ7Eex3dmQKJAcJetypTCFCX4SHX_urK6SFJ7YTOmbRGF6IpzIGDWNaPTkb0-9sVqgVQ/exec';
var LS_KEY  = 'nm_press_v1';

/* ── State ───────────────────────────────────────────── */
var _U     = null;   // current user obj
var _TOKEN = null;   // auth token
var _D     = {};     // all data cache
var _V     = 'home'; // current view
var _cbIdx = 0;
var _fabCb = null;
var _jobFilter = 'all';
var _jobSearch = '';

/* ── JSONP API ───────────────────────────────────────── */
function _api(action, data, ok, err) {
  var cbName = '_gcb' + (++_cbIdx);
  var timeout;
  window[cbName] = function(r) {
    clearTimeout(timeout);
    try { delete window[cbName]; } catch(e) {}
    var s = document.getElementById('_s_' + cbName);
    if (s) s.remove();
    if (r && r.success === false && r.error === 'NOT_AUTHENTICATED') {
      _signOut(); return;
    }
    if (ok) ok(r);
  };
  timeout = setTimeout(function() {
    try { delete window[cbName]; } catch(e) {}
    var s = document.getElementById('_s_' + cbName);
    if (s) s.remove();
    if (err) err({ message: 'Request timed out. Check connection.' });
    else _toast('⚠️ Request timed out');
  }, 20000);
  var url = GAS_URL + '?callback=' + cbName + '&payload='
    + encodeURIComponent(JSON.stringify({ action: action, data: data || {}, token: _TOKEN || '' }));
  var s  = document.createElement('script');
  s.id   = '_s_' + cbName;
  s.src  = url;
  s.onerror = function() {
    clearTimeout(timeout);
    try { delete window[cbName]; } catch(e) {}
    if (err) err({ message: 'Network error' });
    else _toast('⚠️ Network error');
  };
  document.head.appendChild(s);
}

/* ── Session ─────────────────────────────────────────── */
function _saveSession() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ token: _TOKEN, user: _U })); } catch(e) {}
}
function _loadSession() {
  try {
    var s = localStorage.getItem(LS_KEY);
    if (!s) return false;
    var p = JSON.parse(s);
    if (!p.token || !p.user) return false;
    _TOKEN = p.token; _U = p.user; return true;
  } catch(e) { return false; }
}
function _clearSession() {
  try { localStorage.removeItem(LS_KEY); } catch(e) {}
  _TOKEN = null; _U = null; _D = {};
}

/* ── Init ────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function() {
  // Prevent blank screen — show login immediately
  document.getElementById('sLogin').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';

  // Auto-login from saved session
  if (_loadSession()) {
    _bootApp();
  }

  // Enter key on login
  document.getElementById('lPass').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') _doLogin();
  });
  document.getElementById('lEmail').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('lPass').focus();
  });
});

/* ── Login ───────────────────────────────────────────── */
function _doLogin() {
  var email = document.getElementById('lEmail').value.trim();
  var pass  = document.getElementById('lPass').value.trim();
  var err   = document.getElementById('lErr');
  var btn   = document.getElementById('lBtn');
  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Please enter email and password.'; return; }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';
  btn.disabled  = true;
  _api('login', { email: email, password: pass }, function(r) {
    btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
    btn.disabled  = false;
    if (!r.success) { err.textContent = r.error || 'Login failed.'; return; }
    _TOKEN = r.token; _U = r.user;
    _saveSession();
    _bootApp();
  }, function(e) {
    btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
    btn.disabled  = false;
    err.textContent = e.message || 'Connection error.';
  });
}

function _bootApp() {
  // Show app, hide login
  document.getElementById('sLogin').style.display = 'none';
  document.getElementById('appShell').classList.add('on');

  // Set user info in sidebar
  document.getElementById('sbAvatar').textContent = (_U.name || '?')[0].toUpperCase();
  document.getElementById('sbName').textContent   = _U.name || '—';
  document.getElementById('sbRole').textContent   = _rlabel(_U.role);
  document.getElementById('tbRole').textContent   = _rlabel(_U.role);

  // Build navigation based on role
  _buildNav();

  // Load data
  _showSkeleton();
  _api('getAllData', {}, function(r) {
    _D = r.data || {};
    _lv('home');
  }, function() {
    _D = {};
    _lv('home');
    _toast('⚠️ Data load failed — working offline');
  });
}

function _rlabel(role) {
  var m = { admin: 'Admin', supervisor: 'Supervisor', operator: 'Operator',
            cutting: 'Cutting', viewer: 'Viewer' };
  return m[role] || role || 'Staff';
}

function _signOut() {
  _clearSession();
  document.getElementById('appShell').classList.remove('on');
  document.getElementById('sLogin').style.display = 'flex';
  document.getElementById('lEmail').value = '';
  document.getElementById('lPass').value  = '';
  document.getElementById('lErr').textContent = '';
  _sbClose();
}

/* ── Navigation Builder ──────────────────────────────── */
var NAV_CONFIG = {
  admin: [
    { grp: 'Main' },
    { id: 'home',     icon: 'fa-house',        label: 'Dashboard' },
    { id: 'jobs',     icon: 'fa-clipboard-list',label: 'All Jobs' },
    { id: 'parties',  icon: 'fa-users',         label: 'Parties' },
    { id: 'stock',    icon: 'fa-boxes-stacked', label: 'Stock Register' },
    { grp: 'Operations' },
    { id: 'invoices', icon: 'fa-file-invoice',  label: 'Invoices' },
    { id: 'payments', icon: 'fa-indian-rupee-sign', label: 'Payments' },
    { id: 'expenses', icon: 'fa-receipt',       label: 'Expenses' },
    { id: 'machines', icon: 'fa-gears',         label: 'Machines' },
    { id: 'qc',       icon: 'fa-magnifying-glass-chart', label: 'Quality Control' },
    { id: 'downtime', icon: 'fa-triangle-exclamation',   label: 'Downtime Log' },
    { grp: 'Admin' },
    { id: 'reports',  icon: 'fa-chart-bar',     label: 'Reports' },
    { id: 'staff',    icon: 'fa-id-badge',      label: 'Staff' },
  ],
  supervisor: [
    { grp: 'Main' },
    { id: 'home',     icon: 'fa-house',         label: 'Dashboard' },
    { id: 'jobs',     icon: 'fa-clipboard-list',label: 'All Jobs' },
    { id: 'dispatch', icon: 'fa-truck',         label: 'Dispatch' },
    { grp: 'Operations' },
    { id: 'qc',       icon: 'fa-magnifying-glass-chart', label: 'QC Entry' },
    { id: 'downtime', icon: 'fa-triangle-exclamation',   label: 'Log Downtime' },
    { id: 'machines', icon: 'fa-gears',         label: 'Machine Status' },
  ],
  operator: [
    { grp: 'My Work' },
    { id: 'home',    icon: 'fa-house',          label: 'My Jobs' },
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
    { grp: 'Report' },
    { id: 'downtime',icon: 'fa-triangle-exclamation', label: 'Report Problem' },
  ],
  cutting: [
    { grp: 'My Work' },
    { id: 'home',    icon: 'fa-house',          label: 'Cut Queue' },
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
    { grp: 'Report' },
    { id: 'downtime',icon: 'fa-triangle-exclamation', label: 'Report Problem' },
  ],
  viewer: [
    { grp: 'Overview' },
    { id: 'home',     icon: 'fa-house',         label: 'Summary' },
    { id: 'jobs',     icon: 'fa-clipboard-list',label: 'All Jobs' },
    { id: 'invoices', icon: 'fa-file-invoice',  label: 'Revenue' },
    { id: 'parties',  icon: 'fa-users',         label: 'Parties' },
  ]
};

var BNAV_CONFIG = {
  admin:      [['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],['invoices','fa-file-invoice','Bills'],['parties','fa-users','Parties']],
  supervisor: [['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],['dispatch','fa-truck','Dispatch'],['qc','fa-magnifying-glass-chart','QC']],
  operator:   [['home','fa-house','My Jobs'],['history','fa-clock-rotate-left','History'],['downtime','fa-triangle-exclamation','Problem']],
  cutting:    [['home','fa-house','Cut Jobs'],['history','fa-clock-rotate-left','History'],['downtime','fa-triangle-exclamation','Problem']],
  viewer:     [['home','fa-house','Summary'],['jobs','fa-clipboard-list','Jobs'],['invoices','fa-file-invoice','Revenue'],['parties','fa-users','Parties']],
};

function _buildNav() {
  var role  = _U.role;
  var items = NAV_CONFIG[role] || NAV_CONFIG.viewer;
  var bnav  = BNAV_CONFIG[role] || BNAV_CONFIG.viewer;
  var sbEl  = document.getElementById('sbNav');
  var bnEl  = document.getElementById('bnav');

  // Sidebar
  sbEl.innerHTML = items.map(function(it) {
    if (it.grp) return '<div class="nav-grp">' + it.grp + '</div>';
    return '<div class="nav-item" id="sni_' + it.id + '" onclick="_lv(\'' + it.id + '\');_sbClose()">'
         + '<i class="fa-solid ' + it.icon + '"></i>' + it.label + '</div>';
  }).join('');

  // Bottom Nav
  bnEl.innerHTML = bnav.map(function(it) {
    return '<div class="bn-item" id="bni_' + it[0] + '" onclick="_lv(\'' + it[0] + '\')">'
         + '<i class="fa-solid ' + it[1] + '"></i>' + it[2] + '</div>';
  }).join('');
}

function _setActive(v) {
  document.querySelectorAll('.nav-item').forEach(function(el) { el.classList.remove('on'); });
  document.querySelectorAll('.bn-item').forEach(function(el) { el.classList.remove('on'); });
  var sni = document.getElementById('sni_' + v);
  var bni = document.getElementById('bni_' + v);
  if (sni) sni.classList.add('on');
  if (bni) bni.classList.add('on');
}

/* ── Sidebar ─────────────────────────────────────────── */
function _sbOpen()  { document.getElementById('sb').classList.add('open'); document.getElementById('sbOv').classList.add('on'); }
function _sbClose() { document.getElementById('sb').classList.remove('open'); document.getElementById('sbOv').classList.remove('on'); }

/* ── View Router ─────────────────────────────────────── */
function _lv(v) {
  _V = v;
  _setActive(v);
  _fabCb = null;
  document.getElementById('fab').classList.remove('on');
  var title = _viewTitle(v);
  document.getElementById('tbTitle').textContent = title;

  var role = _U ? _U.role : 'viewer';
  switch(v) {
    case 'home':     _vHome(); break;
    case 'jobs':     _vJobs(); break;
    case 'history':  _vHistory(); break;
    case 'parties':  _vParties(); break;
    case 'stock':    _vStock(); break;
    case 'invoices': _vInvoices(); break;
    case 'payments': _vPayments(); break;
    case 'expenses': _vExpenses(); break;
    case 'machines': _vMachines(); break;
    case 'qc':       _vQC(); break;
    case 'downtime': _vDowntime(); break;
    case 'dispatch': _vDispatch(); break;
    case 'reports':  _vReports(); break;
    case 'staff':    _vStaff(); break;
    default:         _vHome();
  }
}

function _viewTitle(v) {
  var role = _U ? _U.role : '';
  var titles = {
    home:     role === 'operator' ? 'My Jobs' : role === 'cutting' ? 'Cut Queue' : role === 'viewer' ? 'Summary' : 'Dashboard',
    jobs:     'All Jobs',
    history:  'History',
    parties:  'Parties',
    stock:    'Stock Register',
    invoices: 'Invoices',
    payments: 'Payments',
    expenses: 'Expenses',
    machines: 'Machines',
    qc:       'Quality Control',
    downtime: 'Downtime Log',
    dispatch: 'Dispatch',
    reports:  'Reports',
    staff:    'Staff',
  };
  return titles[v] || v;
}

/* ── Refresh ─────────────────────────────────────────── */
function _refresh() {
  _toast('🔄 Refreshing...');
  _api('getAllData', {}, function(r) {
    _D = r.data || {};
    _lv(_V);
    _toast('✅ Updated');
  }, function() {
    _toast('⚠️ Refresh failed');
  });
}

/* ── Skeleton ────────────────────────────────────────── */
function _showSkeleton() {
  var c = document.getElementById('content');
  c.innerHTML = '<div class="kpi-row">'
    + '<div class="kpi"><div class="sk skh" style="width:60px"></div><div class="sk skh" style="width:40px;height:28px"></div><div class="sk skh" style="width:80px"></div></div>'.repeat(4)
    + '</div>'
    + '<div class="sk" style="height:120px;margin-bottom:14px"></div>'
    + '<div class="sk" style="height:120px;margin-bottom:14px"></div>';
}

/* ═══════════════════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════════════════ */

/* ── HOME / DASHBOARD ────────────────────────────────── */
function _vHome() {
  var c    = document.getElementById('content');
  var role = _U.role;
  var jobs = _D.jobs || [];

  if (role === 'operator') { _vOperatorHome(); return; }
  if (role === 'cutting')  { _vCuttingHome(); return; }
  if (role === 'viewer')   { _vViewerHome(); return; }

  // Admin / Supervisor dashboard
  var today     = _today();
  var todayJobs = jobs.filter(function(j){ return (j['Entry Date']||'').slice(0,10) === today; });
  var pending   = jobs.filter(function(j){ return j['Job Status'] === 'Pending'; });
  var inprog    = jobs.filter(function(j){ return j['Job Status'] === 'In Progress'; });
  var delayed   = jobs.filter(function(j){ return j['Delay Flag'] === 'DELAYED' && j['Job Status'] !== 'Complete'; });
  var dispatchPend = jobs.filter(function(j){ return j['Dispatch Status'] === 'Pending' && j['Print Status'] === 'Done'; });

  var html = '';

  // Alert if delayed
  if (delayed.length) {
    html += '<div class="alert-strip danger"><i class="fa-solid fa-circle-exclamation"></i>'
         + delayed.length + ' job(s) DELAYED!</div>';
  }

  // KPIs
  html += '<div class="kpi-row">'
       + _kpi('Today', todayJobs.length, 'fa-calendar-day', '--A', '--Al')
       + _kpi('Pending', pending.length, 'fa-hourglass-half', '--O', '--Ol')
       + _kpi('In Progress', inprog.length, 'fa-gears', '--V', '--Vl')
       + _kpi('Dispatch Due', dispatchPend.length, 'fa-truck', '--T', '--Tl')
       + '</div>';

  // Tiles
  if (role === 'admin') {
    html += '<div class="sec-head"><div class="sec-title">Quick Actions</div></div>';
    html += '<div class="home-grid">'
         + _tile('fa-plus','--A','--Al','New Job','Add production job','_mNewJob()')
         + _tile('fa-clipboard-list','--P','--Pl','All Jobs','View & manage','_lv(\'jobs\')')
         + _tile('fa-boxes-stacked','--G','--Gl','Stock In','Register paper inward','_mStockIn()')
         + _tile('fa-truck','--T','--Tl','Dispatch','Jobs ready to ship','_lv(\'dispatch\')')
         + _tile('fa-file-invoice','--V','--Vl','Invoice','Create bill','_lv(\'invoices\')')
         + _tile('fa-chart-bar','--O','--Ol','Reports','Analytics','_lv(\'reports\')')
         + '</div>';
    // FAB = new job
    _fabCb = _mNewJob;
    document.getElementById('fab').classList.add('on');
  } else {
    // Supervisor
    html += '<div class="sec-head"><div class="sec-title">Quick Actions</div></div>';
    html += '<div class="home-grid">'
         + _tile('fa-clipboard-list','--P','--Pl','All Jobs','View all production','_lv(\'jobs\')')
         + _tile('fa-truck','--T','--Tl','Dispatch','Ready to ship','_lv(\'dispatch\')')
         + _tile('fa-magnifying-glass-chart','--V','--Vl','QC Entry','Quality check','_lv(\'qc\')')
         + _tile('fa-triangle-exclamation','--R','--Rl','Log Downtime','Machine issue','_lv(\'downtime\')')
         + '</div>';
  }

  // Recent jobs
  var recent = jobs.slice(-5).reverse();
  if (recent.length) {
    html += '<div class="sec-head"><div class="sec-title">Recent Jobs</div></div>';
    recent.forEach(function(j) { html += _jobCard(j, false); });
  }

  c.innerHTML = html;
}

function _vOperatorHome() {
  var c    = document.getElementById('content');
  var myM  = _U.machine || '';
  var jobs = (_D.jobs || []).filter(function(j){
    return j['Machine Assigned'] === myM && j['Print Status'] !== 'Done';
  }).sort(function(a,b){ return (a['Priority']||5) - (b['Priority']||5); });

  var html = '';
  if (myM) {
    html += '<div class="alert-strip info"><i class="fa-solid fa-gears"></i>Machine: <b>' + myM + '</b></div>';
  }

  var kDone = (_D.jobs||[]).filter(function(j){ return j['Machine Assigned']===myM && j['Print Status']==='Done'; }).length;
  html += '<div class="kpi-row">'
       + _kpi('My Jobs', jobs.length, 'fa-list-check', '--A', '--Al')
       + _kpi('Done Today', kDone, 'fa-circle-check', '--G', '--Gl')
       + '</div>';

  html += '<div class="sec-head"><div class="sec-title">Jobs Queue</div></div>';
  if (!jobs.length) {
    html += '<div class="empty"><i class="fa-solid fa-circle-check"></i><p>No pending jobs on your machine!</p></div>';
  } else {
    jobs.forEach(function(j) { html += _jobCard(j, true); });
  }
  c.innerHTML = html;
}

function _vCuttingHome() {
  var c    = document.getElementById('content');
  var jobs = (_D.jobs || []).filter(function(j){
    return j['Cut Status'] !== 'Done';
  }).sort(function(a,b){ return (a['Priority']||5) - (b['Priority']||5); });

  var kDone = (_D.jobs||[]).filter(function(j){ return j['Cut Status']==='Done'; }).length;
  var html = '<div class="kpi-row">'
       + _kpi('Cut Queue', jobs.length, 'fa-scissors', '--O', '--Ol')
       + _kpi('Done Today', kDone, 'fa-circle-check', '--G', '--Gl')
       + '</div>';

  html += '<div class="sec-head"><div class="sec-title">Cutting Queue</div></div>';
  if (!jobs.length) {
    html += '<div class="empty"><i class="fa-solid fa-scissors"></i><p>No cutting jobs pending!</p></div>';
  } else {
    jobs.forEach(function(j) { html += _jobCard(j, true); });
  }
  c.innerHTML = html;
}

function _vViewerHome() {
  var c    = document.getElementById('content');
  var jobs = _D.jobs || [];
  var inv  = _D.invoices || [];
  var complete  = jobs.filter(function(j){ return j['Job Status']==='Complete'; });
  var billed    = inv.filter(function(j){ return j['Status']==='Pending' || j['Status']==='Overdue'; });
  var totalBill = billed.reduce(function(s,i){ return s + (_num(i['Net Payable'])); }, 0);

  var html = '<div class="kpi-row">'
       + _kpi('Total Jobs', jobs.length, 'fa-clipboard-list', '--A', '--Al')
       + _kpi('Complete', complete.length, 'fa-circle-check', '--G', '--Gl')
       + _kpi('Outstanding', '₹' + _fmt(totalBill), 'fa-indian-rupee-sign', '--R', '--Rl')
       + _kpi('Invoices', inv.length, 'fa-file-invoice', '--V', '--Vl')
       + '</div>';

  html += '<div class="sec-head"><div class="sec-title">Job Summary</div><div class="sec-title">View All →</div></div>';
  jobs.slice(-6).reverse().forEach(function(j) { html += _jobCard(j, false); });
  c.innerHTML = html;
}

/* ── JOBS VIEW ───────────────────────────────────────── */
function _vJobs() {
  var c    = document.getElementById('content');
  var jobs = (_D.jobs || []).slice();
  var role = _U.role;

  // Role filter
  if (role === 'operator') {
    var myM = _U.machine || '';
    jobs = jobs.filter(function(j){ return j['Machine Assigned'] === myM; });
  }

  if (role === 'admin') {
    _fabCb = _mNewJob;
    document.getElementById('fab').classList.add('on');
  }

  var statusOpts = ['all','Pending','In Progress','Done - Dispatch Pending','Complete'];

  var html = '<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i>'
           + '<input id="jobSearch" placeholder="Search job, party…" oninput="_jobSearchFn(this.value)" value="' + (_jobSearch||'') + '"></div>';

  html += '<div class="filter-row" id="filterRow">'
       + statusOpts.map(function(s){
           var active = _jobFilter === s ? ' on' : '';
           return '<div class="pill' + active + '" onclick="_jobFilterFn(\'' + s + '\')">' + (s==='all'?'All':s) + '</div>';
         }).join('')
       + '</div>';

  // Apply filters
  var filtered = jobs.filter(function(j){
    var matchStatus = _jobFilter === 'all' || j['Job Status'] === _jobFilter;
    var q = (_jobSearch||'').toLowerCase();
    var matchSearch = !q
      || (j['Job ID']||'').toLowerCase().includes(q)
      || (j['Job Name / Description']||'').toLowerCase().includes(q)
      || (j['Party Name']||'').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }).sort(function(a,b){ return (a['Priority']||5)-(b['Priority']||5); });

  html += '<div class="sec-head"><div class="sec-title">' + filtered.length + ' jobs</div></div>';

  if (!filtered.length) {
    html += '<div class="empty"><i class="fa-solid fa-clipboard-list"></i><p>No jobs match filter</p></div>';
  } else {
    filtered.forEach(function(j) { html += _jobCard(j, role !== 'viewer'); });
  }

  c.innerHTML = html;

  // Re-set search field
  setTimeout(function(){
    var s = document.getElementById('jobSearch');
    if (s && _jobSearch) s.value = _jobSearch;
  }, 50);
}

function _jobFilterFn(f) {
  _jobFilter = f;
  _vJobs();
}
function _jobSearchFn(v) {
  _jobSearch = v;
}

/* ── HISTORY VIEW ────────────────────────────────────── */
function _vHistory() {
  var c    = document.getElementById('content');
  var role = _U.role;
  var jobs = _D.jobs || [];

  if (role === 'operator') {
    var myM = _U.machine || '';
    jobs = jobs.filter(function(j){ return j['Machine Assigned']===myM && j['Print Status']==='Done'; });
  } else if (role === 'cutting') {
    jobs = jobs.filter(function(j){ return j['Cut Status']==='Done'; });
  }

  jobs = jobs.slice().reverse();
  var html = '<div class="sec-head"><div class="sec-title">' + jobs.length + ' completed</div></div>';
  if (!jobs.length) {
    html += '<div class="empty"><i class="fa-solid fa-clock-rotate-left"></i><p>No history yet</p></div>';
  } else {
    jobs.forEach(function(j) { html += _jobCard(j, false); });
  }
  c.innerHTML = html;
}

/* ── JOB CARD COMPONENT ──────────────────────────────── */
function _jobCard(j, showActions) {
  var id      = j['Job ID'] || '—';
  var name    = j['Job Name / Description'] || '—';
  var party   = j['Party Name'] || '—';
  var machine = j['Machine Assigned'] || '—';
  var priority= parseInt(j['Priority'] || 3);
  var cutSt   = j['Cut Status'] || 'Pending';
  var printSt = j['Print Status'] || 'Pending';
  var disSt   = j['Dispatch Status'] || 'Pending';
  var jobSt   = j['Job Status'] || 'Pending';
  var delayed = j['Delay Flag'] === 'DELAYED';
  var pDate   = j['Promised Date'] || '';

  var pClass = 'p' + Math.min(5, Math.max(1, priority));

  var html = '<div class="job-card ' + pClass + '" onclick="_mJobDetail(\'' + id + '\')">';
  html += '<div class="jc-top"><div>'
       + '<div class="jc-id">' + id + ' · P' + priority + (delayed ? ' · <span style="color:var(--R)">⚠ DELAYED</span>' : '') + '</div>'
       + '<div class="jc-name">' + _esc(name) + '</div>'
       + '<div class="jc-party"><i class="fa-solid fa-building" style="color:var(--tx3)"></i> ' + _esc(party) + '</div>'
       + '</div>'
       + '<div>' + _stBadge(jobSt) + '</div>'
       + '</div>';

  html += '<div class="jc-meta">'
       + '<span class="badge bx"><i class="fa-solid fa-gears"></i> ' + machine + '</span>'
       + '<span class="badge ' + _cutBadge(cutSt) + '">✂ ' + cutSt + '</span>'
       + '<span class="badge ' + _printBadge(printSt) + '">🖨 ' + printSt + '</span>';
  if (pDate) html += '<span class="badge bx"><i class="fa-regular fa-calendar"></i> ' + pDate + '</span>';
  html += '</div>';

  if (showActions) {
    var role = _U.role;
    html += '<div class="jc-actions">';
    // Cut complete button (for cutting role or admin/supervisor)
    if ((role === 'cutting' || role === 'admin' || role === 'supervisor') && cutSt !== 'Done') {
      html += '<button class="btn btn-sm btnO" onclick="event.stopPropagation();_mCutUpdate(\'' + id + '\')">'
           + '<i class="fa-solid fa-scissors"></i> Cut</button>';
    }
    // Print complete (for operator or admin/supervisor, only if cut is done)
    if ((role === 'operator' || role === 'admin' || role === 'supervisor') && cutSt === 'Done' && printSt !== 'Done') {
      html += '<button class="btn btn-sm btnG" onclick="event.stopPropagation();_mPrintUpdate(\'' + id + '\')">'
           + '<i class="fa-solid fa-print"></i> Print</button>';
    }
    // Dispatch (supervisor/admin)
    if ((role === 'admin' || role === 'supervisor') && printSt === 'Done' && disSt === 'Pending') {
      html += '<button class="btn btn-sm btnT" onclick="event.stopPropagation();_mDispatch(\'' + id + '\')">'
           + '<i class="fa-solid fa-truck"></i> Dispatch</button>';
    }
    // Generate invoice (admin only)
    if (role === 'admin' && disSt === 'Done' && !(j['Billed (Y/N)'])) {
      html += '<button class="btn btn-sm btnP" onclick="event.stopPropagation();_mInvoice(\'' + id + '\')">'
           + '<i class="fa-solid fa-file-invoice"></i> Invoice</button>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function _cutBadge(s)   { return s==='Done'?'bg':s==='In Progress'?'bb':'bx'; }
function _printBadge(s) { return s==='Done'?'bg':s==='In Progress'?'bv':'bx'; }
function _stBadge(s) {
  var m = { 'Pending':'bx', 'In Progress':'bb', 'Done - Dispatch Pending':'bt', 'Complete':'bg' };
  return '<span class="badge ' + (m[s]||'bx') + '">' + (s||'—') + '</span>';
}

/* ── PARTIES VIEW ────────────────────────────────────── */
function _vParties() {
  var c       = document.getElementById('content');
  var parties = _D.parties || [];
  var role    = _U.role;

  if (role === 'admin') {
    _fabCb = _mNewParty;
    document.getElementById('fab').classList.add('on');
  }

  var html = '<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i>'
           + '<input id="partySearch" placeholder="Search party…" oninput="_renderParties(this.value)"></div>';
  html += '<div id="partyList"></div>';
  c.innerHTML = html;

  function _renderParties(q) {
    q = (q||'').toLowerCase();
    var filtered = parties.filter(function(p){
      return !q || (p['Party Name']||'').toLowerCase().includes(q) || (p['Party ID']||'').toLowerCase().includes(q);
    });
    var out = '';
    if (!filtered.length) {
      out = '<div class="empty"><i class="fa-solid fa-users"></i><p>No parties found</p></div>';
    } else {
      filtered.forEach(function(p) {
        var st = p['Status'] || 'Active';
        out += '<div class="card" onclick="_mPartyDetail(\'' + (p['Party ID']||'') + '\')">'
             + '<div class="card-head">'
             + '<div class="card-title"><i class="fa-solid fa-building"></i>' + _esc(p['Party Name']||'—') + '</div>'
             + '<span class="badge ' + (st==='Active'?'bg':st==='Blacklisted'?'br':'bx') + '">' + st + '</span>'
             + '</div>'
             + '<div class="card-body">'
             + '<div class="info-row"><span class="ir-lbl">Contact</span><span class="ir-val">' + _esc(p['Contact Person 1']||'—') + '</span></div>'
             + '<div class="info-row"><span class="ir-lbl">Mobile</span><span class="ir-val">' + (p['Mobile 1']||'—') + '</span></div>'
             + '<div class="info-row"><span class="ir-lbl">Outstanding</span><span class="ir-val" style="color:var(--R)">₹' + _fmt(_num(p['Outstanding Balance (Rs)'])) + '</span></div>'
             + (p['WhatsApp 1'] ? '<button class="wa-btn btn-sm" style="margin-top:8px" onclick="event.stopPropagation();_waParty(\'' + (p['WhatsApp 1']||'') + '\',\'' + _esc(p['Contact Person 1']||'') + '\')">'
               + '<i class="fa-brands fa-whatsapp"></i> WhatsApp</button>' : '')
             + '</div></div>';
      });
    }
    document.getElementById('partyList').innerHTML = out;
  }

  _renderParties('');
  window._renderParties = _renderParties;
}

/* ── STOCK VIEW ──────────────────────────────────────── */
function _vStock() {
  var c     = document.getElementById('content');
  var stock = (_D.stock || []).filter(function(s){ return s['Status'] !== 'Used'; });

  if (_U.role === 'admin' || _U.role === 'supervisor') {
    _fabCb = _mStockIn;
    document.getElementById('fab').classList.add('on');
  }

  var html = '<div class="sec-head"><div class="sec-title">' + stock.length + ' active lots</div></div>';

  if (!stock.length) {
    html += '<div class="empty"><i class="fa-solid fa-boxes-stacked"></i><p>No stock entries</p></div>';
  } else {
    stock.sort(function(a,b){ return _num(b['Usage %'])-_num(a['Usage %']); });
    stock.forEach(function(s) {
      var pct  = _num(s['Usage %']);
      var rem  = _num(s['Remaining Gross']);
      var good = _num(s['Good Gross']);
      var st   = s['Status'] || 'Available';
      var barColor = pct >= 80 ? 'var(--R)' : pct >= 50 ? 'var(--O)' : 'var(--G)';

      html += '<div class="card">'
           + '<div class="card-head">'
           + '<div class="card-title"><i class="fa-solid fa-layer-group"></i>' + _esc(s['Stock ID']||'—') + ' — ' + _esc(s['Paper Type']||'—') + '</div>'
           + '<span class="badge ' + (st==='Available'?'bg':st==='Partial'?'bo':'bx') + '">' + st + '</span>'
           + '</div>'
           + '<div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(s['Party Name']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Size / GSM</span><span class="ir-val">' + (s['Sheet Size (inches)']||'—') + ' / ' + (s['GSM (Weight)']||'—') + ' GSM</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Remaining</span><span class="ir-val" style="font-weight:800">' + rem + ' / ' + good + ' gross</span></div>'
           + '<div style="background:var(--bdr);border-radius:4px;height:6px;margin-top:8px;overflow:hidden">'
           + '<div style="background:' + barColor + ';height:100%;width:' + Math.min(pct,100) + '%;border-radius:4px;transition:width .4s"></div></div>'
           + '<div style="font-size:11px;color:var(--tx3);margin-top:4px;text-align:right">' + pct.toFixed(1) + '% used</div>'
           + (pct >= 80 ? '<div class="alert-strip warn" style="margin-top:8px;margin-bottom:0"><i class="fa-solid fa-triangle-exclamation"></i>Low stock — reorder!</div>' : '')
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── INVOICES VIEW ───────────────────────────────────── */
function _vInvoices() {
  var c    = document.getElementById('content');
  var invs = (_D.invoices || []).slice().reverse();
  var role = _U.role;

  var html = '';
  var totalPend = invs.filter(function(i){ return i['Status']==='Pending'||i['Status']==='Overdue'; })
                      .reduce(function(s,i){ return s+_num(i['Net Payable']); }, 0);

  html += '<div class="kpi-row">'
       + _kpi('Total', invs.length, 'fa-file-invoice', '--A', '--Al')
       + _kpi('Outstanding', '₹'+_fmt(totalPend), 'fa-indian-rupee-sign', '--R', '--Rl')
       + '</div>';

  if (!invs.length) {
    html += '<div class="empty"><i class="fa-solid fa-file-invoice"></i><p>No invoices yet</p></div>';
  } else {
    invs.forEach(function(inv) {
      var st = inv['Status'] || 'Pending';
      var stC = st==='Paid'?'bg':st==='Overdue'?'br':st==='Partial'?'bo':'bb';
      html += '<div class="card">'
           + '<div class="card-head">'
           + '<div class="card-title"><i class="fa-solid fa-file-invoice"></i>' + (inv['Invoice No.']||'—') + '</div>'
           + '<span class="badge ' + stC + '">' + st + '</span>'
           + '</div>'
           + '<div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(inv['Party Name']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Date</span><span class="ir-val">' + (inv['Invoice Date']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Final Amount</span><span class="ir-val" style="font-weight:800;font-size:16px">₹' + _fmt(_num(inv['Final Amount'])) + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Net Payable</span><span class="ir-val">₹' + _fmt(_num(inv['Net Payable'])) + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Due Date</span><span class="ir-val">' + (inv['Due Date']||'—') + '</span></div>';

      if (role === 'admin' && st !== 'Paid') {
        var wa = _D.parties ? (_D.parties.find(function(p){ return p['Party ID']===inv['Party ID']; })||{})['WhatsApp 1'] : '';
        var cn = _D.parties ? (_D.parties.find(function(p){ return p['Party ID']===inv['Party ID']; })||{})['Contact Person 1'] : '';
        html += '<div style="display:flex;gap:8px;margin-top:10px">'
             + '<button class="btn btn-sm btnG" onclick="_mRecordPayment(\'' + (inv['Invoice No.']||'') + '\')"><i class="fa-solid fa-indian-rupee-sign"></i> Record Payment</button>';
        if (wa) {
          html += '<button class="wa-btn btn-sm" onclick="_waPaymentReminder(\'' + wa + '\',\'' + (inv['Invoice No.']||'') + '\',\'' + _fmt(_num(inv['Net Payable'])) + '\',\'' + (inv['Due Date']||'') + '\',\'' + _esc(cn||'') + '\')">'
               + '<i class="fa-brands fa-whatsapp"></i></button>';
        }
        html += '</div>';
      }

      html += '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── PAYMENTS VIEW ───────────────────────────────────── */
function _vPayments() {
  var c    = document.getElementById('content');
  var pays = (_D.payments || []).slice().reverse();

  var total = pays.reduce(function(s,p){ return s+_num(p['Amount Received (Rs)']); }, 0);

  var html = '<div class="kpi-row">'
           + _kpi('Payments', pays.length, 'fa-indian-rupee-sign', '--G', '--Gl')
           + _kpi('Total Received', '₹'+_fmt(total), 'fa-money-bill-wave', '--A', '--Al')
           + '</div>';

  if (!pays.length) {
    html += '<div class="empty"><i class="fa-solid fa-indian-rupee-sign"></i><p>No payments recorded</p></div>';
  } else {
    pays.forEach(function(p) {
      html += '<div class="card"><div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Payment ID</span><span class="ir-val">' + (p['Payment ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Date</span><span class="ir-val">' + (p['Payment Date']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(p['Party Name']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Invoice</span><span class="ir-val">' + (p['Invoice No.']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Amount</span><span class="ir-val" style="color:var(--G);font-weight:800;font-size:16px">₹' + _fmt(_num(p['Amount Received (Rs)'])) + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Mode</span><span class="ir-val"><span class="badge bx">' + (p['Payment Mode']||'—') + '</span></span></div>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── EXPENSES VIEW ───────────────────────────────────── */
function _vExpenses() {
  var c    = document.getElementById('content');
  var exps = (_D.expenses || []).slice().reverse();

  var total = exps.reduce(function(s,e){ return s+_num(e['Total (Rs)']); }, 0);

  if (_U.role === 'admin' || _U.role === 'supervisor') {
    _fabCb = _mNewExpense;
    document.getElementById('fab').classList.add('on');
  }

  var html = '<div class="kpi-row">'
           + _kpi('Expenses', exps.length, 'fa-receipt', '--O', '--Ol')
           + _kpi('Total Spend', '₹'+_fmt(total), 'fa-money-bill', '--R', '--Rl')
           + '</div>';

  if (!exps.length) {
    html += '<div class="empty"><i class="fa-solid fa-receipt"></i><p>No expenses recorded</p></div>';
  } else {
    exps.forEach(function(e) {
      html += '<div class="card"><div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Date</span><span class="ir-val">' + (e['Date']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Category</span><span class="ir-val"><span class="badge bam">' + (e['Category']||'—') + '</span></span></div>'
           + '<div class="info-row"><span class="ir-lbl">Description</span><span class="ir-val">' + _esc(e['Item Description']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Total</span><span class="ir-val" style="color:var(--R);font-weight:800">₹' + _fmt(_num(e['Total (Rs)'])) + '</span></div>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── MACHINES VIEW ───────────────────────────────────── */
function _vMachines() {
  var c    = document.getElementById('content');
  var mach = _D.machines || [];
  var jobs = _D.jobs || [];

  var html = '';
  if (!mach.length) {
    html = '<div class="empty"><i class="fa-solid fa-gears"></i><p>No machines configured</p></div>';
  } else {
    mach.forEach(function(m) {
      var id   = m['Machine ID'] || '—';
      var name = m['Machine Name'] || '—';
      var st   = m['Current Status'] || 'Active';
      var activeJobs = jobs.filter(function(j){ return j['Machine Assigned']===name && j['Print Status']==='In Progress'; });
      var nextMaint  = m['Next Maintenance Due'] || '';
      var maintDue   = nextMaint && nextMaint <= _today();

      html += '<div class="card">'
           + '<div class="card-head">'
           + '<div class="card-title"><i class="fa-solid fa-gears"></i>' + _esc(name) + '</div>'
           + '<span class="badge ' + (st==='Active'?'bg':st==='On Repair'?'br':'bx') + '">' + st + '</span>'
           + '</div>'
           + '<div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Machine ID</span><span class="ir-val">' + id + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Operator</span><span class="ir-val">' + _esc(m['Assigned Operator']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Active Jobs</span><span class="ir-val"><span class="badge ' + (activeJobs.length?'bb':'bx') + '">' + activeJobs.length + ' in progress</span></span></div>'
           + '<div class="info-row"><span class="ir-lbl">Next Maint.</span><span class="ir-val ' + (maintDue?'style="color:var(--R)"':'' ) + '">' + (nextMaint||'—') + '</span></div>'
           + (maintDue ? '<div class="alert-strip warn" style="margin-top:8px;margin-bottom:0"><i class="fa-solid fa-wrench"></i>Maintenance due! Schedule now.</div>' : '')
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── QC VIEW ─────────────────────────────────────────── */
function _vQC() {
  var c   = document.getElementById('content');
  var qcs = (_D.qc || []).slice().reverse();
  var role = _U.role;

  if (role === 'admin' || role === 'supervisor') {
    _fabCb = _mNewQC;
    document.getElementById('fab').classList.add('on');
  }

  var html = '<div class="sec-head"><div class="sec-title">' + qcs.length + ' QC entries</div></div>';

  if (!qcs.length) {
    html += '<div class="empty"><i class="fa-solid fa-magnifying-glass-chart"></i><p>No QC entries yet</p></div>';
  } else {
    qcs.forEach(function(q) {
      var pf = q['Pass/Fail'] || 'Pending';
      html += '<div class="card"><div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">QC ID</span><span class="ir-val">' + (q['QC ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Job</span><span class="ir-val">' + _esc(q['Job Name']||q['Job ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Stage</span><span class="ir-val"><span class="badge bx">' + (q['QC Stage']||'—') + '</span></span></div>'
           + '<div class="info-row"><span class="ir-lbl">Result</span><span class="ir-val"><span class="badge ' + (pf==='Pass'?'bg':pf==='Fail'?'br':'bo') + '">' + pf + '</span></span></div>'
           + '<div class="info-row"><span class="ir-lbl">Score</span><span class="ir-val">' + (q['Overall Score']||'—') + '/5</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Date</span><span class="ir-val">' + (q['Date']||'—') + '</span></div>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── DOWNTIME VIEW ───────────────────────────────────── */
function _vDowntime() {
  var c   = document.getElementById('content');
  var dts = (_D.downtime || []).slice().reverse();

  _fabCb = _mNewDowntime;
  document.getElementById('fab').classList.add('on');

  var html = '<div class="sec-head"><div class="sec-title">' + dts.length + ' downtime logs</div></div>';

  if (!dts.length) {
    html += '<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i><p>No downtime recorded</p></div>';
  } else {
    dts.forEach(function(d) {
      html += '<div class="card"><div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Machine</span><span class="ir-val">' + _esc(d['Machine Name']||d['Machine ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Date</span><span class="ir-val">' + (d['Date']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Reason</span><span class="ir-val"><span class="badge br">' + _esc(d['Reason Category']||'—') + '</span></span></div>'
           + '<div class="info-row"><span class="ir-lbl">Duration</span><span class="ir-val">' + (d['Duration (Hours)']||d['End Time']?d['Duration (Hours)']:'Running...') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Description</span><span class="ir-val">' + _esc(d['Reason Description']||'—') + '</span></div>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── DISPATCH VIEW ───────────────────────────────────── */
function _vDispatch() {
  var c    = document.getElementById('content');
  var jobs = (_D.jobs || []).filter(function(j){
    return j['Print Status'] === 'Done' && j['QC Pass/Fail'] === 'Pass' && j['Dispatch Status'] === 'Pending';
  });

  var html = '<div class="alert-strip info"><i class="fa-solid fa-truck"></i>' + jobs.length + ' job(s) ready to dispatch</div>';

  if (!jobs.length) {
    html += '<div class="empty"><i class="fa-solid fa-truck"></i><p>No jobs pending dispatch</p></div>';
  } else {
    jobs.forEach(function(j) {
      html += '<div class="card">'
           + '<div class="card-head">'
           + '<div class="card-title">' + _esc(j['Job Name / Description']||'—') + '</div>'
           + '<span class="badge bt">Dispatch Ready</span>'
           + '</div>'
           + '<div class="card-body">'
           + '<div class="info-row"><span class="ir-lbl">Job ID</span><span class="ir-val">' + (j['Job ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(j['Party Name']||'—') + '</span></div>'
           + '<button class="btn btnT btn-full" style="margin-top:10px" onclick="_mDispatch(\'' + (j['Job ID']||'') + '\')">'
           + '<i class="fa-solid fa-truck"></i> Mark Dispatched</button>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ── REPORTS VIEW ────────────────────────────────────── */
function _vReports() {
  var c    = document.getElementById('content');
  var jobs = _D.jobs || [];
  var invs = _D.invoices || [];
  var exps = _D.expenses || [];

  var complete = jobs.filter(function(j){ return j['Job Status']==='Complete'; });
  var totalBill = invs.reduce(function(s,i){ return s+_num(i['Final Amount']); }, 0);
  var totalExp  = exps.reduce(function(s,e){ return s+_num(e['Total (Rs)']); }, 0);
  var paid      = invs.filter(function(i){ return i['Status']==='Paid'; }).reduce(function(s,i){ return s+_num(i['Final Amount']); }, 0);
  var outstanding = totalBill - paid;

  var html = '<div class="kpi-row">'
           + _kpi('Total Jobs', jobs.length, 'fa-clipboard-list', '--A', '--Al')
           + _kpi('Complete', complete.length, 'fa-circle-check', '--G', '--Gl')
           + _kpi('Revenue', '₹'+_fmt(totalBill), 'fa-indian-rupee-sign', '--V', '--Vl')
           + _kpi('Outstanding', '₹'+_fmt(outstanding), 'fa-hourglass-half', '--R', '--Rl')
           + '</div>';

  // Jobs by machine
  var machines = ['Machine 1','Machine 2','Machine 3'];
  html += '<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-gears"></i>Jobs by Machine</div></div><div class="card-body">';
  machines.forEach(function(m) {
    var cnt = jobs.filter(function(j){ return j['Machine Assigned']===m; }).length;
    var pct = jobs.length ? (cnt/jobs.length*100).toFixed(0) : 0;
    html += '<div style="margin-bottom:12px">'
         + '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:600">' + m + '</span><span style="font-size:12px;color:var(--tx2)">' + cnt + ' jobs</span></div>'
         + '<div style="background:var(--bdr);border-radius:4px;height:8px;overflow:hidden"><div style="background:var(--A);height:100%;width:' + pct + '%;border-radius:4px"></div></div></div>';
  });
  html += '</div></div>';

  // Expense breakdown
  var expBycat = {};
  exps.forEach(function(e) { var c2 = e['Category']||'Other'; expBycat[c2] = (expBycat[c2]||0)+_num(e['Total (Rs)']); });
  html += '<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-receipt"></i>Expenses: ₹' + _fmt(totalExp) + '</div></div><div class="card-body">';
  Object.keys(expBycat).sort(function(a,b){ return expBycat[b]-expBycat[a]; }).forEach(function(k) {
    var pct = totalExp ? (expBycat[k]/totalExp*100).toFixed(0) : 0;
    html += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:12px;font-weight:600">' + k + '</span><span style="font-size:12px;color:var(--tx2)">₹' + _fmt(expBycat[k]) + '</span></div>'
         + '<div style="background:var(--bdr);border-radius:4px;height:6px;overflow:hidden"><div style="background:var(--O);height:100%;width:' + pct + '%;border-radius:4px"></div></div></div>';
  });
  if (!Object.keys(expBycat).length) html += '<p style="color:var(--tx3);font-size:13px">No expense data</p>';
  html += '</div></div>';

  c.innerHTML = html;
}

/* ── STAFF VIEW ──────────────────────────────────────── */
function _vStaff() {
  var c     = document.getElementById('content');
  var users = _D.users || [];

  var html = '<div class="sec-head"><div class="sec-title">' + users.length + ' staff members</div></div>';

  if (!users.length) {
    html += '<div class="empty"><i class="fa-solid fa-id-badge"></i><p>No staff data</p></div>';
  } else {
    users.forEach(function(u) {
      var role = (u['Role']||'').toLowerCase();
      var rColors = { admin:'--R', supervisor:'--V', operator:'--A', cutting:'--O', viewer:'--T' };
      var rc = rColors[role] || '--tx3';
      html += '<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:14px">'
           + '<div style="width:44px;height:44px;border-radius:50%;background:var(' + rc + ');color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0">'
           + (u['Full Name']||'?')[0].toUpperCase() + '</div>'
           + '<div style="flex:1">'
           + '<div style="font-size:14px;font-weight:700;color:var(--tx)">' + _esc(u['Full Name']||'—') + '</div>'
           + '<div style="font-size:12px;color:var(--tx2)">' + _rlabel(role) + (u['Machine Assigned'] ? ' · ' + u['Machine Assigned'] : '') + '</div>'
           + '<div style="font-size:11px;color:var(--tx3);margin-top:2px">' + (u['Personal Email']||'—') + '</div>'
           + '</div>'
           + '<span class="badge ' + (u['Active (Y/N)']?'bg':'br') + '">' + (u['Active (Y/N)']?'Active':'Inactive') + '</span>'
           + '</div></div>';
    });
  }
  c.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════
   MODALS — Job Detail, Actions, Forms
═══════════════════════════════════════════════════════ */

/* ── Job Detail ──────────────────────────────────────── */
function _mJobDetail(jobId) {
  var j = (_D.jobs || []).find(function(x){ return x['Job ID'] === jobId; });
  if (!j) { _toast('Job not found'); return; }

  var role = _U.role;
  var cutSt   = j['Cut Status'] || 'Pending';
  var printSt = j['Print Status'] || 'Pending';
  var disSt   = j['Dispatch Status'] || 'Pending';
  var jobSt   = j['Job Status'] || 'Pending';

  // Step bar
  var steps = [
    { l:'Cut',      done: cutSt==='Done',       active: cutSt==='In Progress' },
    { l:'Print',    done: printSt==='Done',      active: printSt==='In Progress' },
    { l:'QC',       done: j['QC Pass/Fail']==='Pass', active: j['QC Done (Y/N)'] && j['QC Pass/Fail']!=='Pass' },
    { l:'Dispatch', done: disSt==='Done',        active: false },
    { l:'Invoice',  done: j['Billed (Y/N)'],     active: false },
  ];

  var stepHtml = '<div class="step-bar">';
  steps.forEach(function(s, i) {
    var cls = s.done ? 'done' : s.active ? 'active' : 'wait';
    stepHtml += '<div class="step"><div style="display:flex;flex-direction:column;align-items:center">'
             + '<div class="step-dot ' + cls + '">' + (s.done ? '<i class="fa-solid fa-check"></i>' : (i+1)) + '</div>'
             + '<div class="step-lbl">' + s.l + '</div></div>'
             + (i < steps.length-1 ? '<div class="step-line' + (s.done?' done':'') + '"></div>' : '')
             + '</div>';
  });
  stepHtml += '</div>';

  var body = stepHtml
    + '<div class="info-row"><span class="ir-lbl">Job ID</span><span class="ir-val">' + (j['Job ID']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(j['Party Name']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Category</span><span class="ir-val">' + (j['Job Category']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Qty</span><span class="ir-val">' + (j['Execute Qty']||'—') + ' / ' + (j['Order Qty']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Paper</span><span class="ir-val">' + (j['Paper Type']||'—') + ' ' + (j['Sheet Size']||'') + ' ' + (j['GSM']||'')+'GSM' + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Machine</span><span class="ir-val">' + (j['Machine Assigned']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Colors</span><span class="ir-val">' + (j['No. of Colors']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Priority</span><span class="ir-val">P' + (j['Priority']||3) + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Promised Date</span><span class="ir-val">' + (j['Promised Date']||'—') + '</span></div>'
    + '<div class="info-row"><span class="ir-lbl">Status</span><span class="ir-val">' + _stBadge(jobSt) + (j['Delay Flag']==='DELAYED'?' <span class="badge br">DELAYED</span>':'') + '</span></div>';

  if (j['Supervisor Notes']) {
    body += '<div class="alert-strip info" style="margin-top:10px"><i class="fa-solid fa-note-sticky"></i>' + _esc(j['Supervisor Notes']) + '</div>';
  }

  // Action buttons in footer
  var foot = '';
  if ((role==='cutting'||role==='admin'||role==='supervisor') && cutSt!=='Done') {
    foot += '<button class="btn btnO" onclick="_mClose();_mCutUpdate(\'' + jobId + '\')">'
          + '<i class="fa-solid fa-scissors"></i> Update Cut</button>';
  }
  if ((role==='operator'||role==='admin'||role==='supervisor') && cutSt==='Done' && printSt!=='Done') {
    foot += '<button class="btn btnG" onclick="_mClose();_mPrintUpdate(\'' + jobId + '\')">'
          + '<i class="fa-solid fa-print"></i> Update Print</button>';
  }
  if ((role==='admin'||role==='supervisor') && printSt==='Done' && j['QC Pass/Fail']!=='Pass') {
    foot += '<button class="btn btnA" onclick="_mClose();_mNewQCForJob(\'' + jobId + '\')">'
          + '<i class="fa-solid fa-magnifying-glass-chart"></i> QC Entry</button>';
  }
  if ((role==='admin'||role==='supervisor') && printSt==='Done' && j['QC Pass/Fail']==='Pass' && disSt==='Pending') {
    foot += '<button class="btn btnT" onclick="_mClose();_mDispatch(\'' + jobId + '\')">'
          + '<i class="fa-solid fa-truck"></i> Dispatch</button>';
  }
  if (role==='admin' && disSt==='Done' && !j['Billed (Y/N)']) {
    foot += '<button class="btn btnP" onclick="_mClose();_mInvoice(\'' + jobId + '\')">'
          + '<i class="fa-solid fa-file-invoice"></i> Invoice</button>';
  }
  // WhatsApp dispatch alert
  var party = (_D.parties||[]).find(function(p){ return p['Party ID']===j['Party ID']; }) || {};
  if (party['WhatsApp 1'] && disSt==='Done') {
    foot += '<button class="wa-btn" onclick="_waDispatch(\'' + (party['WhatsApp 1']||'') + '\',\'' + _esc(party['Contact Person 1']||'') + '\',\'' + _esc(j['Job Name / Description']||'') + '\',\'' + jobId + '\',\'' + (j['Dispatch Date']||'') + '\',\'' + (j['Vehicle No.']||'') + '\',\'' + (j['LR Number']||'') + '\')">'
          + '<i class="fa-brands fa-whatsapp"></i></button>';
  }

  _mOpen(j['Job Name / Description'] || jobId, body, foot);
}

/* ── Cut Update Modal ────────────────────────────────── */
function _mCutUpdate(jobId) {
  var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
  if (!j) return;
  var body = '<div class="alert-strip info"><i class="fa-solid fa-scissors"></i>Updating: <b>' + _esc(j['Job Name / Description']||jobId) + '</b></div>'
           + '<div class="fg"><label>Cut Status</label><select id="cutSt">'
           + ['Pending','In Progress','Done'].map(function(s){ return '<option value="' + s + '"' + (j['Cut Status']===s?' selected':'') + '>' + s + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Start Time</label><input type="datetime-local" id="cutStart" value="' + (j['Cut Start Time']||'') + '"></div>'
           + '<div class="fg"><label>End Time</label><input type="datetime-local" id="cutEnd" value="' + (j['Cut End Time']||'') + '"></div>'
           + '</div>'
           + '<div class="fg"><label>Qty Cut</label><input type="number" id="cutQty" placeholder="e.g. 500" value="' + (j['Cut Qty']||'') + '"></div>'
           + '<div class="fg"><label>Remark</label><textarea id="cutRmk">' + _esc(j['Cut Remark']||'') + '</textarea></div>';
  var foot = '<button class="btn btnO btn-full" onclick="_saveCut(\'' + jobId + '\')">'
           + '<i class="fa-solid fa-check"></i> Save Cut Update</button>';
  _mOpen('✂️ Cut Update — ' + jobId, body, foot);
}

function _saveCut(jobId) {
  var data = {
    jobId: jobId,
    cutStatus: document.getElementById('cutSt').value,
    cutStart:  document.getElementById('cutStart').value,
    cutEnd:    document.getElementById('cutEnd').value,
    cutQty:    document.getElementById('cutQty').value,
    cutRemark: document.getElementById('cutRmk').value,
    token: _TOKEN
  };
  _mLoading();
  _api('updateCut', data, function(r) {
    if (r.success) {
      // Update local cache
      var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
      if (j) {
        j['Cut Status'] = data.cutStatus;
        j['Cut Start Time'] = data.cutStart;
        j['Cut End Time'] = data.cutEnd;
        j['Cut Qty'] = data.cutQty;
        j['Cut Remark'] = data.cutRemark;
      }
      _mClose(); _toast('✅ Cut updated!'); _lv(_V);
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Print Update Modal ──────────────────────────────── */
function _mPrintUpdate(jobId) {
  var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
  if (!j) return;
  var body = '<div class="alert-strip ok"><i class="fa-solid fa-scissors fa-check"></i>Cut Done ✓ — Proceed to print</div>'
           + '<div class="fg"><label>Print Status</label><select id="printSt">'
           + ['Pending','In Progress','Done'].map(function(s){ return '<option value="' + s + '"' + (j['Print Status']===s?' selected':'') + '>' + s + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Start Time</label><input type="datetime-local" id="printStart" value="' + (j['Print Start Time']||'') + '"></div>'
           + '<div class="fg"><label>End Time</label><input type="datetime-local" id="printEnd" value="' + (j['Print End Time']||'') + '"></div>'
           + '</div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Impressions Run</label><input type="number" id="impRun" value="' + (j['Impressions Run']||'') + '"></div>'
           + '<div class="fg"><label>Good Impressions</label><input type="number" id="impGood" value="' + (j['Good Impressions']||'') + '"></div>'
           + '</div>'
           + '<div class="fg"><label>Rejection Count</label><input type="number" id="impRej" placeholder="0" value="' + (j['Rejection Impressions']||0) + '"></div>'
           + '<div class="fg"><label>Print Remark</label><textarea id="printRmk">' + _esc(j['Print Remark']||'') + '</textarea></div>';
  var foot = '<button class="btn btnG btn-full" onclick="_savePrint(\'' + jobId + '\')">'
           + '<i class="fa-solid fa-print"></i> Save Print Update</button>';
  _mOpen('🖨️ Print Update — ' + jobId, body, foot);
}

function _savePrint(jobId) {
  var data = {
    jobId: jobId,
    printStatus: document.getElementById('printSt').value,
    printStart:  document.getElementById('printStart').value,
    printEnd:    document.getElementById('printEnd').value,
    impressions: document.getElementById('impRun').value,
    goodImp:     document.getElementById('impGood').value,
    rejectImp:   document.getElementById('impRej').value,
    printRemark: document.getElementById('printRmk').value,
  };
  _mLoading();
  _api('updatePrint', data, function(r) {
    if (r.success) {
      var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
      if (j) {
        j['Print Status'] = data.printStatus;
        j['Print Start Time'] = data.printStart;
        j['Print End Time'] = data.printEnd;
        j['Impressions Run'] = data.impressions;
        j['Good Impressions'] = data.goodImp;
        j['Rejection Impressions'] = data.rejectImp;
        j['Print Remark'] = data.printRemark;
      }
      _mClose(); _toast('✅ Print updated!'); _lv(_V);
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Dispatch Modal ──────────────────────────────────── */
function _mDispatch(jobId) {
  var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
  if (!j) return;
  var body = '<div class="alert-strip ok"><i class="fa-solid fa-check"></i>Print Done &amp; QC Passed — Ready to dispatch</div>'
           + '<div class="fg"><label>Vehicle No.</label><input id="disVeh" placeholder="DL 1C 1234" value="' + _esc(j['Vehicle No.']||'') + '"></div>'
           + '<div class="fg"><label>Driver Name</label><input id="disDrv" placeholder="Driver name" value="' + _esc(j['Driver Name']||'') + '"></div>'
           + '<div class="fg"><label>LR Number</label><input id="disLR" placeholder="LR number" value="' + _esc(j['LR Number']||'') + '"></div>'
           + '<div class="fg"><label>Expected Delivery</label><input type="date" id="disEDD" value="' + (j['Expected Delivery Date']||'') + '"></div>'
           + '<div class="fg"><label>Supervisor Note</label><textarea id="disNote">' + _esc(j['Supervisor Notes']||'') + '</textarea></div>';
  var foot = '<button class="btn btnT btn-full" onclick="_saveDispatch(\'' + jobId + '\')">'
           + '<i class="fa-solid fa-truck"></i> Confirm Dispatch</button>';
  _mOpen('🚚 Dispatch — ' + jobId, body, foot);
}

function _saveDispatch(jobId) {
  var data = {
    jobId: jobId,
    vehicleNo: document.getElementById('disVeh').value,
    driverName: document.getElementById('disDrv').value,
    lrNumber:  document.getElementById('disLR').value,
    edd:       document.getElementById('disEDD').value,
    supNote:   document.getElementById('disNote').value,
  };
  _mLoading();
  _api('updateDispatch', data, function(r) {
    if (r.success) {
      var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
      if (j) {
        j['Dispatch Status'] = 'Done';
        j['Vehicle No.'] = data.vehicleNo;
        j['Driver Name'] = data.driverName;
        j['LR Number']   = data.lrNumber;
        j['Expected Delivery Date'] = data.edd;
        j['Supervisor Notes'] = data.supNote;
      }
      _mClose(); _toast('✅ Dispatched!'); _lv(_V);
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── New Job Modal ───────────────────────────────────── */
function _mNewJob() {
  var parties = (_D.parties||[]).filter(function(p){ return p['Status']==='Active'; });
  var stocks  = (_D.stock||[]).filter(function(s){ return s['Status']==='Available'||s['Status']==='Partial'; });

  var body = '<div class="fg"><label>Party*</label><select id="njParty">'
           + '<option value="">— Select Party —</option>'
           + parties.map(function(p){ return '<option value="' + (p['Party ID']||'') + '">' + _esc(p['Party Name']||'') + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Job Name / Description*</label><input id="njName" placeholder="e.g. ABC Mono Carton 500gsm"></div>'
           + '<div class="fg"><label>Category*</label><select id="njCat">'
           + ['Carton','Mono Carton','Wrapper','Brochure','Catalogue','Banner','Visiting Card','Envelope','Book Pages','Sticker','Label','Other'].map(function(c){ return '<option>' + c + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Order Qty*</label><input type="number" id="njQty" placeholder="500"></div>'
           + '<div class="fg"><label>Execute Qty*</label><input type="number" id="njExec" placeholder="500"></div>'
           + '</div>'
           + '<div class="fg"><label>Stock*</label><select id="njStock">'
           + '<option value="">— Select Stock —</option>'
           + stocks.map(function(s){ return '<option value="' + (s['Stock ID']||'') + '">' + _esc((s['Stock ID']||'') + ' — ' + (s['Paper Type']||'') + ' ' + (s['Sheet Size (inches)']||'')) + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Machine*</label><select id="njMach">'
           + ['Machine 1','Machine 2','Machine 3'].map(function(m){ return '<option>' + m + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Priority (1-5)*</label><select id="njPri"><option value="1">1 — Urgent</option><option value="2">2</option><option value="3" selected>3 — Normal</option><option value="4">4</option><option value="5">5 — Low</option></select></div>'
           + '<div class="fg"><label>Promised Date*</label><input type="date" id="njDate"></div>'
           + '</div>'
           + '<div class="fg"><label>Colors</label><input id="njColors" placeholder="C,M,Y,K"></div>'
           + '<div class="fg"><label>Customer PO No.</label><input id="njPO" placeholder="PO number"></div>';

  var foot = '<button class="btn btnP btn-full" onclick="_saveNewJob()">'
           + '<i class="fa-solid fa-plus"></i> Add Job</button>';
  _mOpen('➕ New Job', body, foot);
}

function _saveNewJob() {
  var data = {
    partyId:   document.getElementById('njParty').value,
    jobName:   document.getElementById('njName').value.trim(),
    category:  document.getElementById('njCat').value,
    orderQty:  document.getElementById('njQty').value,
    execQty:   document.getElementById('njExec').value,
    stockId:   document.getElementById('njStock').value,
    machine:   document.getElementById('njMach').value,
    priority:  document.getElementById('njPri').value,
    promDate:  document.getElementById('njDate').value,
    colors:    document.getElementById('njColors').value,
    custPO:    document.getElementById('njPO').value,
  };
  if (!data.partyId || !data.jobName || !data.stockId || !data.promDate) {
    _toast('⚠️ Fill required fields'); return;
  }
  _mLoading();
  _api('addJob', data, function(r) {
    if (r.success) {
      if (_D.jobs && r.job) _D.jobs.push(r.job);
      _mClose(); _toast('✅ Job added!'); _lv('jobs');
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Stock In Modal ──────────────────────────────────── */
function _mStockIn() {
  var parties = (_D.parties||[]).filter(function(p){ return p['Status']==='Active'; });
  var body = '<div class="fg"><label>Party*</label><select id="siParty">'
           + '<option value="">— Select Party —</option>'
           + parties.map(function(p){ return '<option value="' + (p['Party ID']||'') + '">' + _esc(p['Party Name']||'') + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Challan No.*</label><input id="siCh" placeholder="CH-001"></div>'
           + '<div class="form-row"><div class="fg"><label>Challan Date</label><input type="date" id="siChDate"></div>'
           + '<div class="fg"><label>Vehicle No.</label><input id="siVeh" placeholder="DL 1C 1234"></div></div>'
           + '<div class="fg"><label>Paper Type*</label><select id="siType">'
           + ['Duplex','Kraft','Normal','Loose','Craft','Art Paper','Newsprint','Bond','Other'].map(function(t){ return '<option>' + t + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Sheet Size (inches)*</label><input id="siSize" placeholder="27x35"></div>'
           + '<div class="fg"><label>GSM*</label><input type="number" id="siGsm" placeholder="300"></div>'
           + '</div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Bundles*</label><input type="number" id="siBundles" placeholder="10"></div>'
           + '<div class="fg"><label>Gross / Bundle*</label><input type="number" id="siGross" placeholder="50"></div>'
           + '</div>'
           + '<div class="fg"><label>Rack / Location</label><input id="siRack" placeholder="Rack A1"></div>';
  var foot = '<button class="btn btnG btn-full" onclick="_saveStockIn()">'
           + '<i class="fa-solid fa-boxes-stacked"></i> Add Stock</button>';
  _mOpen('📦 Stock Inward', body, foot);
}

function _saveStockIn() {
  var data = {
    partyId:  document.getElementById('siParty').value,
    challan:  document.getElementById('siCh').value.trim(),
    chDate:   document.getElementById('siChDate').value,
    vehicle:  document.getElementById('siVeh').value,
    paperType:document.getElementById('siType').value,
    sheetSize:document.getElementById('siSize').value.trim(),
    gsm:      document.getElementById('siGsm').value,
    bundles:  document.getElementById('siBundles').value,
    gross:    document.getElementById('siGross').value,
    rack:     document.getElementById('siRack').value,
  };
  if (!data.partyId || !data.challan || !data.paperType || !data.bundles) {
    _toast('⚠️ Fill required fields'); return;
  }
  _mLoading();
  _api('addStock', data, function(r) {
    if (r.success) {
      if (_D.stock && r.stock) _D.stock.push(r.stock);
      _mClose(); _toast('✅ Stock added!'); _lv('stock');
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── New QC Modal ────────────────────────────────────── */
function _mNewQC() { _mNewQCForJob(''); }
function _mNewQCForJob(preJobId) {
  var readyJobs = (_D.jobs||[]).filter(function(j){ return j['Print Status']==='Done'; });
  var body = '<div class="fg"><label>Job*</label><select id="qcJob">'
           + '<option value="">— Select Job —</option>'
           + readyJobs.map(function(j){ return '<option value="' + (j['Job ID']||'') + '"' + (j['Job ID']===preJobId?' selected':'') + '>' + _esc((j['Job ID']||'') + ' — ' + (j['Job Name / Description']||'')) + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>QC Stage*</label><select id="qcStage">'
           + ['Pre-press QC','Print QC','Post-press QC','Final QC'].map(function(s){ return '<option>' + s + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Color (1-5)*</label><input type="number" id="qcColor" min="1" max="5" value="4"></div>'
           + '<div class="fg"><label>Register (1-5)*</label><input type="number" id="qcReg" min="1" max="5" value="4"></div>'
           + '</div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Ink Density (1-5)*</label><input type="number" id="qcInk" min="1" max="5" value="4"></div>'
           + '<div class="fg"><label>Cutting (1-5)*</label><input type="number" id="qcCut" min="1" max="5" value="4"></div>'
           + '</div>'
           + '<div class="fg"><label>Result*</label><select id="qcResult">'
           + ['Pass','Partial Pass','Fail','Pending'].map(function(s){ return '<option>' + s + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Rejection Qty</label><input type="number" id="qcRej" value="0"></div>'
           + '<div class="fg"><label>Corrective Action</label><textarea id="qcNote"></textarea></div>';
  var foot = '<button class="btn btnA btn-full" onclick="_saveQC()">'
           + '<i class="fa-solid fa-magnifying-glass-chart"></i> Save QC Entry</button>';
  _mOpen('🔍 QC Entry', body, foot);
}

function _saveQC() {
  var data = {
    jobId:    document.getElementById('qcJob').value,
    stage:    document.getElementById('qcStage').value,
    colorAcc: document.getElementById('qcColor').value,
    regAcc:   document.getElementById('qcReg').value,
    inkDen:   document.getElementById('qcInk').value,
    cutAcc:   document.getElementById('qcCut').value,
    result:   document.getElementById('qcResult').value,
    rejQty:   document.getElementById('qcRej').value,
    note:     document.getElementById('qcNote').value,
  };
  if (!data.jobId) { _toast('⚠️ Select a job'); return; }
  _mLoading();
  _api('addQC', data, function(r) {
    if (r.success) {
      // Update job QC status
      var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===data.jobId; });
      if (j) { j['QC Done (Y/N)'] = true; j['QC Pass/Fail'] = data.result; }
      _mClose(); _toast('✅ QC saved!'); _lv(_V);
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── New Downtime Modal ──────────────────────────────── */
function _mNewDowntime() {
  var body = '<div class="fg"><label>Machine*</label><select id="dtMach">'
           + ['Machine 1','Machine 2','Machine 3'].map(function(m){ return '<option>' + m + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Reason Category*</label><select id="dtCat">'
           + ['Mechanical','Electrical','Operator Error','Scheduled Maintenance','Chemical Issue','Power Cut','Other'].map(function(c){ return '<option>' + c + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Reason Description*</label><textarea id="dtDesc" placeholder="Describe the issue…"></textarea></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Start Time</label><input type="datetime-local" id="dtStart"></div>'
           + '<div class="fg"><label>End Time</label><input type="datetime-local" id="dtEnd"></div>'
           + '</div>'
           + '<div class="fg"><label>Repair Cost (₹)</label><input type="number" id="dtCost" placeholder="0" value="0"></div>'
           + '<div class="fg"><label>Action Taken</label><textarea id="dtAction"></textarea></div>';
  var foot = '<button class="btn btnR btn-full" onclick="_saveDowntime()">'
           + '<i class="fa-solid fa-triangle-exclamation"></i> Log Downtime</button>';
  _mOpen('⚠️ Log Downtime', body, foot);
}

function _saveDowntime() {
  var data = {
    machine:   document.getElementById('dtMach').value,
    category:  document.getElementById('dtCat').value,
    desc:      document.getElementById('dtDesc').value.trim(),
    startTime: document.getElementById('dtStart').value,
    endTime:   document.getElementById('dtEnd').value,
    cost:      document.getElementById('dtCost').value,
    action:    document.getElementById('dtAction').value,
  };
  if (!data.desc) { _toast('⚠️ Enter reason description'); return; }
  _mLoading();
  _api('addDowntime', data, function(r) {
    if (r.success) {
      _mClose(); _toast('✅ Downtime logged!'); _lv(_V);
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Record Payment Modal ────────────────────────────── */
function _mRecordPayment(invNo) {
  var inv = (_D.invoices||[]).find(function(i){ return i['Invoice No.']===invNo; });
  if (!inv) return;
  var body = '<div class="alert-strip info"><i class="fa-solid fa-file-invoice"></i>Invoice: <b>' + invNo + '</b></div>'
           + '<div class="info-row"><span class="ir-lbl">Party</span><span class="ir-val">' + _esc(inv['Party Name']||'—') + '</span></div>'
           + '<div class="info-row" style="margin-bottom:12px"><span class="ir-lbl">Net Payable</span><span class="ir-val" style="font-weight:800;color:var(--R)">₹' + _fmt(_num(inv['Net Payable'])) + '</span></div>'
           + '<div class="fg"><label>Amount Received (₹)*</label><input type="number" id="pmtAmt" placeholder="0"></div>'
           + '<div class="fg"><label>Payment Mode*</label><select id="pmtMode">'
           + ['Cash','UPI','NEFT','RTGS','Cheque'].map(function(m){ return '<option>' + m + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Ref No. / UTR</label><input id="pmtRef" placeholder="UPI transaction ID etc"></div>'
           + '<div class="fg"><label>TDS Deducted (₹)</label><input type="number" id="pmtTds" value="0"></div>'
           + '<div class="fg"><label>Payment Type*</label><select id="pmtType">'
           + ['Full Payment','Part Payment','Advance'].map(function(t){ return '<option>' + t + '</option>'; }).join('')
           + '</select></div>';
  var foot = '<button class="btn btnG btn-full" onclick="_savePayment(\'' + invNo + '\')">'
           + '<i class="fa-solid fa-indian-rupee-sign"></i> Record Payment</button>';
  _mOpen('💳 Record Payment', body, foot);
}

function _savePayment(invNo) {
  var data = {
    invoiceNo: invNo,
    amount:    document.getElementById('pmtAmt').value,
    mode:      document.getElementById('pmtMode').value,
    ref:       document.getElementById('pmtRef').value,
    tds:       document.getElementById('pmtTds').value,
    type:      document.getElementById('pmtType').value,
  };
  if (!data.amount || parseFloat(data.amount) <= 0) { _toast('⚠️ Enter valid amount'); return; }
  _mLoading();
  _api('addPayment', data, function(r) {
    if (r.success) {
      _mClose(); _toast('✅ Payment recorded!'); _lv('payments');
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Invoice Modal ───────────────────────────────────── */
function _mInvoice(jobId) {
  var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
  if (!j) return;
  var body = '<div class="alert-strip ok"><i class="fa-solid fa-truck"></i>Job dispatched — Generate invoice</div>'
           + '<div class="fg"><label>Invoice Type</label><select id="invType"><option value="Pakka">Pakka (With GST)</option><option value="Kachha">Kachha (Without GST)</option></select></div>'
           + '<div class="fg"><label>Taxable Amount (₹)*</label><input type="number" id="invAmt" placeholder="5000"></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>CGST %</label><input type="number" id="invCgst" value="9"></div>'
           + '<div class="fg"><label>SGST %</label><input type="number" id="invSgst" value="9"></div>'
           + '</div>'
           + '<div class="fg"><label>Payment Terms (days)</label><input type="number" id="invTerms" value="30"></div>'
           + '<div class="fg"><label>Notes</label><textarea id="invNote"></textarea></div>';
  var foot = '<button class="btn btnP btn-full" onclick="_saveInvoice(\'' + jobId + '\')">'
           + '<i class="fa-solid fa-file-invoice"></i> Generate Invoice</button>';
  _mOpen('🧾 Generate Invoice — ' + jobId, body, foot);
}

function _saveInvoice(jobId) {
  var data = {
    jobId:   jobId,
    type:    document.getElementById('invType').value,
    taxable: document.getElementById('invAmt').value,
    cgst:    document.getElementById('invCgst').value,
    sgst:    document.getElementById('invSgst').value,
    terms:   document.getElementById('invTerms').value,
    note:    document.getElementById('invNote').value,
  };
  if (!data.taxable) { _toast('⚠️ Enter taxable amount'); return; }
  _mLoading();
  _api('addInvoice', data, function(r) {
    if (r.success) {
      var j = (_D.jobs||[]).find(function(x){ return x['Job ID']===jobId; });
      if (j) { j['Billed (Y/N)'] = true; }
      _mClose(); _toast('✅ Invoice generated!'); _lv('invoices');
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── New Expense Modal ───────────────────────────────── */
function _mNewExpense() {
  var body = '<div class="fg"><label>Category*</label><select id="expCat">'
           + ['Ink','Plate','Chemical','Lamination Film','Maintenance','Electricity','Packing Material','Labour','Miscellaneous'].map(function(c){ return '<option>' + c + '</option>'; }).join('')
           + '</select></div>'
           + '<div class="fg"><label>Item Description*</label><input id="expDesc" placeholder="e.g. Black Ink 5KG"></div>'
           + '<div class="fg"><label>Vendor Name</label><input id="expVendor" placeholder="Supplier name"></div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Qty</label><input type="number" id="expQty" placeholder="1"></div>'
           + '<div class="fg"><label>Unit</label><select id="expUnit"><option>Kg</option><option>Litre</option><option>Pcs</option><option>Roll</option><option>Bill</option><option>Job</option><option>Set</option></select></div>'
           + '</div>'
           + '<div class="form-row">'
           + '<div class="fg"><label>Rate (₹)</label><input type="number" id="expRate" placeholder="0"></div>'
           + '<div class="fg"><label>GST %</label><input type="number" id="expGst" value="18"></div>'
           + '</div>'
           + '<div class="fg"><label>Payment Mode</label><select id="expMode"><option>Cash</option><option>UPI</option><option>NEFT</option><option>Cheque</option></select></div>';
  var foot = '<button class="btn btnO btn-full" onclick="_saveExpense()">'
           + '<i class="fa-solid fa-receipt"></i> Add Expense</button>';
  _mOpen('💸 New Expense', body, foot);
}

function _saveExpense() {
  var data = {
    category: document.getElementById('expCat').value,
    desc:     document.getElementById('expDesc').value.trim(),
    vendor:   document.getElementById('expVendor').value,
    qty:      document.getElementById('expQty').value,
    unit:     document.getElementById('expUnit').value,
    rate:     document.getElementById('expRate').value,
    gst:      document.getElementById('expGst').value,
    mode:     document.getElementById('expMode').value,
  };
  if (!data.desc) { _toast('⚠️ Enter description'); return; }
  _mLoading();
  _api('addExpense', data, function(r) {
    if (r.success) {
      _mClose(); _toast('✅ Expense added!'); _lv('expenses');
    } else { _toast('❌ ' + (r.error||'Save failed')); }
  });
}

/* ── Party Detail Modal ──────────────────────────────── */
function _mPartyDetail(partyId) {
  var p = (_D.parties||[]).find(function(x){ return x['Party ID']===partyId; });
  if (!p) return;
  var jobs = (_D.jobs||[]).filter(function(j){ return j['Party ID']===partyId; });
  var body = '<div class="info-row"><span class="ir-lbl">Party ID</span><span class="ir-val">' + (p['Party ID']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Contact</span><span class="ir-val">' + _esc(p['Contact Person 1']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Mobile</span><span class="ir-val">' + (p['Mobile 1']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">GST</span><span class="ir-val">' + (p['GST Number']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">City</span><span class="ir-val">' + _esc(p['Billing City']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Credit Days</span><span class="ir-val">' + (p['Credit Days']||'—') + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Outstanding</span><span class="ir-val" style="color:var(--R);font-weight:800">₹' + _fmt(_num(p['Outstanding Balance (Rs)'])) + '</span></div>'
           + '<div class="info-row"><span class="ir-lbl">Total Jobs</span><span class="ir-val">' + jobs.length + '</span></div>'
           + (p['Special Instructions'] ? '<div class="alert-strip info" style="margin-top:8px"><i class="fa-solid fa-note-sticky"></i>' + _esc(p['Special Instructions']) + '</div>' : '');

  var foot = '';
  if (p['WhatsApp 1']) {
    foot += '<button class="wa-btn" onclick="_waParty(\'' + (p['WhatsApp 1']||'') + '\',\'' + _esc(p['Contact Person 1']||'') + '\')">'
          + '<i class="fa-brands fa-whatsapp"></i> WhatsApp</button>';
  }
  foot += '<button class="btn btnOut" onclick="_mClose();_lv(\'jobs\');_jobFilter=\'all\';_jobSearch=\'' + partyId + '\'"><i class="fa-solid fa-clipboard-list"></i> Jobs</button>';
  _mOpen(p['Party Name']||'Party', body, foot);
}

/* ─────────────────────────────────────────────────────
   WHATSAPP HELPERS
───────────────────────────────────────────────────── */
function _wa(num, msg) {
  num = String(num||'').replace(/\D/g,'');
  if (!num) { _toast('⚠️ No WhatsApp number'); return; }
  if (!num.startsWith('91') && num.length === 10) num = '91' + num;
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank');
}

function _waParty(num, name) {
  _wa(num, 'Namaskar ' + (name||'') + ' ji! 🙏\nNitin Mittal Press se bol rahe hain.\nKoi kaam ho to bataiye.\n— Nitin Mittal Press');
}

function _waDispatch(num, name, jobName, jobId, dispDate, veh, lr) {
  _wa(num, 'Namaskar ' + (name||'') + ' ji! 🙏\n\nAapka kaam *' + jobName + '* complete ho gaya hai.\n\n📦 Job ID: ' + jobId + '\n🚚 Dispatch Date: ' + (dispDate||_today()) + '\n🚗 Vehicle No.: ' + (veh||'—') + '\n📋 LR No.: ' + (lr||'—') + '\n\nDhanyawad! 🙏\n— Nitin Mittal Press');
}

function _waPaymentReminder(num, invNo, amount, dueDate, name) {
  _wa(num, 'Namaskar ' + (name||'') + ' ji! 🙏\n\nAapka invoice *' + invNo + '* pending hai.\n\n💰 Amount: ₹' + amount + '\n📅 Due Date: ' + (dueDate||'—') + '\n\nPlease payment ka arrangement kar lijiye.\n\nDhanyawad! 🙏\n— Nitin Mittal Press');
}

/* ─────────────────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────────────────── */
function _mOpen(title, body, foot) {
  document.getElementById('mTitle').textContent = title;
  document.getElementById('mBody').innerHTML = body;
  var mf = document.getElementById('mFoot');
  if (foot) { mf.innerHTML = foot; mf.style.display = 'flex'; }
  else { mf.innerHTML = ''; mf.style.display = 'none'; }
  document.getElementById('mOv').classList.add('on');
  document.getElementById('modal').classList.add('on');
  document.getElementById('modal').scrollTop = 0;
}

function _mClose() {
  document.getElementById('mOv').classList.remove('on');
  document.getElementById('modal').classList.remove('on');
}

function _mLoading() {
  document.getElementById('mFoot').innerHTML = '<button class="btn btnOut btn-full" disabled><i class="fa-solid fa-spinner fa-spin"></i> Saving…</button>';
}

/* ─────────────────────────────────────────────────────
   COMPONENT HELPERS
───────────────────────────────────────────────────── */
function _kpi(label, val, icon, color, bg) {
  return '<div class="kpi" style="--kc:var(' + color + ');--kib:var(' + bg + ')">'
       + '<div class="kpi-ico"><i class="fa-solid ' + icon + '"></i></div>'
       + '<div class="kpi-val">' + val + '</div>'
       + '<div class="kpi-lbl">' + label + '</div></div>';
}

function _tile(icon, color, bg, name, sub, onclick) {
  return '<div class="home-tile" style="--tc:var(' + color + ');--tib:var(' + bg + ')" onclick="' + onclick + '">'
       + '<div class="ht-ico"><i class="fa-solid ' + icon + '"></i></div>'
       + '<div><div class="ht-name">' + name + '</div><div class="ht-sub">' + sub + '</div></div></div>';
}

/* ─────────────────────────────────────────────────────
   FAB
───────────────────────────────────────────────────── */
function _fabClick() { if (_fabCb) _fabCb(); }

/* ─────────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────────── */
function _today() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function _num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
function _fmt(n) {
  if (typeof n === 'string' && n.startsWith('₹')) return n;
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function _esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
