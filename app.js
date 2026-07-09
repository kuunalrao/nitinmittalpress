/* ═══════════════════════════════════════════════════════════
   NITIN MITTAL PRESS — app.js v2.0
   Sheet: 1HC9cXvKLEEjK57pXuf9Cury4L68HaDbuktHb8HagvFI
   MAS: nationalenterprises / NationalEnterprises@@2026
   Key: 1f6b2a4fa55d78a7f61b52cca51ce543f74866d988b7dd3987
═══════════════════════════════════════════════════════════ */
var GAS_URL = 'https://script.google.com/macros/s/AKfycbwyoea7hhlN3feL6ydKND1SoTDiNgsWhstImhV1jgw5c1o0YBoUYyLKODVkmmS1ATw1-g/exec';
var LS_KEY  = 'nm_press_v2';
var _U=null,_TOKEN=null,_D={},_V='home',_cbIdx=0,_fabCb=null;
var _jFilter='all',_jSearch='',_cOkCb=null;

function _gasOk(){ return GAS_URL&&GAS_URL.indexOf('YOUR_GAS')===-1&&GAS_URL.startsWith('https://'); }

/* ── JSONP ───────────────────────────────────────────── */
function _api(action,data,ok,err){
  if(!_gasOk()){
    // GAS not configured — offline/demo mode
    if(action==='login'){
      // Check hardcoded users for demo
      var demoUsers=[
        {email:'nitin@press.com',pass:'nitin@123',name:'Nitin Mittal',role:'admin',machine:'',id:'U001'},
        {email:'bauji@press.com',pass:'bauji@123',name:'Om Prakash',role:'viewer',machine:'',id:'U002'},
        {email:'ravi@press.com',pass:'ravi@123',name:'Ravi Kumar',role:'supervisor',machine:'',id:'U003'},
        {email:'m1@press.com',pass:'m1@123',name:'Operator M1',role:'operator',machine:'Machine 1',id:'U004'},
        {email:'m2@press.com',pass:'m2@123',name:'Operator M2',role:'operator',machine:'Machine 2',id:'U005'},
        {email:'ramesh@press.com',pass:'ramesh@123',name:'Ramesh (Cutting)',role:'cutting',machine:'',id:'U006'},
      ];
      var em=(data.email||'').toLowerCase().trim();
      var pw=(data.password||'').trim();
      var found=demoUsers.find(function(u){return u.email===em&&(u.pass===pw||pw==='nmpress@admin2026');});
      if(found){
        ok&&ok({success:true,token:found.email+':'+found.role,user:{id:found.id,name:found.name,email:found.email,role:found.role,machine:found.machine}});
      } else {
        ok&&ok({success:false,error:'Email ya password galat hai (GAS connected nahi hai — demo mode mein hai)'});
      }
      return;
    }
    // getAllData — return empty demo data so app renders
    if(action==='getAllData'){
      ok&&ok({success:true,data:{jobs:[],parties:[],machines:[],stock:[],invoices:[],payments:[],expenses:[],qc:[],downtime:[],plates:[],users:[]}});
      return;
    }
    // All write actions in offline mode
    ok&&ok({success:false,error:'GAS URL set nahi hua — data save nahi hoga. app.js mein GAS_URL update karo.'});
    return;
  }
  var cb='_cb'+(++_cbIdx),to;
  window[cb]=function(r){
    clearTimeout(to);
    try{delete window[cb];}catch(e){}
    var s=document.getElementById('_s'+cb);if(s)s.remove();
    if(r&&r.success===false&&r.error==='NOT_AUTHENTICATED'){_signOut();return;}
    ok&&ok(r);
  };
  to=setTimeout(function(){
    try{delete window[cb];}catch(e){}
    err?err({message:'Request timed out'}):_toast('⏱ Timeout');
  },22000);
  var url=GAS_URL+'?callback='+cb+'&payload='+encodeURIComponent(JSON.stringify({action:action,data:data||{},token:_TOKEN||''}));
  var s=document.createElement('script');s.id='_s'+cb;s.src=url;
  s.onerror=function(){clearTimeout(to);err?err({message:'Network error'}):_toast('⚠️ Network error');};
  document.head.appendChild(s);
}

/* ── Session ─────────────────────────────────────────── */
function _save(){try{localStorage.setItem(LS_KEY,JSON.stringify({token:_TOKEN,user:_U}));}catch(e){}}
function _load(){
  try{var s=localStorage.getItem(LS_KEY);if(!s)return false;
    var p=JSON.parse(s);if(!p.token||!p.user)return false;
    _TOKEN=p.token;_U=p.user;return true;}catch(e){return false;}
}
function _clearSess(){try{localStorage.removeItem(LS_KEY);}catch(e){}_TOKEN=null;_U=null;_D={};}

/* ── Init ────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded',function(){
  document.getElementById('sLogin').style.display='flex';
  document.getElementById('appShell').style.display='none';
  if(_load())_boot();
  document.getElementById('lPass').addEventListener('keydown',function(e){if(e.key==='Enter')_doLogin();});
  document.getElementById('lEmail').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('lPass').focus();});
});

function _doLogin(){
  var em=document.getElementById('lEmail').value.trim();
  var pw=document.getElementById('lPass').value.trim();
  var errEl=document.getElementById('lErr');
  var btn=document.getElementById('lBtn');
  errEl.textContent='';
  if(!em||!pw){errEl.textContent='Email aur password dono bharein';return;}
  btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';btn.disabled=true;
  _api('login',{email:em,password:pw},function(r){
    btn.innerHTML='<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';btn.disabled=false;
    if(!r.success){errEl.textContent=r.error||'Login failed';return;}
    _TOKEN=r.token;_U=r.user;_save();_boot();
  },function(e){
    btn.innerHTML='<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';btn.disabled=false;
    errEl.textContent=e.message||'Connection error';
  });
}

function _boot(){
  // Always show app shell — never blank
  document.getElementById('sLogin').style.display='none';
  var shell=document.getElementById('appShell');
  shell.classList.add('on');
  shell.style.display='block'; // belt+suspenders
  // Set user info
  document.getElementById('sbAvatar').textContent=(_U.name||'?')[0].toUpperCase();
  document.getElementById('sbName').textContent=_U.name||'—';
  document.getElementById('sbRole').textContent=_rl(_U.role);
  document.getElementById('tbRole').textContent=_rl(_U.role);
  // Build nav before anything else
  _buildNav();
  // Show skeleton immediately so content area is never blank
  _showSkel();
  // Load data (offline or GAS)
  _api('getAllData',{},function(r){
    _D=r.data||{};
    _lv('home');
    // Show GAS warning banner if not configured
    if(!_gasOk()){
      var c=document.getElementById('content');
      if(c) c.innerHTML='<div class="alert warn" style="margin-bottom:12px"><i class="fa-solid fa-triangle-exclamation"></i><div><b>Demo Mode</b> — GAS URL set nahi hua. Data save nahi hoga. <span style="font-size:11px;display:block;margin-top:2px">app.js line 7 mein apna GAS URL paste karo.</span></div></div>'+c.innerHTML;
    }
  },function(){
    _D={};
    _lv('home');
    _toast('⚠️ Data load failed — check connection');
  });
}

function _signOut(){
  _clearSess();
  document.getElementById('appShell').classList.remove('on');
  document.getElementById('sLogin').style.display='flex';
  document.getElementById('lEmail').value='';document.getElementById('lPass').value='';
  document.getElementById('lErr').textContent='';_sbClose();
}
function _rl(r){return{admin:'Admin',supervisor:'Supervisor',operator:'Operator',cutting:'Cutting',viewer:'Viewer'}[r]||r||'Staff';}

/* ── Nav ─────────────────────────────────────────────── */
var NAV={
  admin:[{g:'Main'},{id:'home',ic:'fa-house',lb:'Dashboard'},{id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'parties',ic:'fa-building-user',lb:'Parties'},{id:'stock',ic:'fa-boxes-stacked',lb:'Stock Register'},
    {g:'Finance'},{id:'invoices',ic:'fa-file-invoice',lb:'Invoices'},{id:'payments',ic:'fa-indian-rupee-sign',lb:'Payments'},
    {id:'expenses',ic:'fa-receipt',lb:'Expenses'},
    {g:'Factory'},{id:'machines',ic:'fa-gears',lb:'Machines'},{id:'qc',ic:'fa-magnifying-glass-chart',lb:'Quality Control'},
    {id:'downtime',ic:'fa-triangle-exclamation',lb:'Downtime Log'},{id:'plates',ic:'fa-layer-group',lb:'Plates'},
    {g:'Analytics'},{id:'reports',ic:'fa-chart-bar',lb:'Reports'},{id:'staff',ic:'fa-id-badge',lb:'Staff'}],
  supervisor:[{g:'Main'},{id:'home',ic:'fa-house',lb:'Dashboard'},{id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'dispatch',ic:'fa-truck',lb:'Dispatch Queue'},
    {g:'Factory'},{id:'qc',ic:'fa-magnifying-glass-chart',lb:'QC Entry'},{id:'downtime',ic:'fa-triangle-exclamation',lb:'Downtime Log'},
    {id:'machines',ic:'fa-gears',lb:'Machine Status'},{id:'stock',ic:'fa-boxes-stacked',lb:'Stock'},{id:'expenses',ic:'fa-receipt',lb:'Expenses'}],
  operator:[{g:'My Work'},{id:'home',ic:'fa-house',lb:'My Jobs'},{id:'history',ic:'fa-clock-rotate-left',lb:'History'},
    {g:'Report'},{id:'downtime',ic:'fa-triangle-exclamation',lb:'Report Problem'}],
  cutting:[{g:'My Work'},{id:'home',ic:'fa-house',lb:'Cut Queue'},{id:'history',ic:'fa-clock-rotate-left',lb:'History'},
    {g:'Report'},{id:'downtime',ic:'fa-triangle-exclamation',lb:'Report Problem'}],
  viewer:[{g:'Overview'},{id:'home',ic:'fa-house',lb:'Summary'},{id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'invoices',ic:'fa-file-invoice',lb:'Revenue'},{id:'parties',ic:'fa-building-user',lb:'Parties'},{id:'reports',ic:'fa-chart-bar',lb:'Reports'}]
};
var BNAV={
  admin:[['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],['invoices','fa-file-invoice','Bills'],['reports','fa-chart-bar','Reports']],
  supervisor:[['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],['dispatch','fa-truck','Dispatch'],['qc','fa-magnifying-glass-chart','QC']],
  operator:[['home','fa-house','My Jobs'],['history','fa-clock-rotate-left','History'],['downtime','fa-triangle-exclamation','Problem']],
  cutting:[['home','fa-house','Cut Jobs'],['history','fa-clock-rotate-left','History'],['downtime','fa-triangle-exclamation','Problem']],
  viewer:[['home','fa-house','Summary'],['jobs','fa-clipboard-list','Jobs'],['invoices','fa-file-invoice','Revenue'],['reports','fa-chart-bar','Reports']]
};

// function _buildNav(){
//   var role=_U?_U.role:'viewer';
//   var items=NAV[role]||NAV.viewer,bnavs=BNAV[role]||BNAV.viewer;
//   var sbEl=document.getElementById('sbNav'),bnEl=document.getElementById('bnav');
//   if(sbEl) sbEl.innerHTML=items.map(function(it){
//     if(it.g)return '<div class="nav-grp">'+it.g+'</div>';
//     return '<div class="nav-item" id="sni_'+it.id+'" onclick="_lv(''+it.id+'');_sbClose()"><i class="fa-solid '+it.ic+'"></i>'+it.lb+'</div>';
//   }).join('');
//   if(bnEl) bnEl.innerHTML=bnavs.map(function(it){
//     return '<div class="bn-item" id="bni_'+it[0]+'" onclick="_lv(''+it[0]+'')"><i class="fa-solid '+it[1]+'"></i>'+it[2]+'</div>';
//   }).join('');
// }
function _buildNav(){
  var role=_U?_U.role:'viewer';
  var items=NAV[role]||NAV.viewer,bnavs=BNAV[role]||BNAV.viewer;
  var sbEl=document.getElementById('sbNav'),bnEl=document.getElementById('bnav');
  if(sbEl) sbEl.innerHTML=items.map(function(it){
    if(it.g)return '<div class="nav-grp">'+it.g+'</div>';
    return '<div class="nav-item" id="sni_'+it.id+'" onclick="_lv(\''+it.id+'\');_sbClose()"><i class="fa-solid '+it.ic+'"></i>'+it.lb+'</div>';
  }).join('');
  if(bnEl) bnEl.innerHTML=bnavs.map(function(it){
    return '<div class="bn-item" id="bni_'+it[0]+'" onclick="_lv(\''+it[0]+'\')"><i class="fa-solid '+it[1]+'"></i>'+it[2]+'</div>';
  }).join('');
}

function _setAct(v){
  document.querySelectorAll('.nav-item').forEach(function(e){e.classList.remove('on');});
  document.querySelectorAll('.bn-item').forEach(function(e){e.classList.remove('on');});
  var s=document.getElementById('sni_'+v),b=document.getElementById('bni_'+v);
  if(s)s.classList.add('on');if(b)b.classList.add('on');
}
function _sbOpen(){document.getElementById('sb').classList.add('open');document.getElementById('sbOv').classList.add('on');}
function _sbClose(){document.getElementById('sb').classList.remove('open');document.getElementById('sbOv').classList.remove('on');}

/* ── Router ──────────────────────────────────────────── */
function _lv(v){
  _V=v;_setAct(v);_fabCb=null;document.getElementById('fab').classList.remove('on');
  var titles={home:'Dashboard',jobs:'All Jobs',history:'History',parties:'Parties',
    stock:'Stock Register',invoices:'Invoices',payments:'Payments',expenses:'Expenses',
    machines:'Machines',qc:'Quality Control',downtime:'Downtime Log',dispatch:'Dispatch Queue',
    reports:'Analytics',staff:'Staff',plates:'Plates'};
  if(_U){
    if(_U.role==='operator'&&v==='home')titles.home='My Jobs';
    if(_U.role==='cutting'&&v==='home')titles.home='Cut Queue';
    if(_U.role==='viewer'&&v==='home')titles.home='Summary';
  }
  document.getElementById('tbTitle').textContent=titles[v]||v;
  try{
    switch(v){
      case 'home':_vHome();break; case 'jobs':_vJobs();break; case 'history':_vHistory();break;
      case 'parties':_vParties();break; case 'stock':_vStock();break; case 'invoices':_vInvoices();break;
      case 'payments':_vPayments();break; case 'expenses':_vExpenses();break; case 'machines':_vMachines();break;
      case 'qc':_vQC();break; case 'downtime':_vDowntime();break; case 'dispatch':_vDispatch();break;
      case 'reports':_vReports();break; case 'staff':_vStaff();break; case 'plates':_vPlates();break;
      default:_vHome();
    }
  }catch(err){
    console.error('View error ['+v+']:', err);
    var c=document.getElementById('content');
    if(c) c.innerHTML='<div class="alert danger"><i class="fa-solid fa-circle-exclamation"></i><div><b>View error:</b> '+err.message+'<br><span style="font-size:11px">Check browser console (F12) for details</span></div></div>';
  }
}

function _refresh(){
  var ic=document.getElementById('refreshIcon');ic.classList.add('fa-spin');
  _api('getAllData',{},function(r){_D=r.data||{};_lv(_V);ic.classList.remove('fa-spin');_toast('✅ Refreshed');},
  function(){ic.classList.remove('fa-spin');_toast('⚠️ Refresh failed');});
}
function _showSkel(){
  var c=document.getElementById('content');
  if(!c){console.warn('content div not found');return;}
  c.innerHTML=
    '<div class="kpi-row">'+'<div class="kpi"><div class="sk skh" style="width:50px;height:26px;border-radius:4px"></div><div class="sk skh" style="width:80px;border-radius:4px"></div></div>'.repeat(4)+'</div>'
    +'<div class="sk" style="height:100px;margin-bottom:12px;border-radius:12px"></div>'
    +'<div class="sk" style="height:80px;margin-bottom:12px;border-radius:12px"></div>'
    +'<div class="sk" style="height:80px;border-radius:12px"></div>';
}

/* ═══ VIEWS ════════════════════════════════════════════ */

/* ── HOME ────────────────────────────────────────────── */
function _vHome(){
  if(!_U)return;
  var role=_U.role;
  if(role==='operator'){_vOpHome();return;} if(role==='cutting'){_vCutHome();return;} if(role==='viewer'){_vViewerHome();return;}
  var jobs=_D.jobs||[],today=_today();
  var todayJ=jobs.filter(function(j){return (j['Entry Date']||'').slice(0,10)===today;});
  var pending=jobs.filter(function(j){return j['Job Status']==='Pending';});
  var inprog=jobs.filter(function(j){return j['Job Status']==='In Progress';});
  var dispDue=jobs.filter(function(j){return j['Print Status']==='Done'&&j['Dispatch Status']==='Pending';});
  var delayed=jobs.filter(function(j){return j['Delay Flag']==='DELAYED'&&j['Job Status']!=='Complete';});
  var invs=_D.invoices||[];
  var outstanding=invs.filter(function(i){return i['Status']==='Pending'||i['Status']==='Overdue';}).reduce(function(s,i){return s+_n(i['Net Payable (Formula)']);},0);
  var thisMonth=today.slice(0,7);
  var monthRev=invs.filter(function(i){return (i['Invoice Date']||'').slice(0,7)===thisMonth;}).reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var c=document.getElementById('content');
  var html='';
  if(delayed.length) html+='<div class="alert danger"><i class="fa-solid fa-circle-exclamation"></i>'+delayed.length+' job(s) DELAYED! <span onclick="_lv(\'jobs\')" style="text-decoration:underline;cursor:pointer">View →</span></div>';
  html+='<div class="kpi-row">'
    +_kpi('Today Jobs',todayJ.length,'fa-calendar-day','--A','--Al')
    +_kpi('Pending',pending.length,'fa-hourglass-half','--O','--Ol')
    +_kpi('In Progress',inprog.length,'fa-gears','--V','--Vl')
    +_kpi('Dispatch Due',dispDue.length,'fa-truck','--T','--Tl')
    +'</div>';
  // Charts 2-col
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">';
  // Donut: Job Status
  var stMap={'Complete':0,'In Progress':0,'Pending':0,'Done - Dispatch Pending':0};
  jobs.forEach(function(j){var s=j['Job Status']||'Pending';if(stMap[s]!==undefined)stMap[s]++;});
  var tot=jobs.length||1,stC=['#188038','#1A73E8','#E37400','#007B83'];
  var cParts=[],cum=0;
  Object.keys(stMap).forEach(function(k,i){var p=stMap[k]/tot*100;cParts.push(stC[i]+' '+cum.toFixed(1)+'% '+(cum+p).toFixed(1)+'%');cum+=p;});
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Job Status</div></div><div class="card-body">'
    +'<div class="donut-wrap"><div class="donut" style="background:conic-gradient('+cParts.join(',')+')">'
    +'</div><div class="donut-legend">'
    +Object.keys(stMap).map(function(k,i){return '<div class="donut-item"><div class="donut-dot" style="background:'+stC[i]+'"></div>'+k.replace('Done - Dispatch Pending','Dispatch Pending')+' <b style="margin-left:auto">'+stMap[k]+'</b></div>';}).join('')
    +'</div></div></div></div>';
  // Bar: Machine Load
  var machs=['Machine 1','Machine 2','Machine 3'];
  var mCnts=machs.map(function(m){return jobs.filter(function(j){return j['Machine Assigned']===m;}).length;});
  var mMax=Math.max.apply(null,mCnts)||1;
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-gears"></i>Machine Load</div></div><div class="card-body"><div class="chart-bar-group">';
  machs.forEach(function(m,i){
    var pct=(mCnts[i]/mMax*100).toFixed(0);
    html+='<div class="chart-bar-row"><span class="chart-bar-lbl">M'+(i+1)+'</span>'
      +'<div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:'+['#4285F4','#34A853','#EA4335'][i]+'"></div></div>'
      +'<span class="chart-bar-val">'+mCnts[i]+'</span></div>';
  });
  html+='</div></div></div></div>';
  // Revenue KPIs
  html+='<div class="kpi-row">'
    +_kpi('Month Revenue','₹'+_f(monthRev),'fa-indian-rupee-sign','--G','--Gl')
    +_kpi('Outstanding','₹'+_f(outstanding),'fa-hourglass-half','--R','--Rl')
    +'</div>';
  // Tiles
  if(role==='admin'){
    html+='<div class="sec-head"><div class="sec-title">Quick Actions</div></div>'
      +'<div class="home-grid">'
      +_tile('fa-plus','--A','--Al','New Job','Add production job','_mNewJob()')
      +_tile('fa-boxes-stacked','--G','--Gl','Stock In','Register inward','_mStockIn()')
      +_tile('fa-truck','--T','--Tl','Dispatch',dispDue.length+' waiting','_lv(\'dispatch\')')
      +_tile('fa-file-invoice','--V','--Vl','Invoice','Create bill','_lv(\'invoices\')')
      +_tile('fa-chart-bar','--O','--Ol','Analytics','Reports & charts','_lv(\'reports\')')
      +_tile('fa-building-user','--P','--Pl','Parties','View all','_lv(\'parties\')')
      +'</div>';
    _fabCb=_mNewJob;document.getElementById('fab').classList.add('on');
  } else {
    html+='<div class="home-grid">'
      +_tile('fa-clipboard-list','--P','--Pl','All Jobs','View all','_lv(\'jobs\')')
      +_tile('fa-truck','--T','--Tl','Dispatch',dispDue.length+' ready','_lv(\'dispatch\')')
      +_tile('fa-magnifying-glass-chart','--V','--Vl','QC Entry','Quality check','_lv(\'qc\')')
      +_tile('fa-triangle-exclamation','--R','--Rl','Downtime','Log issue','_lv(\'downtime\')')
      +'</div>';
  }
  // Recent jobs
  var recent=jobs.slice(-5).reverse();
  if(recent.length){
    html+='<div class="sec-head"><div class="sec-title">Recent Jobs</div><span class="chip" onclick="_lv(\'jobs\')" style="cursor:pointer">View all →</span></div>';
    recent.forEach(function(j){html+=_jobCard(j,false);});
  }
  c.innerHTML=html;
}

function _vOpHome(){
  var myM=(_U&&_U.machine)||'';
  var jobs=(_D.jobs||[]).filter(function(j){return(!myM||j['Machine Assigned']===myM)&&j['Print Status']!=='Done';}).sort(function(a,b){return(_n(a['Priority'])||5)-(_n(b['Priority'])||5);});
  var done=(_D.jobs||[]).filter(function(j){return j['Machine Assigned']===myM&&j['Print Status']==='Done';}).length;
  var html=(myM?'<div class="alert info"><i class="fa-solid fa-gears"></i>Machine: <b>'+myM+'</b></div>':'')
    +'<div class="kpi-row">'+_kpi('My Queue',jobs.length,'fa-list-check','--A','--Al')+_kpi('Done Today',done,'fa-circle-check','--G','--Gl')+'</div>'
    +'<div class="sec-head"><div class="sec-title">Jobs Queue — Priority Order</div></div>';
  if(!jobs.length) html+='<div class="empty"><i class="fa-solid fa-circle-check"></i><p>No pending jobs on your machine!</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,true);});
  document.getElementById('content').innerHTML=html;
}

function _vCutHome(){
  var jobs=(_D.jobs||[]).filter(function(j){return j['Cut Status']!=='Done';}).sort(function(a,b){return(_n(a['Priority'])||5)-(_n(b['Priority'])||5);});
  var done=(_D.jobs||[]).filter(function(j){return j['Cut Status']==='Done';}).length;
  var html='<div class="kpi-row">'+_kpi('Cut Queue',jobs.length,'fa-scissors','--O','--Ol')+_kpi('Done Today',done,'fa-circle-check','--G','--Gl')+'</div>'
    +'<div class="sec-head"><div class="sec-title">Cutting Queue — Priority Order</div></div>';
  if(!jobs.length) html+='<div class="empty"><i class="fa-solid fa-scissors"></i><p>No cutting jobs pending!</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,true);});
  document.getElementById('content').innerHTML=html;
}

function _vViewerHome(){
  var jobs=_D.jobs||[],invs=_D.invoices||[];
  var complete=jobs.filter(function(j){return j['Job Status']==='Complete';});
  var outstanding=invs.filter(function(i){return i['Status']==='Pending'||i['Status']==='Overdue';}).reduce(function(s,i){return s+_n(i['Net Payable (Formula)']);},0);
  var totalBilled=invs.reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var html='<div class="kpi-row">'
    +_kpi('Total Jobs',jobs.length,'fa-clipboard-list','--A','--Al')+_kpi('Complete',complete.length,'fa-circle-check','--G','--Gl')
    +_kpi('Total Billed','₹'+_f(totalBilled),'fa-indian-rupee-sign','--V','--Vl')+_kpi('Outstanding','₹'+_f(outstanding),'fa-hourglass-half','--R','--Rl')
    +'</div><div class="sec-head"><div class="sec-title">Recent Jobs</div></div>';
  jobs.slice(-6).reverse().forEach(function(j){html+=_jobCard(j,false);});
  document.getElementById('content').innerHTML=html;
}

/* ── JOBS ────────────────────────────────────────────── */
function _vJobs(){
  var role=_U?_U.role:'viewer';
  var jobs=(_D.jobs||[]).slice();
  if(role==='operator')jobs=jobs.filter(function(j){return j['Machine Assigned']===(_U.machine||'');});
  if(role==='admin'){_fabCb=_mNewJob;document.getElementById('fab').classList.add('on');}
  var stOpts=['all','Pending','In Progress','Done - Dispatch Pending','Complete'];
  var html='<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i>'
    +'<input id="jobSearch" placeholder="Search job, party, ID…" oninput="_jSrch(this.value)"></div>'
    +'<div class="filter-row">'+stOpts.map(function(s){return '<div class="pill'+(_jFilter===s?' on':'')+'" onclick="_jFlt(\''+s+'\')">'+(s==='all'?'All':s)+'</div>';}).join('')+'</div>';
  var filtered=jobs.filter(function(j){
    var ms=_jFilter==='all'||j['Job Status']===_jFilter;
    var q=(_jSearch||'').toLowerCase();
    var mr=!q||(j['Job ID']||'').toLowerCase().includes(q)||(j['Job Name / Description']||'').toLowerCase().includes(q)||(j['Party Name']||'').toLowerCase().includes(q);
    return ms&&mr;
  }).sort(function(a,b){return(_n(a['Priority'])||5)-(_n(b['Priority'])||5);});
  html+='<div class="sec-head"><div class="sec-title">'+filtered.length+' jobs</div></div>';
  if(!filtered.length)html+='<div class="empty"><i class="fa-solid fa-clipboard-list"></i><p>No jobs match filter</p></div>';
  else filtered.forEach(function(j){html+=_jobCard(j,role!=='viewer');});
  document.getElementById('content').innerHTML=html;
  var s=document.getElementById('jobSearch');if(s&&_jSearch)s.value=_jSearch;
}
function _jFlt(f){_jFilter=f;_vJobs();} function _jSrch(v){_jSearch=v;}

/* ── HISTORY ─────────────────────────────────────────── */
function _vHistory(){
  var role=_U?_U.role:'viewer';
  var jobs=_D.jobs||[];
  if(role==='operator')jobs=jobs.filter(function(j){return j['Machine Assigned']===(_U.machine||'')&&j['Print Status']==='Done';});
  else if(role==='cutting')jobs=jobs.filter(function(j){return j['Cut Status']==='Done';});
  jobs=jobs.slice().reverse();
  var html='<div class="sec-head"><div class="sec-title">'+jobs.length+' completed</div></div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-clock-rotate-left"></i><p>No history yet</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,false);});
  document.getElementById('content').innerHTML=html;
}

/* ── JOB CARD ────────────────────────────────────────── */
function _jobCard(j,showAct){
  var id=j['Job ID']||'—',name=j['Job Name / Description']||'—',party=j['Party Name']||'—';
  var machine=j['Machine Assigned']||'—',pri=parseInt(j['Priority']||j['Priority (1-5)']||3);
  var cutSt=j['Cut Status']||'Pending',printSt=j['Print Status']||'Pending';
  var disSt=j['Dispatch Status']||'Pending',jobSt=j['Job Status']||'Pending';
  var delayed=j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED';
  var role=_U?_U.role:'viewer';
  var h='<div class="job-card p'+Math.min(5,Math.max(1,pri))+'" onclick="_mJobDetail(\''+_e(id)+'\')">'
    +'<div class="jc-header"><div style="flex:1"><div class="jc-id">'+_e(id)+' · P'+pri+(delayed?' · <span style="color:var(--R)">⚠ DELAYED</span>':'')+'</div>'
    +'<div class="jc-name">'+_e(name)+'</div><div class="jc-party"><i class="fa-solid fa-building" style="font-size:10px"></i> '+_e(party)+'</div>'
    +'</div><div style="flex-shrink:0">'+_stBadge(jobSt)+'</div></div>'
    +'<div class="jc-tags"><span class="badge bx"><i class="fa-solid fa-gears" style="font-size:9px"></i> '+_e(machine)+'</span>'
    +'<span class="badge '+_cBadge(cutSt)+'">✂ '+cutSt+'</span>'
    +'<span class="badge '+_pBadge(printSt)+'">🖨 '+printSt+'</span>'
    +(j['Promised Date']?'<span class="badge bx"><i class="fa-regular fa-calendar" style="font-size:9px"></i> '+j['Promised Date']+'</span>':'')
    +'</div>';
  if(showAct){
    h+='<div class="jc-actions">';
    if((role==='cutting'||role==='admin'||role==='supervisor')&&cutSt!=='Done')
      h+='<button class="btn btn-sm btnO" onclick="event.stopPropagation();_mCut(\''+_e(id)+'\')"><i class="fa-solid fa-scissors"></i> Cut</button>';
    if((role==='operator'||role==='admin'||role==='supervisor')&&cutSt==='Done'&&printSt!=='Done')
      h+='<button class="btn btn-sm btnA" onclick="event.stopPropagation();_mPrint(\''+_e(id)+'\')"><i class="fa-solid fa-print"></i> Print</button>';
    if((role==='admin'||role==='supervisor')&&printSt==='Done'&&disSt==='Pending')
      h+='<button class="btn btn-sm btnT" onclick="event.stopPropagation();_mDispatchJob(\''+_e(id)+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>';
    if(role==='admin'&&disSt==='Done'&&!j['Billed (Y/N)'])
      h+='<button class="btn btn-sm btnG" onclick="event.stopPropagation();_mInvoice(\''+_e(id)+'\')"><i class="fa-solid fa-file-invoice"></i> Invoice</button>';
    if((role==='admin'||role==='supervisor')&&printSt==='Done'&&!j['QC Done (Y/N)'])
      h+='<button class="btn btn-sm btnV" onclick="event.stopPropagation();_mNewQCForJob(\''+_e(id)+'\')"><i class="fa-solid fa-magnifying-glass-chart"></i> QC</button>';
    h+='</div>';
  }
  return h+'</div>';
}
function _cBadge(s){return s==='Done'?'bg':s==='In Progress'?'bb':'bx';}
function _pBadge(s){return s==='Done'?'bg':s==='In Progress'?'bv':'bx';}
function _stBadge(s){var m={'Pending':'bx','In Progress':'bb','Done - Dispatch Pending':'bt','Complete':'bg'};return '<span class="badge '+(m[s]||'bx')+'">'+s+'</span>';}

/* ── PARTIES ─────────────────────────────────────────── */
function _vParties(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'){_fabCb=_mNewParty;document.getElementById('fab').classList.add('on');}
  var pts=_D.parties||[];
  document.getElementById('content').innerHTML='<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i>'
    +'<input id="ptSrch" placeholder="Search party name…" oninput="_ptRender(this.value)"></div><div id="ptList"></div>';
  window._ptRender=function(q){
    q=(q||'').toLowerCase();
    var flt=pts.filter(function(p){return!q||(p['Party Name']||'').toLowerCase().includes(q);});
    document.getElementById('ptList').innerHTML=flt.length?flt.map(function(p){
      var st=p['Status']||'Active';
      var jobs=(_D.jobs||[]).filter(function(j){return j['Party ID']===p['Party ID'];}).length;
      return '<div class="card" onclick="_mPartyDetail(\''+_e(p['Party ID']||'')+'\')"><div class="card-head">'
        +'<div class="card-title"><div style="width:32px;height:32px;border-radius:8px;background:var(--Al);display:flex;align-items:center;justify-content:center;color:var(--A);font-weight:700;font-size:13px">'+(p['Party Name']||'?')[0]+'</div>'+_e(p['Party Name']||'—')+'</div>'
        +'<span class="badge '+(st==='Active'?'bg':st==='Blacklisted'?'br':'bx')+'">'+st+'</span></div><div class="card-body">'
        +'<div class="info-row"><span class="ir-l">Contact</span><span class="ir-v">'+_e(p['Contact Person 1']||'—')+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Mobile</span><span class="ir-v">'+_e(p['Mobile 1']||'—')+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:var(--R);font-weight:700">₹'+_f(_n(p['Outstanding Balance (Rs)']))+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Jobs</span><span class="ir-v">'+jobs+'</span></div>'
        +(p['WhatsApp 1']?'<div style="margin-top:10px"><button class="wa-btn btn-sm" onclick="event.stopPropagation();_waParty(\''+_e(p['WhatsApp 1'])+'\',\''+_e(p['Contact Person 1']||'')+'\')"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button></div>':'')
        +'</div></div>';
    }).join(''):'<div class="empty"><i class="fa-solid fa-building-user"></i><p>No parties found</p></div>';
  };
  _ptRender('');
}

/* ── STOCK ───────────────────────────────────────────── */
function _vStock(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mStockIn;document.getElementById('fab').classList.add('on');}
  var stock=(_D.stock||[]).sort(function(a,b){return _n(b['Usage %  (Formula)'])-_n(a['Usage %  (Formula)']);});
  var avail=stock.filter(function(s){return s['Status']==='Available';}).length;
  var partial=stock.filter(function(s){return s['Status']==='Partial';}).length;
  var html='<div class="kpi-row">'+_kpi('Available',avail,'fa-check-circle','--G','--Gl')+_kpi('Partial',partial,'fa-circle-half-stroke','--O','--Ol')+'</div>';
  if(!stock.length)html+='<div class="empty"><i class="fa-solid fa-boxes-stacked"></i><p>No stock entries</p></div>';
  else stock.forEach(function(s){
    var pct=Math.min(100,_n(s['Usage %  (Formula)']));
    var rem=_n(s['Remaining Gross (Formula)']),good=_n(s['Good Gross']);
    var st=s['Status']||'Available',barC=pct>=80?'var(--R)':pct>=50?'var(--O)':'var(--G)';
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-layer-group"></i>'+_e(s['Stock ID']||'—')+' — '+_e(s['Paper Type']||'—')+'</div>'
      +'<span class="badge '+(st==='Available'?'bg':st==='Partial'?'bo':'bx')+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(s['Party Name']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Size / GSM</span><span class="ir-v">'+(s['Sheet Size (inches)']||'—')+' / '+(s['GSM (Weight)']||'—')+' GSM</span></div>'
      +'<div class="info-row"><span class="ir-l">Inward Date</span><span class="ir-v">'+(s['Inward Date']||'—')+'</span></div>'
      +'<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><span style="color:var(--tx2)">Usage</span><span style="font-weight:700">'+rem.toFixed(0)+' / '+good.toFixed(0)+' gross</span></div>'
      +'<div class="prog-wrap"><div class="prog-bar" style="width:'+pct+'%;background:'+barC+'"></div></div>'
      +'<div style="font-size:11px;color:var(--tx3);text-align:right;margin-top:3px">'+pct.toFixed(1)+'% used</div></div>'
      +(pct>=80?'<div class="alert warn" style="margin-top:10px;margin-bottom:0"><i class="fa-solid fa-triangle-exclamation"></i>Low stock — reorder soon</div>':'')
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── INVOICES ────────────────────────────────────────── */
function _vInvoices(){
  var role=_U?_U.role:'viewer';
  var invs=(_D.invoices||[]).slice().reverse();
  var pending=invs.filter(function(i){return i['Status']==='Pending';});
  var overdue=invs.filter(function(i){return i['Status']==='Overdue';});
  var paid=invs.filter(function(i){return i['Status']==='Paid';});
  var totalPend=pending.reduce(function(s,i){return s+_n(i['Net Payable (Formula)']||i['Net Payable']);},0);
  var filter=_vInvoices._f||'all';
  var html='<div class="kpi-row">'
    +_kpi('Pending',pending.length,'fa-hourglass-half','--O','--Ol')+_kpi('Overdue',overdue.length,'fa-circle-exclamation','--R','--Rl')
    +_kpi('Paid',paid.length,'fa-circle-check','--G','--Gl')+_kpi('Due Amount','₹'+_f(totalPend),'fa-indian-rupee-sign','--A','--Al')
    +'</div>'
    +'<div class="filter-row">'
    +'<div class="pill'+(filter==='all'?' on':'')+'" onclick="_vInvoices._f=\'all\';_vInvoices()">All</div>'
    +'<div class="pill'+(filter==='Pending'?' on':'')+'" onclick="_vInvoices._f=\'Pending\';_vInvoices()">Pending</div>'
    +'<div class="pill'+(filter==='Overdue'?' on':'')+'" onclick="_vInvoices._f=\'Overdue\';_vInvoices()">Overdue</div>'
    +'<div class="pill'+(filter==='Paid'?' on':'')+'" onclick="_vInvoices._f=\'Paid\';_vInvoices()">Paid</div>'
    +'</div>';
  var flt=filter==='all'?invs:invs.filter(function(i){return i['Status']===filter;});
  if(!flt.length)html+='<div class="empty"><i class="fa-solid fa-file-invoice"></i><p>No invoices</p></div>';
  else flt.forEach(function(inv){
    var st=inv['Status']||'Pending',stCls=st==='Paid'?'bg':st==='Overdue'?'br':st==='Partial'?'bo':'bb';
    var party=(_D.parties||[]).find(function(p){return p['Party ID']===inv['Party ID'];})||{};
    var waNum=party['WhatsApp 1']||party['Mobile 1']||'';
    var netPay=_n(inv['Net Payable (Formula)']||inv['Net Payable']);
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-file-invoice" style="color:var(--A)"></i>'+_e(inv['Invoice No.']||'—')+'</div>'
      +'<span class="badge '+stCls+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(inv['Party Name']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Invoice Date</span><span class="ir-v">'+(inv['Invoice Date']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Due Date</span><span class="ir-v" style="'+(st==='Overdue'?'color:var(--R);font-weight:700':'')+'">'+( inv['Due Date']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Final Amount</span><span class="ir-v" style="font-size:16px;font-weight:700">₹'+_f(_n(inv['Final Amount']))+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Net Payable</span><span class="ir-v">₹'+_f(netPay)+'</span></div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:10px">'
      +(role==='admin'&&st!=='Paid'?'<button class="btn btn-sm btnG" onclick="_mRecordPayment(\''+_e(inv['Invoice No.']||'')+'\')"><i class="fa-solid fa-indian-rupee-sign"></i> Payment</button>':'')
      +(waNum&&role!=='viewer'?'<button class="wa-btn btn-sm" onclick="_waPaymentReminder(\''+_e(waNum)+'\',\''+_e(inv['Invoice No.']||'')+'\',\''+_f(netPay)+'\',\''+_e(inv['Due Date']||'')+'\',\''+_e(party['Contact Person 1']||'')+'\')"><i class="fa-brands fa-whatsapp"></i> Remind</button>':'')
      +'</div></div></div>';
  });
  document.getElementById('content').innerHTML=html;
}
_vInvoices._f='all';

/* ── PAYMENTS ────────────────────────────────────────── */
function _vPayments(){
  var pays=(_D.payments||[]).slice().reverse();
  var total=pays.reduce(function(s,p){return s+_n(p['Amount Received (Rs)']);},0);
  var html='<div class="kpi-row">'
    +_kpi('Receipts',pays.length,'fa-receipt','--A','--Al')
    +_kpi('Total Received','₹'+_f(total),'fa-money-bill-wave','--G','--Gl')
    +'</div>';
  if(!pays.length)html+='<div class="empty"><i class="fa-solid fa-indian-rupee-sign"></i><p>No payments recorded</p></div>';
  else pays.forEach(function(p){
    html+='<div class="card"><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Pay ID</span><span class="ir-v">'+_e(p['Payment ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(p['Payment Date']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(p['Party Name']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Invoice</span><span class="ir-v">'+_e(p['Invoice No.']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Amount</span><span class="ir-v" style="color:var(--G);font-size:16px;font-weight:700">₹'+_f(_n(p['Amount Received (Rs)']))+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Mode</span><span class="ir-v"><span class="badge bb">'+_e(p['Payment Mode']||'—')+'</span></span></div>'
      +(p['Reference No. / UTR / Cheque No.']?'<div class="info-row"><span class="ir-l">Ref/UTR</span><span class="ir-v" style="font-size:11px">'+_e(p['Reference No. / UTR / Cheque No.'])+'</span></div>':'')
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── EXPENSES ────────────────────────────────────────── */
function _vExpenses(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mNewExpense;document.getElementById('fab').classList.add('on');}
  var exps=(_D.expenses||[]).slice().reverse();
  var total=exps.reduce(function(s,e){return s+_n(e['Total (Formula)']);},0);
  var byCat={};exps.forEach(function(e){var cat=e['Category']||'Other';byCat[cat]=(byCat[cat]||0)+_n(e['Total (Formula)']);});
  var html='<div class="kpi-row">'+_kpi('Expenses',exps.length,'fa-receipt','--O','--Ol')+_kpi('Total Spend','₹'+_f(total),'fa-money-bill','--R','--Rl')+'</div>';
  var catKeys=Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a];});
  if(catKeys.length){
    var maxC=Math.max.apply(null,catKeys.map(function(k){return byCat[k];}))||1;
    var catC=['#FBBC05','#4285F4','#34A853','#EA4335','#7B1FA2','#00897B'];
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-bar"></i>Expense Breakdown</div></div><div class="card-body"><div class="chart-bar-group">';
    catKeys.forEach(function(k,i){var pct=(byCat[k]/maxC*100).toFixed(0);html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+k+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:'+catC[i%catC.length]+'"></div></div><span class="chart-bar-val">₹'+_f(byCat[k])+'</span></div>';});
    html+='</div></div></div>';
  }
  if(!exps.length)html+='<div class="empty"><i class="fa-solid fa-receipt"></i><p>No expenses recorded</p></div>';
  else exps.forEach(function(e){
    html+='<div class="card"><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(e['Date']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Category</span><span class="ir-v"><span class="badge bam">'+_e(e['Category']||'—')+'</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Item</span><span class="ir-v">'+_e(e['Item Description']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Vendor</span><span class="ir-v">'+_e(e['Vendor Name']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Total</span><span class="ir-v" style="color:var(--R);font-weight:700">₹'+_f(_n(e['Total (Formula)']))+'</span></div>'
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── MACHINES ────────────────────────────────────────── */
function _vMachines(){
  var machs=_D.machines||[],jobs=_D.jobs||[];
  var html='';
  if(!machs.length)html='<div class="empty"><i class="fa-solid fa-gears"></i><p>No machines configured</p></div>';
  else machs.forEach(function(m){
    var name=m['Machine Name']||'—',st=m['Current Status']||'Active';
    var activeJ=jobs.filter(function(j){return j['Machine Assigned']===name&&j['Print Status']==='In Progress';});
    var totalJ=jobs.filter(function(j){return j['Machine Assigned']===name;}).length;
    var maint=m['Next Maintenance Due']||'',maintOD=maint&&maint<=_today();
    html+='<div class="card"><div class="card-head">'
      +'<div class="card-title"><div style="width:36px;height:36px;border-radius:10px;background:var(--Pl);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-gears" style="color:var(--P)"></i></div>'+_e(name)+'</div>'
      +'<span class="badge '+(st==='Active'?'bg':st==='On Repair'?'br':'bx')+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Brand / Model</span><span class="ir-v">'+_e(m['Make/Brand']||'—')+' '+_e(m['Model No.']||'')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Operator</span><span class="ir-v">'+_e(m['Assigned Operator']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Speed</span><span class="ir-v">'+(_n(m['Current Speed (sheets/hr)'])||0).toLocaleString()+' sh/hr</span></div>'
      +'<div class="info-row"><span class="ir-l">Active Jobs</span><span class="ir-v"><span class="badge '+(activeJ.length?'bb':'bx')+'">'+activeJ.length+' in progress</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Total Jobs</span><span class="ir-v">'+totalJ+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Next Maintenance</span><span class="ir-v" style="'+(maintOD?'color:var(--R);font-weight:700':'')+'">'+_e(maint||'—')+(maintOD?' ⚠️':'')+'</span></div>'
      +(maintOD?'<div class="alert danger" style="margin-top:8px;margin-bottom:0"><i class="fa-solid fa-wrench"></i>Maintenance overdue!</div>':'')
      +'<div style="margin-top:10px"><div class="prog-wrap"><div class="prog-bar" style="width:'+(totalJ?Math.min(100,activeJ.length/Math.max(1,totalJ)*100):0).toFixed(0)+'%;background:var(--A)"></div></div></div>'
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── QC ──────────────────────────────────────────────── */
function _vQC(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mNewQC;document.getElementById('fab').classList.add('on');}
  var qcs=(_D.qc||[]).slice().reverse();
  var passed=qcs.filter(function(q){return q['Pass/Fail']==='Pass';}).length;
  var failed=qcs.filter(function(q){return q['Pass/Fail']==='Fail';}).length;
  var html='<div class="kpi-row">'
    +_kpi('Total QC',qcs.length,'fa-magnifying-glass-chart','--A','--Al')+_kpi('Pass',passed,'fa-circle-check','--G','--Gl')
    +_kpi('Fail',failed,'fa-circle-xmark','--R','--Rl')+_kpi('Pass Rate',(qcs.length?Math.round(passed/qcs.length*100):0)+'%','fa-percent','--V','--Vl')
    +'</div>';
  if(!qcs.length)html+='<div class="empty"><i class="fa-solid fa-magnifying-glass-chart"></i><p>No QC entries yet</p></div>';
  else qcs.forEach(function(q){
    var pf=q['Pass/Fail']||'Pending',score=_n(q['Overall Score (Formula)']);
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-magnifying-glass-chart"></i>'+_e(q['QC ID']||'—')+'</div>'
      +'<span class="badge '+(pf==='Pass'?'bg':pf==='Fail'?'br':'bo')+'">'+pf+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Job</span><span class="ir-v">'+_e(q['Job Name']||q['Job ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Stage</span><span class="ir-v"><span class="badge bx">'+_e(q['QC Stage']||'—')+'</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Score</span><span class="ir-v" style="font-weight:700;color:'+(score>=4?'var(--G)':score>=3?'var(--O)':'var(--R)')+'">'+score.toFixed(1)+' / 5</span></div>'
      +'<div style="margin-top:8px"><div class="prog-wrap"><div class="prog-bar" style="width:'+(score/5*100).toFixed(0)+'%;background:'+(score>=4?'var(--G)':score>=3?'var(--O)':'var(--R)')+'"></div></div></div>'
      +(q['Rejection Qty']?'<div class="info-row"><span class="ir-l">Rejection</span><span class="ir-v" style="color:var(--R)">'+q['Rejection Qty']+' qty</span></div>':'')
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── DOWNTIME ────────────────────────────────────────── */
function _vDowntime(){
  _fabCb=_mNewDowntime;document.getElementById('fab').classList.add('on');
  var dts=(_D.downtime||[]).slice().reverse();
  var totalCost=dts.reduce(function(s,d){return s+_n(d['Repair Cost (Rs)']);},0);
  var html='<div class="kpi-row">'
    +_kpi('Total Events',dts.length,'fa-triangle-exclamation','--R','--Rl')+_kpi('Repair Cost','₹'+_f(totalCost),'fa-wrench','--O','--Ol')
    +'</div>';
  if(!dts.length)html+='<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i><p>No downtime logged</p></div>';
  else dts.forEach(function(d){
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-triangle-exclamation" style="color:var(--R)"></i>'+_e(d['Log ID']||'—')+'</div>'
      +'<span class="badge '+(d['Preventable (Y/N)']==='Y'?'bo':'br')+'">'+_e(d['Reason Category']||'—')+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Machine</span><span class="ir-v">'+_e(d['Machine Name']||d['Machine ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Date / Time</span><span class="ir-v">'+(d['Date']||'—')+' '+(d['Start Time']||'')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Description</span><span class="ir-v" style="font-size:12px;max-width:65%">'+_e(d['Reason Description']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Repair Cost</span><span class="ir-v" style="color:var(--R)">₹'+_f(_n(d['Repair Cost (Rs)']))+'</span></div>'
      +(d['Action Taken']?'<div class="info-row"><span class="ir-l">Action</span><span class="ir-v" style="font-size:12px">'+_e(d['Action Taken'])+'</span></div>':'')
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── DISPATCH ────────────────────────────────────────── */
function _vDispatch(){
  var jobs=(_D.jobs||[]).filter(function(j){return j['Print Status']==='Done'&&j['Dispatch Status']==='Pending';});
  var html='<div class="alert info"><i class="fa-solid fa-truck"></i>'+jobs.length+' job(s) ready to dispatch</div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-truck"></i><p>No jobs pending dispatch</p></div>';
  else jobs.forEach(function(j){
    var party=(_D.parties||[]).find(function(p){return p['Party ID']===j['Party ID'];})||{};
    html+='<div class="card"><div class="card-head"><div class="card-title">'+_e(j['Job Name / Description']||'—')+'</div><span class="badge bt">Ready</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Job ID</span><span class="ir-v">'+_e(j['Job ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(j['Party Name']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">QC</span><span class="ir-v"><span class="badge '+(j['QC Pass/Fail']==='Pass'?'bg':'bo')+'">'+_e(j['QC Pass/Fail']||'Pending')+'</span></span></div>'
      +'<button class="btn btnT btn-full" style="margin-top:10px" onclick="_mDispatchJob(\''+_e(j['Job ID']||'')+'\')"><i class="fa-solid fa-truck"></i> Mark Dispatched</button>'
      +(party['WhatsApp 1']?'<button class="wa-btn btn-full" style="margin-top:7px" onclick="_waParty(\''+_e(party['WhatsApp 1'])+'\',\''+_e(party['Contact Person 1']||'')+'\')"><i class="fa-brands fa-whatsapp"></i> Notify Party</button>':'')
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── PLATES ──────────────────────────────────────────── */
function _vPlates(){
  var plates=(_D.plates||[]).slice().reverse();
  var html='<div class="kpi-row">'+_kpi('Total Plates',plates.length,'fa-layer-group','--A','--Al')
    +_kpi('Active',plates.filter(function(p){return !p['Scrapped (Y/N)'];}).length,'fa-check','--G','--Gl')+'</div>';
  if(!plates.length)html+='<div class="empty"><i class="fa-solid fa-layer-group"></i><p>No plates recorded</p></div>';
  else plates.forEach(function(p){
    html+='<div class="card"><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Plate ID</span><span class="ir-v">'+_e(p['Plate ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Job</span><span class="ir-v">'+_e(p['Job Name']||p['Job ID']||'—')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Type / Color</span><span class="ir-v">'+_e((p['Plate Type']||'—')+' — '+(p['Color (C/M/Y/K/Spot)']||'—'))+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Status</span><span class="ir-v"><span class="badge '+(p['Scrapped (Y/N)']?'br':(p['Reuse OK? (Formula)']!=='SCRAP'?'bg':'bo'))+'">'+_e(p['Scrapped (Y/N)']?'Scrapped':(p['Reuse OK? (Formula)']||'OK'))+'</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Reused</span><span class="ir-v">'+(p['Times Reused']||0)+' / '+(p['Max Reuse Allowed']||5)+' times</span></div>'
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ── REPORTS ─────────────────────────────────────────── */
function _vReports(){
  var jobs=_D.jobs||[],invs=_D.invoices||[],exps=_D.expenses||[],pays=_D.payments||[],dts=_D.downtime||[],qcs=_D.qc||[];
  var totalBill=invs.reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var totalExp=exps.reduce(function(s,e){return s+_n(e['Total (Formula)']);},0);
  var totalPaid=pays.reduce(function(s,p){return s+_n(p['Amount Received (Rs)']);},0);
  var outstanding=totalBill-totalPaid;
  var passRate=qcs.length?Math.round(qcs.filter(function(q){return q['Pass/Fail']==='Pass';}).length/qcs.length*100):0;
  var html='<div class="kpi-row">'
    +_kpi('Revenue','₹'+_f(totalBill),'fa-indian-rupee-sign','--G','--Gl')+_kpi('Collected','₹'+_f(totalPaid),'fa-circle-check','--A','--Al')
    +_kpi('Outstanding','₹'+_f(outstanding),'fa-hourglass-half','--R','--Rl')+_kpi('QC Pass Rate',passRate+'%','fa-percent','--V','--Vl')
    +'</div>';
  // Jobs by machine
  var machs=['Machine 1','Machine 2','Machine 3'],mColors=['#1A73E8','#188038','#E37400'];
  var mMax=Math.max.apply(null,machs.map(function(m){return jobs.filter(function(j){return j['Machine Assigned']===m;}).length;}))||1;
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-gears"></i>Jobs Per Machine</div></div><div class="card-body"><div class="chart-bar-group">';
  machs.forEach(function(m,i){var cnt=jobs.filter(function(j){return j['Machine Assigned']===m;}).length;var pct=(cnt/mMax*100).toFixed(0);html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+m+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:'+mColors[i]+'"></div></div><span class="chart-bar-val">'+cnt+'</span></div>';});
  html+='</div></div></div>';
  // Status donut
  var stMap={'Complete':0,'In Progress':0,'Pending':0,'Done - Dispatch Pending':0},stC=['#188038','#1A73E8','#E37400','#007B83'];
  jobs.forEach(function(j){var s=j['Job Status']||'Pending';if(stMap[s]!==undefined)stMap[s]++;});
  var tot=jobs.length||1,conic=[],cum=0;
  Object.keys(stMap).forEach(function(k,i){var p=stMap[k]/tot*100;conic.push(stC[i]+' '+cum.toFixed(1)+'% '+(cum+p).toFixed(1)+'%');cum+=p;});
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Job Status</div></div><div class="card-body"><div class="donut-wrap">'
    +'<div class="donut" style="background:conic-gradient('+conic.join(',')+')">'
    +'</div><div class="donut-legend">'+Object.keys(stMap).map(function(k,i){return '<div class="donut-item"><div class="donut-dot" style="background:'+stC[i]+'"></div>'+k+' <b style="margin-left:auto">'+stMap[k]+'</b></div>';}).join('')+'</div></div></div></div>';
  // Top parties
  var pBill={};invs.forEach(function(i){var pid=i['Party Name']||'Unknown';pBill[pid]=(pBill[pid]||0)+_n(i['Final Amount']);});
  var topPts=Object.keys(pBill).sort(function(a,b){return pBill[b]-pBill[a];}).slice(0,5);
  if(topPts.length){
    var pMax=pBill[topPts[0]]||1;
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-trophy"></i>Top Parties by Revenue</div></div><div class="card-body"><div class="chart-bar-group">';
    topPts.forEach(function(pt){var pct=(pBill[pt]/pMax*100).toFixed(0);html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+_e(pt)+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:#1A73E8"></div></div><span class="chart-bar-val">₹'+_f(pBill[pt])+'</span></div>';});
    html+='</div></div></div>';
  }
  // P&L
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-scale-balanced"></i>P&L Summary</div></div><div class="card-body">'
    +'<div class="info-row"><span class="ir-l">Revenue Billed</span><span class="ir-v" style="color:var(--G);font-weight:700">₹'+_f(totalBill)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Collected</span><span class="ir-v" style="color:var(--A);font-weight:700">₹'+_f(totalPaid)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:var(--R);font-weight:700">₹'+_f(outstanding)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Expenses</span><span class="ir-v" style="color:var(--O);font-weight:700">₹'+_f(totalExp)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Gross Profit</span><span class="ir-v" style="color:'+(totalBill-totalExp>=0?'var(--G)':'var(--R)')+';font-weight:700">₹'+_f(totalBill-totalExp)+'</span></div>'
    +'</div></div>';
  // Downtime
  var dtM={};dts.forEach(function(d){var m=d['Machine Name']||'Unknown';dtM[m]=(dtM[m]||0)+1;});
  if(Object.keys(dtM).length){
    var dtMax=Math.max.apply(null,Object.values(dtM))||1;
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-triangle-exclamation"></i>Downtime by Machine</div></div><div class="card-body"><div class="chart-bar-group">';
    Object.keys(dtM).forEach(function(m){var pct=(dtM[m]/dtMax*100).toFixed(0);html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+_e(m)+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:var(--R)"></div></div><span class="chart-bar-val">'+dtM[m]+'x</span></div>';});
    html+='</div></div></div>';
  }
  document.getElementById('content').innerHTML=html;
}

/* ── STAFF ───────────────────────────────────────────── */
function _vStaff(){
  var users=_D.users||[];
  var rC={admin:'--R',supervisor:'--V',operator:'--A',cutting:'--O',viewer:'--T'};
  var html='<div class="kpi-row">'+_kpi('Total Staff',users.length,'fa-users','--A','--Al')+_kpi('Active',users.filter(function(u){return u['Active (Y/N)']!=='N';}).length,'fa-circle-check','--G','--Gl')+'</div>';
  if(!users.length)html+='<div class="empty"><i class="fa-solid fa-id-badge"></i><p>No staff data</p></div>';
  else users.forEach(function(u){
    var role=(u['Role']||'').toLowerCase();
    html+='<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:14px">'
      +'<div style="width:44px;height:44px;border-radius:50%;background:var('+(rC[role]||'--tx3')+');color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;flex-shrink:0">'+(u['Full Name']||'?')[0].toUpperCase()+'</div>'
      +'<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--tx)">'+_e(u['Full Name']||'—')+'</div>'
      +'<div style="font-size:12px;color:var(--tx2)">'+_rl(role)+(u['Machine Assigned']?' · '+u['Machine Assigned']:'')+'</div>'
      +'<div style="font-size:11px;color:var(--tx3)">'+_e(u['Personal Email']||'—')+'</div></div>'
      +'<span class="badge '+(u['Active (Y/N)']==='Y'||u['Active (Y/N)']===true?'bg':'bx')+'">'+(u['Active (Y/N)']==='Y'||u['Active (Y/N)']===true?'Active':'Inactive')+'</span>'
      +'</div></div>';
  });
  document.getElementById('content').innerHTML=html;
}

/* ═══ MODALS ════════════════════════════════════════════ */

function _mJobDetail(jobId){
  var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(!j){_toast('Job not found');return;}
  var role=_U?_U.role:'viewer';
  var cutSt=j['Cut Status']||'Pending',printSt=j['Print Status']||'Pending';
  var disSt=j['Dispatch Status']||'Pending',qcPF=j['QC Pass/Fail']||'Pending';
  var steps=[{l:'Cut',done:cutSt==='Done',act:cutSt==='In Progress'},{l:'Print',done:printSt==='Done',act:printSt==='In Progress'},
    {l:'QC',done:qcPF==='Pass',act:!!(j['QC Done (Y/N)']&&qcPF!=='Pass')},{l:'Dispatch',done:disSt==='Done',act:false},{l:'Invoice',done:!!j['Billed (Y/N)'],act:false}];
  var stepHtml='<div class="steps">';
  steps.forEach(function(s,i){
    var cls=s.done?'done':s.act?'active':'wait';
    stepHtml+='<div class="step-item"><div style="display:flex;align-items:center">'
      +'<div class="step-dot '+cls+'">'+(s.done?'<i class="fa-solid fa-check" style="font-size:10px"></i>':(i+1))+'</div>'
      +(i<steps.length-1?'<div class="step-line'+(s.done?' done':'')+'"></div>':'')
      +'</div><div class="step-lbl">'+s.l+'</div></div>';
  });
  stepHtml+='</div>';
  var body=stepHtml+'<div class="form-sec">Job Info</div>'
    +'<div class="info-row"><span class="ir-l">Job ID</span><span class="ir-v">'+_e(j['Job ID']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(j['Party Name']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Category</span><span class="ir-v">'+_e(j['Job Category']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Qty (Execute/Order)</span><span class="ir-v">'+_e(String(j['Execute Qty']||'—'))+' / '+_e(String(j['Order Qty']||'—'))+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Paper</span><span class="ir-v">'+_e((j['Paper Type']||'—')+' '+(j['Sheet Size']||'')+' '+(j['GSM']||'')+'GSM')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Machine</span><span class="ir-v">'+_e(j['Machine Assigned']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Colors</span><span class="ir-v">'+_e(j['No. of Colors']||j['Color Names']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Priority</span><span class="ir-v"><span class="badge '+((j['Priority']||j['Priority (1-5)']||3)<=2?'br':(j['Priority']||j['Priority (1-5)']||3)<=3?'bb':'bg')+'">P'+(j['Priority']||j['Priority (1-5)']||3)+'</span></span></div>'
    +'<div class="info-row"><span class="ir-l">Promised Date</span><span class="ir-v">'+_e(j['Promised Date']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Status</span><span class="ir-v">'+_stBadge(j['Job Status']||'Pending')+(j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED'?' <span class="badge br">DELAYED</span>':'')+'</span></div>'
    +(j['Supervisor Notes']?'<div class="alert info" style="margin-top:10px"><i class="fa-solid fa-note-sticky"></i>'+_e(j['Supervisor Notes'])+'</div>':'');
  var foot='';
  if((role==='cutting'||role==='admin'||role==='supervisor')&&cutSt!=='Done')
    foot+='<button class="btn btnO" onclick="_mClose();_mCut(\''+_e(jobId)+'\')"><i class="fa-solid fa-scissors"></i> Cut</button>';
  if((role==='operator'||role==='admin'||role==='supervisor')&&cutSt==='Done'&&printSt!=='Done')
    foot+='<button class="btn btnA" onclick="_mClose();_mPrint(\''+_e(jobId)+'\')"><i class="fa-solid fa-print"></i> Print</button>';
  if((role==='admin'||role==='supervisor')&&printSt==='Done'&&!j['QC Done (Y/N)'])
    foot+='<button class="btn btnV" onclick="_mClose();_mNewQCForJob(\''+_e(jobId)+'\')"><i class="fa-solid fa-magnifying-glass-chart"></i> QC</button>';
  if((role==='admin'||role==='supervisor')&&printSt==='Done'&&qcPF==='Pass'&&disSt==='Pending')
    foot+='<button class="btn btnT" onclick="_mClose();_mDispatchJob(\''+_e(jobId)+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>';
  if(role==='admin'&&disSt==='Done'&&!j['Billed (Y/N)'])
    foot+='<button class="btn btnG" onclick="_mClose();_mInvoice(\''+_e(jobId)+'\')"><i class="fa-solid fa-file-invoice"></i> Invoice</button>';
  _mOpen(j['Job Name / Description']||jobId,body,foot||null);
}

function _mNewJob(){
  var parties=(_D.parties||[]).filter(function(p){return(p['Status']||'Active')==='Active';});
  var stocks=(_D.stock||[]).filter(function(s){return s['Status']==='Available'||s['Status']==='Partial';});
  var body='<div class="form-sec">Job Basics</div>'
    +'<div class="fg"><label>Party *</label><select id="njP"><option value="">— Select —</option>'
    +parties.map(function(p){return '<option value="'+_e(p['Party ID']||'')+'">'+_e(p['Party Name']||'')+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Job Name *</label><input id="njN" placeholder="e.g. ABC Mono Carton 300gsm"></div>'
    +'<div class="fg"><label>Category</label><select id="njCat">'+['Carton','Mono Carton','Wrapper','Brochure','Catalogue','Banner','Visiting Card','Envelope','Book Pages','Sticker','Label','Other'].map(function(c){return '<option>'+c+'</option>';}).join('')+'</select></div>'
    +'<div class="form-row"><div class="fg"><label>Order Qty *</label><input type="number" id="njOQ" placeholder="1000"></div><div class="fg"><label>Execute Qty *</label><input type="number" id="njEQ" placeholder="500"></div></div>'
    +'<div class="form-sec">Material</div>'
    +'<div class="fg"><label>Stock *</label><select id="njS"><option value="">— Select —</option>'
    +stocks.map(function(s){return '<option value="'+_e(s['Stock ID']||'')+'">'+_e((s['Stock ID']||'')+' — '+(s['Paper Type']||'')+' '+(s['Sheet Size (inches)']||''))+'</option>';}).join('')+'</select></div>'
    +'<div class="form-sec">Machine & Schedule</div>'
    +'<div class="fg"><label>Machine *</label><select id="njM"><option value="Machine 1">Machine 1 (Heidelberg)</option><option value="Machine 2">Machine 2 (Ryobi)</option><option value="Machine 3">Machine 3</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Priority *</label><select id="njPri"><option value="1">P1 — Urgent</option><option value="2">P2 — High</option><option value="3" selected>P3 — Normal</option><option value="4">P4 — Low</option><option value="5">P5 — Lowest</option></select></div>'
    +'<div class="fg"><label>Promised Date *</label><input type="date" id="njD"></div></div>'
    +'<div class="fg"><label>Colors (e.g. C,M,Y,K)</label><input id="njCol" placeholder="C,M,Y,K"></div>'
    +'<div class="fg"><label>Customer PO No.</label><input id="njPO" placeholder="PO-001"></div>';
  _mOpen('➕ New Job',body,'<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnA btn-sm" onclick="_saveNewJob()"><i class="fa-solid fa-plus"></i> Add Job</button>');
}
function _saveNewJob(){
  var d={partyId:_v('njP'),jobName:_v('njN'),category:_v('njCat'),orderQty:_v('njOQ'),execQty:_v('njEQ'),
    stockId:_v('njS'),machine:_v('njM'),priority:_v('njPri'),promDate:_v('njD'),colors:_v('njCol'),custPO:_v('njPO')};
  if(!d.partyId||!d.jobName||!d.stockId||!d.promDate){_toast('⚠️ Fill required fields');return;}
  _mLoad();
  _api('addJob',d,function(r){
    if(r.success){
      if(_D.jobs&&r.job)_D.jobs.push(r.job);
      _mClose();_toast('✅ Job added!');_lv('jobs');
      if(r.job){
        var j=r.job,op=(_D.users||[]).find(function(u){return(u['Role']||'').toLowerCase()==='operator'&&u['Machine Assigned']===j['Machine Assigned'];})||{};
        var opWA=op['WhatsApp']||op['Mobile'];
        if(opWA)setTimeout(function(){_waJobAssigned(opWA,op['Full Name']||'Operator',j['Job ID']||'',j['Job Name / Description']||'',j['Party Name']||'',j['Machine Assigned']||'',j['Priority']||j['Priority (1-5)']||3,j['Promised Date']||'');},700);
      }
    } else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mCut(jobId){
  var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(!j)return;
  _mOpen('✂️ Cut — '+jobId,
    '<div class="alert info"><i class="fa-solid fa-scissors"></i><b>'+_e(j['Job Name / Description']||jobId)+'</b></div>'
    +'<div class="fg"><label>Cut Status *</label><select id="cSt">'+['Pending','In Progress','Done'].map(function(s){return '<option value="'+s+'"'+(j['Cut Status']===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="cST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="cET"></div></div>'
    +'<div class="fg"><label>Qty Cut</label><input type="number" id="cQ" value="'+_e(String(j['Cut Qty']||''))+'"></div>'
    +'<div class="fg"><label>Remark</label><textarea id="cR">'+_e(j['Cut Remark']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnO btn-sm" onclick="_saveCut(\''+_e(jobId)+'\')"><i class="fa-solid fa-check"></i> Save</button>');
}
function _saveCut(jobId){
  var d={jobId:jobId,cutStatus:_v('cSt'),cutStart:_v('cST'),cutEnd:_v('cET'),cutQty:_v('cQ'),cutRemark:_v('cR')};
  _mLoad();
  _api('updateCut',d,function(r){
    if(r.success){
      var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});
      if(j){j['Cut Status']=d.cutStatus;j['Cut Qty']=d.cutQty;}
      _mClose();_toast('✅ Cut updated!');_lv(_V);
      if(d.cutStatus==='Done'&&j){
        var op=(_D.users||[]).find(function(u){return(u['Role']||'').toLowerCase()==='operator'&&u['Machine Assigned']===j['Machine Assigned'];})||{};
        var opWA=op['WhatsApp']||op['Mobile'];
        if(opWA)setTimeout(function(){_waCutDone(opWA,op['Full Name']||'Operator',jobId,j['Job Name / Description']||'');},600);
      }
    } else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mPrint(jobId){
  var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(!j)return;
  _mOpen('🖨️ Print — '+jobId,
    '<div class="alert ok"><i class="fa-solid fa-check"></i>Cutting done — ready to print</div>'
    +'<div class="fg"><label>Print Status *</label><select id="pSt">'+['Pending','In Progress','Done'].map(function(s){return '<option value="'+s+'"'+(j['Print Status']===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="pST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="pET"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Impressions Run</label><input type="number" id="pIR" value="'+_e(String(j['Impressions Run']||''))+'"></div><div class="fg"><label>Good Impressions</label><input type="number" id="pIG" value="'+_e(String(j['Good Impressions']||''))+'"></div></div>'
    +'<div class="fg"><label>Rejection Count</label><input type="number" id="pRej" value="'+(_n(j['Rejection Impressions'])||0)+'"></div>'
    +'<div class="fg"><label>Remark</label><textarea id="pR">'+_e(j['Print Remark']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnA btn-sm" onclick="_savePrint(\''+_e(jobId)+'\')"><i class="fa-solid fa-print"></i> Save</button>');
}
function _savePrint(jobId){
  var d={jobId:jobId,printStatus:_v('pSt'),printStart:_v('pST'),printEnd:_v('pET'),impressions:_v('pIR'),goodImp:_v('pIG'),rejectImp:_v('pRej'),printRemark:_v('pR')};
  _mLoad();
  _api('updatePrint',d,function(r){
    if(r.success){var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(j)j['Print Status']=d.printStatus;_mClose();_toast('✅ Print updated!');_lv(_V);}
    else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mDispatchJob(jobId){
  var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(!j)return;
  _mOpen('🚚 Dispatch — '+jobId,
    '<div class="alert ok"><i class="fa-solid fa-check"></i>Print done — ready to dispatch</div>'
    +(j['QC Pass/Fail']!=='Pass'?'<div class="alert warn"><i class="fa-solid fa-triangle-exclamation"></i>QC not passed yet</div>':'')
    +'<div class="fg"><label>Vehicle No.</label><input id="dVeh" placeholder="DL 1C 1234" value="'+_e(j['Vehicle No.']||'')+'"></div>'
    +'<div class="fg"><label>Driver Name</label><input id="dDrv" value="'+_e(j['Driver Name']||'')+'"></div>'
    +'<div class="fg"><label>LR Number</label><input id="dLR" value="'+_e(j['LR Number']||'')+'"></div>'
    +'<div class="fg"><label>Expected Delivery</label><input type="date" id="dEDD"></div>'
    +'<div class="fg"><label>Supervisor Note</label><textarea id="dNote">'+_e(j['Supervisor Notes']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnT btn-sm" onclick="_saveDispatch(\''+_e(jobId)+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>');
}
function _saveDispatch(jobId){
  var d={jobId:jobId,vehicleNo:_v('dVeh'),driverName:_v('dDrv'),lrNumber:_v('dLR'),edd:_v('dEDD'),supNote:_v('dNote')};
  _mLoad();
  _api('updateDispatch',d,function(r){
    if(r.success){
      var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});
      if(j){j['Dispatch Status']='Done';j['Vehicle No.']=d.vehicleNo;j['LR Number']=d.lrNumber;}
      _mClose();_toast('✅ Dispatched!');_lv(_V);
      if(j){
        var party=(_D.parties||[]).find(function(p){return p['Party ID']===j['Party ID'];})||{};
        var wa=party['WhatsApp 1']||party['Mobile 1'];
        if(wa)setTimeout(function(){_waDispatch(wa,party['Contact Person 1']||'',j['Job Name / Description']||'',jobId,_today(),d.vehicleNo,d.lrNumber);},700);
      }
    } else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mInvoice(jobId){
  var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(!j)return;
  _mOpen('🧾 Invoice — '+jobId,
    '<div class="alert ok"><i class="fa-solid fa-truck"></i>Job dispatched — generate invoice</div>'
    +'<div class="fg"><label>Invoice Type</label><select id="iT"><option value="Pakka">Pakka (With GST)</option><option value="Kachha">Kachha</option></select></div>'
    +'<div class="fg"><label>Taxable Amount (₹) *</label><input type="number" id="iAmt" placeholder="5000"></div>'
    +'<div class="form-row"><div class="fg"><label>CGST %</label><input type="number" id="iCG" value="9"></div><div class="fg"><label>SGST %</label><input type="number" id="iSG" value="9"></div></div>'
    +'<div class="fg"><label>Payment Terms (days)</label><input type="number" id="iTP" value="30"></div>'
    +'<div class="fg"><label>Notes</label><textarea id="iN"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" onclick="_saveInvoice(\''+_e(jobId)+'\')"><i class="fa-solid fa-file-invoice"></i> Generate</button>');
}
function _saveInvoice(jobId){
  var d={jobId:jobId,type:_v('iT'),taxable:_v('iAmt'),cgst:_v('iCG'),sgst:_v('iSG'),terms:_v('iTP'),note:_v('iN')};
  if(!d.taxable){_toast('⚠️ Enter taxable amount');return;}
  _mLoad();
  _api('addInvoice',d,function(r){
    if(r.success){var j=(_D.jobs||[]).find(function(x){return x['Job ID']===jobId;});if(j)j['Billed (Y/N)']=true;if(r.invoice&&_D.invoices)_D.invoices.push(r.invoice);_mClose();_toast('✅ Invoice generated!');_lv('invoices');}
    else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mRecordPayment(invNo){
  var inv=(_D.invoices||[]).find(function(i){return i['Invoice No.']===invNo;});if(!inv)return;
  var netPay=_n(inv['Net Payable (Formula)']||inv['Net Payable']);
  _mOpen('💳 Record Payment',
    '<div class="alert info"><i class="fa-solid fa-file-invoice"></i>Invoice: <b>'+_e(invNo)+'</b> — ₹'+_f(netPay)+'</div>'
    +'<div class="fg"><label>Amount Received (₹) *</label><input type="number" id="pmA" placeholder="0"></div>'
    +'<div class="fg"><label>Payment Mode *</label><select id="pmM"><option>Cash</option><option>UPI</option><option>NEFT</option><option>RTGS</option><option>Cheque</option></select></div>'
    +'<div class="fg"><label>Ref No. / UTR</label><input id="pmR" placeholder="UPI txn ID etc"></div>'
    +'<div class="fg"><label>TDS Deducted (₹)</label><input type="number" id="pmT" value="0"></div>'
    +'<div class="fg"><label>Payment Type</label><select id="pmPT"><option>Full Payment</option><option>Part Payment</option><option>Advance</option></select></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" onclick="_savePayment(\''+_e(invNo)+'\')"><i class="fa-solid fa-indian-rupee-sign"></i> Record</button>');
}
function _savePayment(invNo){
  var d={invoiceNo:invNo,amount:_v('pmA'),mode:_v('pmM'),ref:_v('pmR'),tds:_v('pmT'),type:_v('pmPT')};
  if(!d.amount||parseFloat(d.amount)<=0){_toast('⚠️ Enter valid amount');return;}
  _mLoad();
  _api('addPayment',d,function(r){if(r.success){_mClose();_toast('✅ Payment recorded!');_lv('payments');}else _toast('❌ '+(r.error||'Failed'));});
}

function _mStockIn(){
  var parties=(_D.parties||[]).filter(function(p){return(p['Status']||'Active')==='Active';});
  _mOpen('📦 Stock Inward',
    '<div class="fg"><label>Party *</label><select id="siP"><option value="">— Select —</option>'+parties.map(function(p){return '<option value="'+_e(p['Party ID']||'')+'">'+_e(p['Party Name']||'')+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Challan No. *</label><input id="siCh" placeholder="CH-2501"></div>'
    +'<div class="form-row"><div class="fg"><label>Challan Date</label><input type="date" id="siCD"></div><div class="fg"><label>Vehicle No.</label><input id="siV" placeholder="DL 1AB 1234"></div></div>'
    +'<div class="fg"><label>Paper Type *</label><select id="siPT">'+['Duplex','Kraft','Normal','Loose','Craft','Art Paper','Newsprint','Bond','Other'].map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>'
    +'<div class="form-row"><div class="fg"><label>Sheet Size (in)*</label><input id="siSz" placeholder="27x35"></div><div class="fg"><label>GSM *</label><input type="number" id="siG" placeholder="300"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Bundles *</label><input type="number" id="siB" placeholder="12"></div><div class="fg"><label>Gross/Bundle *</label><input type="number" id="siGB" placeholder="4"></div></div>'
    +'<div class="fg"><label>Rack/Location</label><input id="siR" placeholder="Rack A1"></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" onclick="_saveStockIn()"><i class="fa-solid fa-boxes-stacked"></i> Add</button>');
}
function _saveStockIn(){
  var d={partyId:_v('siP'),challan:_v('siCh'),chDate:_v('siCD'),vehicle:_v('siV'),paperType:_v('siPT'),sheetSize:_v('siSz'),gsm:_v('siG'),bundles:_v('siB'),gross:_v('siGB'),rack:_v('siR')};
  if(!d.partyId||!d.challan||!d.bundles){_toast('⚠️ Fill required fields');return;}
  _mLoad();
  _api('addStock',d,function(r){if(r.success){if(_D.stock&&r.stock)_D.stock.push(r.stock);_mClose();_toast('✅ Stock added!');_lv('stock');}else _toast('❌ '+(r.error||'Failed'));});
}

function _mNewQC(){_mNewQCForJob('');}
function _mNewQCForJob(preJobId){
  var readyJobs=(_D.jobs||[]).filter(function(j){return j['Print Status']==='Done';});
  _mOpen('🔍 QC Entry',
    '<div class="fg"><label>Job *</label><select id="qJ"><option value="">— Select —</option>'+readyJobs.map(function(j){return '<option value="'+_e(j['Job ID']||'')+'"'+(j['Job ID']===preJobId?' selected':'')+'>'+_e((j['Job ID']||'')+' — '+(j['Job Name / Description']||''))+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>QC Stage *</label><select id="qSt">'+['Pre-press QC','Print QC','Post-press QC','Final QC'].map(function(s){return '<option>'+s+'</option>';}).join('')+'</select></div>'
    +'<div class="form-sec">Ratings (1-5)</div>'
    +'<div class="form-row"><div class="fg"><label>Color Accuracy</label><input type="number" id="qCA" min="1" max="5" value="4"></div><div class="fg"><label>Register Accuracy</label><input type="number" id="qRA" min="1" max="5" value="4"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Ink Density</label><input type="number" id="qID" min="1" max="5" value="4"></div><div class="fg"><label>Cutting Accuracy</label><input type="number" id="qCuA" min="1" max="5" value="4"></div></div>'
    +'<div class="fg"><label>Result *</label><select id="qR"><option>Pass</option><option>Partial Pass</option><option>Fail</option><option>Pending</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Total Inspected</label><input type="number" id="qTI" placeholder="200"></div><div class="fg"><label>Rejection Qty</label><input type="number" id="qRQ" value="0"></div></div>'
    +'<div class="fg"><label>Corrective Action</label><textarea id="qNote"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnV btn-sm" onclick="_saveQC()"><i class="fa-solid fa-magnifying-glass-chart"></i> Save QC</button>');
}
function _saveQC(){
  var d={jobId:_v('qJ'),stage:_v('qSt'),colorAcc:_v('qCA'),regAcc:_v('qRA'),inkDen:_v('qID'),cutAcc:_v('qCuA'),result:_v('qR'),totalInsp:_v('qTI'),rejQty:_v('qRQ'),note:_v('qNote')};
  if(!d.jobId){_toast('⚠️ Select a job');return;}
  _mLoad();
  _api('addQC',d,function(r){
    if(r.success){
      var j=(_D.jobs||[]).find(function(x){return x['Job ID']===d.jobId;});if(j){j['QC Done (Y/N)']=true;j['QC Pass/Fail']=d.result;}
      _mClose();_toast('✅ QC saved!');_lv(_V);
      if(d.result==='Fail'&&j){
        var sup=(_D.users||[]).find(function(u){return(u['Role']||'').toLowerCase()==='supervisor';})||{};
        var supWA=sup['WhatsApp']||sup['Mobile'];
        if(supWA)setTimeout(function(){_waQCFailed(supWA,d.jobId,j['Job Name / Description']||'',d.stage,d.rejQty);},600);
      }
    } else _toast('❌ '+(r.error||'Failed'));
  });
}

function _mNewDowntime(){
  _mOpen('⚠️ Log Downtime',
    '<div class="fg"><label>Machine *</label><select id="dtM"><option>Machine 1 (Heidelberg)</option><option>Machine 2 (Ryobi)</option><option>Machine 3</option></select></div>'
    +'<div class="fg"><label>Reason Category *</label><select id="dtC">'+['Mechanical','Electrical','Operator Error','Scheduled Maintenance','Chemical Issue','Power Cut','Other'].map(function(c){return '<option>'+c+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Description *</label><textarea id="dtD" placeholder="Describe the issue…"></textarea></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="dtST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="dtET"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Repair Cost (₹)</label><input type="number" id="dtRC" value="0"></div><div class="fg"><label>Preventable?</label><select id="dtPrev"><option value="Y">Yes</option><option value="N">No</option></select></div></div>'
    +'<div class="fg"><label>Action Taken</label><textarea id="dtAct"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnR btn-sm" onclick="_saveDowntime()"><i class="fa-solid fa-triangle-exclamation"></i> Log</button>');
}
function _saveDowntime(){
  var d={machine:_v('dtM'),category:_v('dtC'),desc:_v('dtD'),startTime:_v('dtST'),endTime:_v('dtET'),cost:_v('dtRC'),action:_v('dtAct'),preventable:_v('dtPrev')};
  if(!d.desc){_toast('⚠️ Enter description');return;}
  _mLoad();
  _api('addDowntime',d,function(r){if(r.success){_mClose();_toast('✅ Downtime logged!');_lv(_V);}else _toast('❌ '+(r.error||'Failed'));});
}

function _mNewParty(){
  _mOpen('➕ New Party',
    '<div class="fg"><label>Party Name *</label><input id="npN" placeholder="ABC Packaging Pvt Ltd"></div>'
    +'<div class="fg"><label>Party Type</label><select id="npT"><option>Brand Owner</option><option>Manufacturer</option><option>Trader</option><option>Printer</option><option>Other</option></select></div>'
    +'<div class="form-sec">Contact</div>'
    +'<div class="fg"><label>Contact Person *</label><input id="npCP" placeholder="Rajesh Kumar"></div>'
    +'<div class="form-row"><div class="fg"><label>Mobile *</label><input type="tel" id="npM" placeholder="9XXXXXXXXX"></div><div class="fg"><label>WhatsApp</label><input type="tel" id="npWA" placeholder="9XXXXXXXXX"></div></div>'
    +'<div class="fg"><label>Email</label><input type="email" id="npE"></div>'
    +'<div class="fg"><label>GST Number</label><input id="npGST" placeholder="07XXXXX0000X1Z5"></div>'
    +'<div class="form-sec">Address & Credit</div>'
    +'<div class="form-row"><div class="fg"><label>City *</label><input id="npCity" placeholder="Delhi"></div><div class="fg"><label>State</label><select id="npSt"><option>Delhi</option><option>Haryana</option><option>UP</option><option>Rajasthan</option><option>Punjab</option><option>Other</option></select></div></div>'
    +'<div class="form-row"><div class="fg"><label>Credit Limit (₹)</label><input type="number" id="npCL" value="50000"></div><div class="fg"><label>Credit Days</label><input type="number" id="npCD" value="30"></div></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnA btn-sm" onclick="_saveNewParty()"><i class="fa-solid fa-plus"></i> Add Party</button>');
}
function _saveNewParty(){
  var d={name:_v('npN'),type:_v('npT'),contact:_v('npCP'),mobile:_v('npM'),whatsapp:_v('npWA'),email:_v('npE'),gst:_v('npGST'),city:_v('npCity'),state:_v('npSt'),creditLimit:_v('npCL'),creditDays:_v('npCD')};
  if(!d.name||!d.mobile){_toast('⚠️ Fill required fields');return;}
  _mLoad();
  _api('addParty',d,function(r){if(r.success){if(_D.parties&&r.party)_D.parties.push(r.party);_mClose();_toast('✅ Party added!');_lv('parties');}else _toast('❌ '+(r.error||'Failed'));});
}

function _mNewExpense(){
  _mOpen('💸 New Expense',
    '<div class="fg"><label>Category *</label><select id="exC">'+['Ink','Plate','Chemical','Lamination Film','Maintenance','Electricity','Packing Material','Labour','Miscellaneous'].map(function(c){return '<option>'+c+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Item Description *</label><input id="exD" placeholder="Cyan Ink 1Kg"></div>'
    +'<div class="fg"><label>Vendor Name</label><input id="exV" placeholder="Huber Inks Delhi"></div>'
    +'<div class="form-row"><div class="fg"><label>Qty</label><input type="number" id="exQ" placeholder="5"></div><div class="fg"><label>Unit</label><select id="exU"><option>Kg</option><option>Litre</option><option>Pcs</option><option>Roll</option><option>Bill</option><option>Job</option><option>Set</option></select></div></div>'
    +'<div class="form-row"><div class="fg"><label>Rate (₹)</label><input type="number" id="exR" placeholder="800"></div><div class="fg"><label>GST %</label><input type="number" id="exGST" value="18"></div></div>'
    +'<div class="fg"><label>Machine Linked</label><select id="exM"><option value="">None</option><option>Machine 1 (Heidelberg)</option><option>Machine 2 (Ryobi)</option><option>Machine 3</option></select></div>'
    +'<div class="fg"><label>Payment Mode</label><select id="exPM"><option>Cash</option><option>UPI</option><option>NEFT</option><option>Cheque</option></select></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnO btn-sm" onclick="_saveExpense()"><i class="fa-solid fa-receipt"></i> Add</button>');
}
function _saveExpense(){
  var d={category:_v('exC'),desc:_v('exD'),vendor:_v('exV'),qty:_v('exQ'),unit:_v('exU'),rate:_v('exR'),gst:_v('exGST'),machine:_v('exM'),mode:_v('exPM')};
  if(!d.desc){_toast('⚠️ Enter description');return;}
  _mLoad();
  _api('addExpense',d,function(r){if(r.success){_mClose();_toast('✅ Expense added!');_lv('expenses');}else _toast('❌ '+(r.error||'Failed'));});
}

function _mPartyDetail(partyId){
  var p=(_D.parties||[]).find(function(x){return x['Party ID']===partyId;});if(!p)return;
  var jobs=(_D.jobs||[]).filter(function(j){return j['Party ID']===partyId;});
  var body='<div class="info-row"><span class="ir-l">Party ID</span><span class="ir-v">'+_e(p['Party ID']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Type</span><span class="ir-v">'+_e(p['Party Type']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Contact</span><span class="ir-v">'+_e(p['Contact Person 1']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Mobile</span><span class="ir-v">'+_e(p['Mobile 1']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">GST</span><span class="ir-v">'+_e(p['GST Number']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">City</span><span class="ir-v">'+_e(p['Billing City']||'—')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Credit Days</span><span class="ir-v">'+(_n(p['Credit Days'])||30)+' days</span></div>'
    +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:var(--R);font-weight:700">₹'+_f(_n(p['Outstanding Balance (Rs)']))+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Billed</span><span class="ir-v">₹'+_f(_n(p['Total Billed (Rs)']))+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Jobs</span><span class="ir-v">'+jobs.length+' jobs</span></div>'
    +'<div class="info-row"><span class="ir-l">Payment Rating</span><span class="ir-v">'+'⭐'.repeat(Math.round(_n(p['Payment Rating (1-5)'])||0))+'</span></div>'
    +(p['Special Instructions']?'<div class="alert info" style="margin-top:10px"><i class="fa-solid fa-note-sticky"></i>'+_e(p['Special Instructions'])+'</div>':'');
  var foot=(p['WhatsApp 1']?'<button class="wa-btn btn-sm" onclick="_waParty(\''+_e(p['WhatsApp 1'])+'\',\''+_e(p['Contact Person 1']||'')+'\')"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>':'')
    +'<button class="btn btnOut btn-sm" onclick="_mClose()">Close</button>';
  _mOpen(p['Party Name']||'Party',body,foot);
}

/* ═══ WHATSAPP ══════════════════════════════════════════ */
function _wa(num,msg,label){
  num=String(num||'').replace(/\D/g,'');
  if(!num){_toast('⚠️ No WhatsApp number');return;}
  if(!num.startsWith('91')&&num.length===10)num='91'+num;
  if(!_gasOk()){window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');return;}
  _toast('📤 Sending WhatsApp…');
  _api('sendWhatsApp',{number:num,message:msg},function(r){
    if(r&&r.success)_toast('✅ WhatsApp sent'+(label?' — '+label:''));
    else{_toast('⚠️ API failed — opening WhatsApp');window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');}
  },function(){window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');});
}
function _waParty(num,name){_wa(num,'Namaskar '+(name||'')+' ji! 🙏\nNitin Mittal Offset Printing se bol rahe hain.\nKoi kaam ho to bataiye.\n— Nitin Mittal Press 📞',name);}
function _waDispatch(num,name,jobName,jobId,dispDate,veh,lr){_wa(num,'Namaskar '+(name||'')+' ji! 🙏\n\n✅ Aapka kaam complete ho gaya hai:\n📋 *'+jobName+'*\n🔖 Job ID: '+jobId+'\n🚚 Dispatch: '+(dispDate||_today())+'\n🚗 Vehicle: '+(veh||'—')+'\n📃 LR: '+(lr||'—')+'\n\nKripya delivery confirm karein.\nDhanyawad! 🙏\n— Nitin Mittal Press','Dispatch');}
function _waPaymentReminder(num,invNo,amount,dueDate,name){var od=dueDate&&dueDate<_today();_wa(num,'Namaskar '+(name||'')+' ji! 🙏\n\n'+(od?'⚠️ *Payment Overdue!*\n\n':'💰 *Payment Reminder*\n\n')+'📄 Invoice: *'+invNo+'*\n💵 Amount: *₹'+amount+'*\n📅 Due: '+(dueDate||'—')+'\n\n'+(od?'Kripya urgent payment karein.\n\n':'Kripya payment arrange karein.\n\n')+'Dhanyawad! 🙏\n— Nitin Mittal Press Accounts','Payment');}
function _waJobAssigned(num,opName,jobId,jobName,party,machine,pri,promDate){_wa(num,'Namaskar '+(opName||'')+' ji!\n🆕 *Naya Job:*\n🔖 '+jobId+' — '+jobName+'\n🏢 '+party+'\n⚙️ '+machine+'\n🔴 P'+pri+'\n📅 '+promDate+'\nApp mein check karein.\n— NM Press','Job Assigned');}
function _waCutDone(num,opName,jobId,jobName){_wa(num,'Namaskar '+(opName||'')+' ji!\n✂️ *Cutting Done!*\n🔖 '+jobId+' — '+jobName+'\nPrinting shuru karein.\n— NM Press','Cut Done');}
function _waQCFailed(num,jobId,jobName,stage,rejQty){_wa(num,'🚨 *QC Fail!*\n🔖 '+jobId+' — '+jobName+'\n🔍 '+stage+'\n❌ Rejection: '+(rejQty||0)+'\nUrgent review karein.\n— NM Press QC','QC Fail');}

/* ═══ MODAL HELPERS ═════════════════════════════════════ */
function _mOpen(title,body,foot){
  document.getElementById('mTitle').textContent=title;
  document.getElementById('mBody').innerHTML=body;
  var mf=document.getElementById('mFoot');
  if(foot){mf.innerHTML=foot;mf.style.display='flex';}else{mf.innerHTML='';mf.style.display='none';}
  document.getElementById('mOv').classList.add('on');
  document.getElementById('modal').classList.add('on');
  document.getElementById('modal').scrollTop=0;
}
function _mClose(){document.getElementById('mOv').classList.remove('on');document.getElementById('modal').classList.remove('on');}
function _mLoad(){document.getElementById('mFoot').innerHTML='<button class="btn btnOut btn-full btn-sm" disabled><i class="fa-solid fa-spinner fa-spin"></i> Saving…</button>';}
function _fabClick(){if(_fabCb)_fabCb();}

/* ── Component helpers ───────────────────────────────── */
function _kpi(label,val,icon,color,bg){return '<div class="kpi" style="--kc:var('+color+');--kib:var('+bg+')">'+'<div class="kpi-ico"><i class="fa-solid '+icon+'"></i></div>'+'<div class="kpi-val">'+val+'</div>'+'<div class="kpi-lbl">'+label+'</div></div>';}
function _tile(icon,color,bg,name,sub,onclick){return '<div class="home-tile" style="--tc:var('+color+');--tib:var('+bg+')" onclick="'+onclick+'"><div class="ht-ico"><i class="fa-solid '+icon+'"></i></div><div><div class="ht-name">'+name+'</div><div class="ht-sub">'+sub+'</div></div></div>';}

/* ── Utils ───────────────────────────────────────────── */
function _today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _n(v){var n=parseFloat(v);return isNaN(n)?0:n;}
function _f(n){return Number(n).toLocaleString('en-IN',{maximumFractionDigits:0});}
function _e(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function _v(id){var el=document.getElementById(id);return el?el.value.trim():'';}
function _toast(msg,dur){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},dur||2800);}
