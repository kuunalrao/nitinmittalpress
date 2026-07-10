


/* NM Press app.js v3.1 — Premium Mobile UI */
'use strict';
var GAS_URL='https://script.google.com/macros/s/AKfycbwyoea7hhlN3feL6ydKND1SoTDiNgsWhstImhV1jgw5c1o0YBoUYyLKODVkmmS1ATw1-g/exec';
var LS_KEY='nm_press_v3';
var _U=null,_TOKEN=null,_D={},_V='home',_cbIdx=0,_fabCb=null;
var _jFilter='all',_jSearch='',_jobViewMode='tbl';

function _gasOk(){return GAS_URL&&GAS_URL.indexOf('YOUR_GAS')===-1&&GAS_URL.startsWith('https://');}

/* ── DEMO USERS ── */
var DEMO=[
  {email:'nitin@press.com',pass:'nitin@123',name:'Nitin Mittal',role:'admin',machine:'',id:'U001'},
  {email:'bauji@press.com',pass:'bauji@123',name:'Om Prakash',role:'viewer',machine:'',id:'U002'},
  {email:'ravi@press.com',pass:'ravi@123',name:'Ravi Kumar',role:'supervisor',machine:'',id:'U003'},
  {email:'m1@press.com',pass:'m1@123',name:'Operator M1',role:'operator',machine:'Machine 1',id:'U004'},
  {email:'m2@press.com',pass:'m2@123',name:'Operator M2',role:'operator',machine:'Machine 2',id:'U005'},
  {email:'m3@press.com',pass:'m3@123',name:'Operator M3',role:'operator',machine:'Machine 3',id:'U006'},
  {email:'ramesh@press.com',pass:'ramesh@123',name:'Ramesh',role:'cutting',machine:'',id:'U007'}
];
var MASTER='nmpress@admin2026';

/* ── API ── */
function _api(action,data,ok,err){
  if(!_gasOk()){
    if(action==='login'){
      var em=(data.email||'').toLowerCase().trim();
      var pw=(data.password||'').trim();
      var u=DEMO.filter(function(x){return x.email===em;})[0];
      if(u&&(u.pass===pw||pw===MASTER)){
        ok&&ok({success:true,token:u.email+':'+u.role,
          user:{id:u.id,name:u.name,email:u.email,role:u.role,machine:u.machine}});
      } else {
        ok&&ok({success:false,error:'Email ya password galat hai'});
      }
      return;
    }
    if(action==='getAllData'){
      ok&&ok({success:true,data:{jobs:[],parties:[],machines:[],stock:[],
        invoices:[],payments:[],expenses:[],qc:[],downtime:[],plates:[],users:[]}});
      return;
    }
    ok&&ok({success:false,error:'GAS not connected'});
    return;
  }
  var cb='_cb'+(++_cbIdx);
  var to=setTimeout(function(){try{delete window[cb];}catch(e){}
    err?err({message:'Timeout'}):_toast('Timeout');},22000);
  window[cb]=function(r){clearTimeout(to);
    try{delete window[cb];}catch(e){}
    var s=document.getElementById('_gs'+cb);if(s)s.remove();
    if(r&&r.success===false&&r.error==='NOT_AUTHENTICATED'){_signOut();return;}
    ok&&ok(r);};
  var url=GAS_URL+'?callback='+cb+'&payload='+encodeURIComponent(JSON.stringify({action:action,data:data||{},token:_TOKEN||''}));
  var s=document.createElement('script');s.id='_gs'+cb;s.src=url;
  s.onerror=function(){clearTimeout(to);err?err({message:'Network error'}):_toast('Network error');};
  document.head.appendChild(s);
}

/* ── SESSION ── */
function _save(){try{localStorage.setItem(LS_KEY,JSON.stringify({token:_TOKEN,user:_U}));}catch(e){}}
function _load(){
  try{var s=localStorage.getItem(LS_KEY);if(!s)return false;
    var p=JSON.parse(s);if(!p||!p.token||!p.user)return false;
    _TOKEN=p.token;_U=p.user;return true;}catch(e){return false;}
}
function _clearSess(){try{localStorage.removeItem(LS_KEY);}catch(e){}_TOKEN=null;_U=null;_D={};}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded',function(){
  var sl=document.getElementById('sLogin');
  var sh=document.getElementById('appShell');
  if(sl)sl.style.display='flex';
  if(sh){sh.style.display='none';sh.classList.remove('on');}
  if(_load()){_boot();return;}
  var lp=document.getElementById('lPass');
  var le=document.getElementById('lEmail');
  if(lp)lp.addEventListener('keydown',function(e){if(e.key==='Enter')_doLogin();});
  if(le)le.addEventListener('keydown',function(e){if(e.key==='Enter')if(lp)lp.focus();});
});

/* ── LOGIN ── */
function _doLogin(){
  var em=(_v2('lEmail')).toLowerCase();
  var pw=_v2('lPass');
  var errEl=document.getElementById('lErr');
  var btn=document.getElementById('lBtn');
  if(errEl)errEl.textContent='';
  if(!em||!pw){if(errEl)errEl.textContent='Email aur password bharein';return;}
  if(btn){btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';btn.disabled=true;}
  _api('login',{email:em,password:pw},function(r){
    if(btn){btn.innerHTML='<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';btn.disabled=false;}
    if(!r||!r.success){if(errEl)errEl.textContent=(r&&r.error)||'Login failed';return;}
    _TOKEN=r.token;_U=r.user;_save();_boot();
  },function(e){
    if(btn){btn.innerHTML='<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';btn.disabled=false;}
    if(errEl)errEl.textContent=(e&&e.message)||'Connection error';
  });
}

/* ── BOOT ── */
function _boot(){
  var sl=document.getElementById('sLogin');
  var sh=document.getElementById('appShell');
  if(sl)sl.style.display='none';
  if(sh){sh.style.display='block';sh.classList.add('on');}
  _elSet('sbAvatar',(_U.name||'?')[0].toUpperCase());
  _elSet('tbAvatar',(_U.name||'?')[0].toUpperCase());
  _elSet('sbName',_U.name||'--');
  _elSet('sbRole',_rl(_U.role));
  _elSet('tbRole',_rl(_U.role));
  _buildNav();_sbRestoreState();_showSkel();
  _api('getAllData',{},function(r){
    _D=r.data||{};_lv('home');
    if(!_gasOk())_toast('Demo mode — GAS URL update karo');
  },function(){_D={};_lv('home');_toast('Data load failed');});
}

function _signOut(){
  _clearSess();
  var sl=document.getElementById('sLogin');
  var sh=document.getElementById('appShell');
  if(sh){sh.style.display='none';sh.classList.remove('on');}
  if(sl)sl.style.display='flex';
  _el('lEmail',function(e){e.value='';});
  _el('lPass',function(e){e.value='';});
  _el('lErr',function(e){e.textContent='';});
  _sbClose();
}

function _rl(r){var m={admin:'Admin',supervisor:'Supervisor',operator:'Operator',cutting:'Cutting',viewer:'Viewer'};return m[r]||r||'Staff';}
function _el(id,fn){var e=document.getElementById(id);if(e)fn(e);}
function _elSet(id,val){_el(id,function(e){e.textContent=val;});}
function _v2(id){var e=document.getElementById(id);return e?(e.value||'').trim():'';}

/* ── NAV CONFIG ── */
var NAV={
  admin:[{g:'Main'},{id:'home',ic:'fa-house',lb:'Dashboard'},
    {id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'parties',ic:'fa-building-user',lb:'Parties'},
    {id:'stock',ic:'fa-boxes-stacked',lb:'Stock Register'},
    {g:'Finance'},{id:'invoices',ic:'fa-file-invoice',lb:'Invoices'},
    {id:'payments',ic:'fa-indian-rupee-sign',lb:'Payments'},
    {id:'expenses',ic:'fa-receipt',lb:'Expenses'},
    {g:'Factory'},{id:'machines',ic:'fa-gears',lb:'Machines'},
    {id:'qc',ic:'fa-magnifying-glass-chart',lb:'Quality Control'},
    {id:'downtime',ic:'fa-triangle-exclamation',lb:'Downtime Log'},
    {id:'plates',ic:'fa-layer-group',lb:'Plates'},
    {g:'Analytics'},{id:'reports',ic:'fa-chart-bar',lb:'Reports'},
    {id:'joblog',ic:'fa-scroll',lb:'Job Log'},
    {id:'staff',ic:'fa-id-badge',lb:'Staff'},
    {id:'settings',ic:'fa-gear',lb:'Settings'}],
  supervisor:[{g:'Main'},{id:'home',ic:'fa-house',lb:'Dashboard'},
    {id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'dispatch',ic:'fa-truck',lb:'Dispatch Queue'},
    {g:'Factory'},{id:'qc',ic:'fa-magnifying-glass-chart',lb:'QC Entry'},
    {id:'downtime',ic:'fa-triangle-exclamation',lb:'Downtime Log'},
    {id:'machines',ic:'fa-gears',lb:'Machine Status'},
    {id:'stock',ic:'fa-boxes-stacked',lb:'Stock'},
    {id:'expenses',ic:'fa-receipt',lb:'Expenses'},
    {id:'joblog',ic:'fa-scroll',lb:'Job Log'}],
  operator:[{g:'My Work'},{id:'home',ic:'fa-house',lb:'My Jobs'},
    {id:'history',ic:'fa-clock-rotate-left',lb:'History'},
    {g:'Report'},{id:'downtime',ic:'fa-triangle-exclamation',lb:'Problem'}],
  cutting:[{g:'My Work'},{id:'home',ic:'fa-house',lb:'Cut Queue'},
    {id:'history',ic:'fa-clock-rotate-left',lb:'History'},
    {g:'Report'},{id:'downtime',ic:'fa-triangle-exclamation',lb:'Problem'}],
  viewer:[{g:'Overview'},{id:'home',ic:'fa-house',lb:'Summary'},
    {id:'jobs',ic:'fa-clipboard-list',lb:'All Jobs'},
    {id:'invoices',ic:'fa-file-invoice',lb:'Revenue'},
    {id:'parties',ic:'fa-building-user',lb:'Parties'},
    {id:'reports',ic:'fa-chart-bar',lb:'Reports'}]
};
var BNAV={
  admin:[['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],
    ['invoices','fa-file-invoice','Bills'],['reports','fa-chart-bar','Reports']],
  supervisor:[['home','fa-house','Home'],['jobs','fa-clipboard-list','Jobs'],
    ['dispatch','fa-truck','Dispatch'],['qc','fa-magnifying-glass-chart','QC']],
  operator:[['home','fa-house','My Jobs'],['history','fa-clock-rotate-left','History'],
    ['downtime','fa-triangle-exclamation','Problem']],
  cutting:[['home','fa-house','Cut Jobs'],['history','fa-clock-rotate-left','History'],
    ['downtime','fa-triangle-exclamation','Problem']],
  viewer:[['home','fa-house','Summary'],['jobs','fa-clipboard-list','Jobs'],
    ['invoices','fa-file-invoice','Revenue'],['reports','fa-chart-bar','Reports']]
};

/* ── BUILD NAV ── */
function _buildNav(){
  var role=_U?_U.role:'viewer';
  var items=NAV[role]||NAV.viewer;
  var bnavs=BNAV[role]||BNAV.viewer;
  var sbEl=document.getElementById('sbNav');
  var bnEl=document.getElementById('bnav');
  if(sbEl){
    sbEl.innerHTML=items.map(function(it){
      if(it.g)return '<div class="sb-grp">'+it.g+'</div>';
      var fn='_lv(\''+it.id+'\');_sbClose()';
      return '<div class="sb-item" id="sni_'+it.id+'" onclick="'+fn+'"><i class="fa-solid '+it.ic+'"></i><span class="sb-item-txt">'+it.lb+'</span><span class="sb-tooltip">'+it.lb+'</span></div>';
    }).join('');
  }
  if(bnEl){
    bnEl.innerHTML=bnavs.map(function(it){
      var fn='_lv(\''+it[0]+'\')';
      return '<div class="bn-item" id="bni_'+it[0]+'" onclick="'+fn+'"><i class="fa-solid '+it[1]+'"></i>'+it[2]+'</div>';
    }).join('');
  }
}
function _setAct(v){
  document.querySelectorAll('.sb-item').forEach(function(e){e.classList.remove('on');});
  document.querySelectorAll('.bn-item').forEach(function(e){e.classList.remove('on');});
  var sni=document.getElementById('sni_'+v);var bni=document.getElementById('bni_'+v);
  if(sni)sni.classList.add('on');if(bni)bni.classList.add('on');
}
function _sbOpen(){_el('sb',function(e){e.classList.add('open');});_el('sbOv',function(e){e.classList.add('on');});}
function _sbClose(){_el('sb',function(e){e.classList.remove('open');});_el('sbOv',function(e){e.classList.remove('on');});}
var _sbCol=false;
function _sbToggleCollapse(){
  _sbCol=!_sbCol;
  var sb=document.getElementById('sb');
  if(sb)sb.classList.toggle('collapsed',_sbCol);
  document.body.classList.toggle('sb-col',_sbCol);
  try{localStorage.setItem('nm_sb_col',_sbCol?'1':'');}catch(e){}
}
function _sbRestoreState(){
  try{var v=localStorage.getItem('nm_sb_col');if(v){_sbCol=true;var sb=document.getElementById('sb');if(sb)sb.classList.add('collapsed');document.body.classList.add('sb-col');}}catch(e){}
}

/* ── ROUTER ── */
/* Role access map: which roles can see which views */
var _ACCESS={
  home:['admin','supervisor','operator','cutting','viewer'],
  jobs:['admin','supervisor','operator','viewer'],
  history:['admin','supervisor','operator','cutting','viewer'],
  parties:['admin','supervisor','viewer'],
  stock:['admin','supervisor'],
  invoices:['admin','viewer'],
  payments:['admin'],
  expenses:['admin','supervisor'],
  machines:['admin','supervisor'],
  qc:['admin','supervisor'],
  downtime:['admin','supervisor','operator','cutting'],
  dispatch:['admin','supervisor'],
  reports:['admin','supervisor','viewer'],
  staff:['admin'],
  plates:['admin','supervisor'],
  settings:['admin'],
  joblog:['admin','supervisor','viewer']
};
function _canView(v){
  if(!_U)return false;
  var allowed=_ACCESS[v];
  if(!allowed)return true; // unknown views: allow
  return allowed.indexOf(_U.role)>=0;
}
function _lv(v){
  /* Access control */
  if(!_canView(v)){
    _toast('Access denied: '+_rl(_U?_U.role:'?')+' cannot view this');
    return;
  }
  _V=v;_setAct(v);_fabCb=null;
  _el('fab',function(e){e.classList.remove('on');});
  var titles={home:'Dashboard',jobs:'All Jobs',history:'History',parties:'Parties',
    stock:'Stock Register',invoices:'Invoices',payments:'Payments',expenses:'Expenses',
    machines:'Machines',qc:'Quality Control',downtime:'Downtime',
    dispatch:'Dispatch Queue',reports:'Analytics',staff:'Staff',plates:'Plates',
    settings:'Settings',joblog:'Job Log'};
  if(_U){
    if(_U.role==='operator'&&v==='home')titles.home='My Jobs';
    if(_U.role==='cutting'&&v==='home')titles.home='Cut Queue';
    if(_U.role==='viewer'&&v==='home')titles.home='Summary';
  }
  _elSet('tbTitle',titles[v]||v);
  try{
    if(v==='home')_vHome();
    else if(v==='jobs')_vJobs();
    else if(v==='history')_vHistory();
    else if(v==='parties')_vParties();
    else if(v==='stock')_vStock();
    else if(v==='invoices')_vInvoices();
    else if(v==='payments')_vPayments();
    else if(v==='expenses')_vExpenses();
    else if(v==='machines')_vMachines();
    else if(v==='qc')_vQC();
    else if(v==='downtime')_vDowntime();
    else if(v==='dispatch')_vDispatch();
    else if(v==='reports')_vReports();
    else if(v==='staff')_vStaff();
    else if(v==='plates')_vPlates();
    else if(v==='settings')_vSettings();
    else if(v==='joblog')_vJobLog();
    else _vHome();
  }catch(err){
    console.error('View error ['+v+']',err);
    _html('<div class="alert danger"><i class="fa-solid fa-circle-exclamation"></i><div><b>Error:</b> '+_e(err.message)+'</div></div>');
  }
}
function _refresh(){
  _el('refreshIcon',function(i){i.classList.add('fa-spin');});
  _api('getAllData',{},function(r){
    _D=r.data||{};_lv(_V);
    _el('refreshIcon',function(i){i.classList.remove('fa-spin');});
    _toast('Refreshed');
  },function(){
    _el('refreshIcon',function(i){i.classList.remove('fa-spin');});
    _toast('Refresh failed');
  });
}
function _showSkel(){
  _html('<div class="sk" style="height:108px;border-radius:16px;margin-bottom:14px"></div>'
    +'<div class="kpi-row">'+Array(4).fill('<div class="kpi"><div class="sk" style="height:38px;width:38px;border-radius:12px;margin-bottom:12px"></div><div class="sk" style="height:24px;width:54px;border-radius:6px;margin-bottom:7px"></div><div class="sk" style="height:11px;width:72px;border-radius:4px"></div></div>').join('')+'</div>'
    +'<div class="sk" style="height:88px;border-radius:16px;margin-bottom:10px"></div>'
    +'<div class="sk" style="height:88px;border-radius:16px;margin-bottom:10px"></div>'
    +'<div class="sk" style="height:88px;border-radius:16px"></div>');
}
function _html(h){
  var ci=document.getElementById('contentInner');
  var c=document.getElementById('content');
  if(ci){ci.innerHTML=h;}else if(c){c.innerHTML=h;}
}

/* ════ VIEWS ════════════════════════════ */

/* HOME */
function _vHome(){
  if(!_U)return;
  if(_U.role==='operator'){_vOpHome();return;}
  if(_U.role==='cutting'){_vCutHome();return;}
  if(_U.role==='viewer'){_vViewerHome();return;}
  var jobs=_D.jobs||[],today=_today();
  var pending=jobs.filter(function(j){return j['Job Status']==='Pending';});
  var inprog=jobs.filter(function(j){return j['Job Status']==='In Progress';});
  var dispDue=jobs.filter(function(j){return j['Print Status']==='Done'&&j['Dispatch Status']==='Pending';});
  var delayed=jobs.filter(function(j){return(j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED')&&j['Job Status']!=='Complete';});
  var invs=_D.invoices||[];
  var outstanding=invs.filter(function(i){return i['Status']==='Pending'||i['Status']==='Overdue';}).reduce(function(s,i){return s+_n(i['Net Payable (Formula)']||i['Net Payable']);},0);
  var monthRev=invs.filter(function(i){return(i['Invoice Date']||'').slice(0,7)===today.slice(0,7);}).reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var hh=new Date().getHours();
  var gMsg='Good Evening';
  if(hh<12)gMsg='Good Morning';else if(hh<17)gMsg='Good Afternoon';else gMsg='Good Evening';
  var html='<div class="greet-card">'
    +'<div class="greet-name">Namaste, '+_e(_U.name||'')+'</div>'
    +'<div class="greet-msg">'+gMsg+'!</div>'
    +'<div class="greet-stats">'
    +'<div class="greet-stat"><div class="greet-stat-val">'+pending.length+'</div><div class="greet-stat-lbl">Pending</div></div>'
    +'<div class="greet-stat"><div class="greet-stat-val">'+inprog.length+'</div><div class="greet-stat-lbl">Running</div></div>'
    +'<div class="greet-stat"><div class="greet-stat-val">'+dispDue.length+'</div><div class="greet-stat-lbl">Dispatch</div></div>'
    +'</div></div>';
  if(delayed.length)html+='<div class="alert danger"><i class="fa-solid fa-circle-exclamation"></i>'+delayed.length+' job(s) DELAYED!</div>';
  html+='<div class="kpi-row">'
    +_kpi('Today',''+jobs.filter(function(j){return(j['Entry Date']||'').slice(0,10)===today;}).length,'fa-calendar-day','#4285F4','rgba(66,133,244,.1)')
    +_kpi('Pending',''+pending.length,'fa-hourglass-half','#FBBC05','rgba(251,188,5,.12)')
    +_kpi('In Progress',''+inprog.length,'fa-gears','#7C3AED','rgba(124,58,237,.1)')
    +_kpi('Dispatch',''+dispDue.length,'fa-truck','#0D9488','rgba(13,148,136,.1)')
    +'</div>';
  /* Charts 2-col */
  var stMap={'Complete':0,'In Progress':0,'Pending':0,'Done - Dispatch Pending':0};
  jobs.forEach(function(j){var s=j['Job Status']||'Pending';if(stMap.hasOwnProperty(s))stMap[s]++;});
  var tot=jobs.length||1;
  var stC=['#34A853','#4285F4','#FBBC05','#EA4335'];
  var stK=Object.keys(stMap);
  var cParts=[],cum=0;
  stK.forEach(function(k,i){var p=stMap[k]/tot*100;cParts.push(stC[i]+' '+cum.toFixed(1)+'% '+(cum+p).toFixed(1)+'%');cum+=p;});
  var machs=['Machine 1','Machine 2','Machine 3'];
  var mCnts=machs.map(function(m){return jobs.filter(function(j){return j['Machine Assigned']===m;}).length;});
  var mMax=Math.max.apply(null,mCnts)||1;
  /* Desktop: 2-panel layout */
  html+='<div class="desktop-grid" style="margin-bottom:16px">';
  /* Left: charts side by side */
  html+='<div>';
  html+='<div class="desktop-grid-2" style="margin-bottom:14px">';
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Job Status</div></div><div class="card-body"><div class="donut-wrap"><div class="donut" style="background:conic-gradient('+cParts.join(',')+')" ></div><div class="donut-legend">'+stK.map(function(k,i){return '<div class="donut-row"><div class="donut-dot" style="background:'+stC[i]+'"></div><span style="flex:1">'+k.replace('Done - Dispatch Pending','Dispatch')+'</span><b>'+stMap[k]+'</b></div>';}).join('')+'</div></div></div></div>';
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-gears"></i>Machine Load</div></div><div class="card-body"><div class="chart-bar-group">';
  machs.forEach(function(m,i){var pct=(mCnts[i]/mMax*100).toFixed(0);var cnt=mCnts[i];html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+m.replace('Machine ','M')+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:'+['#4285F4','#34A853','#EA4335'][i]+'"></div></div><span class="chart-bar-val">'+cnt+'</span></div>';});
  html+='</div></div></div>';
  html+='</div>';/* end desktop-grid-2 */
  html+='<div class="desktop-grid-2">';
  html+=_kpi('Month Revenue','&#8377;'+_f(monthRev),'fa-indian-rupee-sign','#34A853','rgba(52,168,83,.1)','This month billed');
  html+=_kpi('Outstanding','&#8377;'+_f(outstanding),'fa-hourglass-half','#EA4335','rgba(234,67,53,.1)',outstanding>0?invs.filter(function(i){return i['Status']==='Overdue';}).length+' overdue':'All clear');
  html+='</div>';
  html+='</div>';/* end left panel */
  /* Right: recent activity */
  var recent5=jobs.slice(-5).reverse();
  html+='<div>';
  html+='<div class="card" style="margin-bottom:0">';
  html+='<div class="card-head"><div class="card-title"><i class="fa-solid fa-bolt"></i>Recent Activity</div><span class="card-action" onclick="_lv(\'jobs\')">View All</span></div>';
  html+='<div style="padding:0">';
  if(!recent5.length){html+='<div class="empty" style="padding:32px"><i class="fa-solid fa-inbox"></i><p>No jobs yet</p></div>';}
  else recent5.forEach(function(j){
    var acColors={1:'#EA4335',2:'#F97316',3:'#4285F4',4:'#34A853',5:'#9DA3B8'};
    var pri=parseInt(j['Priority']||j['Priority (1-5)']||3)||3;
    var ac=acColors[Math.min(5,Math.max(1,pri))];
    var jrid=_esc(j['Job ID']||'');
    var row='<div class="_act-row" onclick="_mJobDetail(\''+jrid+'\')";>';
    row+='<div style="width:4px;height:40px;border-radius:2px;background:'+ac+';flex-shrink:0"></div>';
    row+='<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+_e(j['Job Name / Description']||'--')+'</div>';
    row+='<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+_e(j['Job ID']||'--')+' &bull; '+_e(j['Party Name']||'--')+'</div></div>';
    row+=_stBadge(j['Job Status']||'Pending')+'</div>';
    html+=row;
  });
  html+='</div></div>';
  html+='</div>';/* end right panel */
  html+='</div>';/* end desktop-grid */
  if(_U.role==='admin'){
    html+='<div class="sec-head"><div class="sec-title">Quick Actions</div></div>'
      +'<div class="qa-grid">'
      +_tile('fa-plus','#4285F4','rgba(66,133,244,.1)','New Job','Add production job','_mNewJob()')
      +_tile('fa-boxes-stacked','#34A853','rgba(52,168,83,.1)','Stock In','Register inward','_mStockIn()')
      +_tile('fa-truck','#0D9488','rgba(13,148,136,.1)','Dispatch',dispDue.length+' waiting','_lv(\'dispatch\')',dispDue.length>0?dispDue.length:'')
      +_tile('fa-file-invoice','#7C3AED','rgba(124,58,237,.1)','Invoices','View & create','_lv(\'invoices\')')
      +_tile('fa-chart-bar','#FBBC05','rgba(251,188,5,.12)','Analytics','Reports','_lv(\'reports\')')
      +_tile('fa-building-user','#EA4335','rgba(234,67,53,.1)','Parties','View all','_lv(\'parties\')')
      +'</div>';
    _fabCb=_mNewJob;_el('fab',function(e){e.classList.add('on');});
  } else {
    html+='<div class="qa-grid">'
      +_tile('fa-clipboard-list','#4285F4','rgba(66,133,244,.1)','All Jobs','View all','_lv(\'jobs\')')
      +_tile('fa-truck','#0D9488','rgba(13,148,136,.1)','Dispatch',dispDue.length+' ready','_lv(\'dispatch\')')
      +_tile('fa-magnifying-glass-chart','#7C3AED','rgba(124,58,237,.1)','QC Entry','Quality check','_lv(\'qc\')')
      +_tile('fa-triangle-exclamation','#EA4335','rgba(234,67,53,.1)','Downtime','Log issue','_lv(\'downtime\')')
      +'</div>';
  }
  var recent=jobs.slice(-5).reverse();
  if(recent.length){
    html+='<div class="sec-head"><div class="sec-title">Recent Jobs</div><span class="sec-link" onclick="_lv(\'jobs\')">View All</span></div>';
    recent.forEach(function(j){html+=_jobCard(j,false);});
  }
  _html(html);
}

function _vOpHome(){
  var myM=(_U&&_U.machine)||'';
  var jobs=(_D.jobs||[]).filter(function(j){return(!myM||j['Machine Assigned']===myM)&&j['Print Status']!=='Done';}).sort(function(a,b){return(_n(a['Priority']||a['Priority (1-5)'])||5)-(_n(b['Priority']||b['Priority (1-5)'])||5);});
  var done=(_D.jobs||[]).filter(function(j){return j['Machine Assigned']===myM&&j['Print Status']==='Done';}).length;
  var html='<div class="greet-card"><div class="greet-name">Machine</div><div class="greet-msg">'+_e(myM||'Assigned')+'</div><div class="greet-stats"><div class="greet-stat"><div class="greet-stat-val">'+jobs.length+'</div><div class="greet-stat-lbl">In Queue</div></div><div class="greet-stat"><div class="greet-stat-val">'+done+'</div><div class="greet-stat-lbl">Done</div></div></div></div>';
  html+='<div class="sec-head"><div class="sec-title">Jobs — Priority Order</div></div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-circle-check"></i><h3>All Clear!</h3><p>No pending jobs on your machine</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,true);});
  _html(html);
}

function _vCutHome(){
  var jobs=(_D.jobs||[]).filter(function(j){return j['Cut Status']!=='Done';}).sort(function(a,b){return(_n(a['Priority']||a['Priority (1-5)'])||5)-(_n(b['Priority']||b['Priority (1-5)'])||5);});
  var done=(_D.jobs||[]).filter(function(j){return j['Cut Status']==='Done';}).length;
  var html='<div class="greet-card"><div class="greet-name">Cutting Station</div><div class="greet-msg">Cut Queue</div><div class="greet-stats"><div class="greet-stat"><div class="greet-stat-val">'+jobs.length+'</div><div class="greet-stat-lbl">Pending</div></div><div class="greet-stat"><div class="greet-stat-val">'+done+'</div><div class="greet-stat-lbl">Done</div></div></div></div>';
  html+='<div class="sec-head"><div class="sec-title">Cutting Queue</div></div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-scissors"></i><h3>All Done!</h3><p>No cutting jobs pending</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,true);});
  _html(html);
}

function _vViewerHome(){
  var jobs=_D.jobs||[];var invs=_D.invoices||[];
  var complete=jobs.filter(function(j){return j['Job Status']==='Complete';});
  var outstanding=invs.filter(function(i){return i['Status']==='Pending'||i['Status']==='Overdue';}).reduce(function(s,i){return s+_n(i['Net Payable (Formula)']||i['Net Payable']);},0);
  var totalBilled=invs.reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var html='<div class="kpi-row">'
    +_kpi('Total Jobs',''+jobs.length,'fa-clipboard-list','#4285F4','rgba(66,133,244,.1)')
    +_kpi('Complete',''+complete.length,'fa-circle-check','#34A853','rgba(52,168,83,.1)')
    +_kpi('Billed','&#8377;'+_f(totalBilled),'fa-indian-rupee-sign','#7C3AED','rgba(124,58,237,.1)')
    +_kpi('Outstanding','&#8377;'+_f(outstanding),'fa-hourglass-half','#EA4335','rgba(234,67,53,.1)')
    +'</div><div class="sec-head"><div class="sec-title">Recent Jobs</div></div>';
  jobs.slice(-6).reverse().forEach(function(j){html+=_jobCard(j,false);});
  _html(html);
}

/* JOBS */
function _vJobs(){
  var role=_U?_U.role:'viewer';
  var jobs=(_D.jobs||[]).slice();
  if(role==='operator')jobs=jobs.filter(function(j){return j['Machine Assigned']===(_U.machine||'');});
  if(role==='admin'){_fabCb=_mNewJob;_el('fab',function(e){e.classList.add('on');});}
  var stOpts=['all','Pending','In Progress','Done - Dispatch Pending','Complete'];
  var html='<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input id="jobSearch" placeholder="Search job, party, ID..." oninput="_jSrch(this.value)"></div>';
  html+='<div class="filter-row">'+stOpts.map(function(s){return '<div class="pill'+(_jFilter===s?' on':'')+'" onclick="_jFlt(\''+s+'\')">'+(s==='all'?'All':s)+'</div>';}).join('')+'</div>';
  var filtered=jobs.filter(function(j){
    var ms=_jFilter==='all'||j['Job Status']===_jFilter;
    var q=(_jSearch||'').toLowerCase();
    var mr=!q||(j['Job ID']||'').toLowerCase().indexOf(q)>=0||(j['Job Name / Description']||'').toLowerCase().indexOf(q)>=0||(j['Party Name']||'').toLowerCase().indexOf(q)>=0;
    return ms&&mr;
  }).sort(function(a,b){return(_n(a['Priority']||a['Priority (1-5)'])||5)-(_n(b['Priority']||b['Priority (1-5)'])||5);});
  html+='<div class="sec-head"><div class="sec-title">Jobs <span class="sec-title-count">'+filtered.length+'</span></div>'
    +'<div style="display:flex;gap:8px"><span class="sec-link" onclick="_setJobView(\'card\')"><i class="fa-solid fa-table-cells-large"></i> Cards</span><span class="sec-link" onclick="_setJobView(\'tbl\')"><i class="fa-solid fa-table-list"></i> Table</span></div>'
    +'</div>';
  if(!filtered.length)html+='<div class="empty"><i class="fa-solid fa-clipboard-list"></i><h3>No jobs</h3><p>No jobs match this filter</p></div>';
  else if(_jobViewMode==='tbl'){
    html+='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job ID</th><th>Description</th><th>Party</th><th>Machine</th><th>P</th><th>Cut</th><th>Print</th><th>Dispatch</th><th>Status</th><th>Due</th>'+(role!=='viewer'?'<th>Action</th>':'')+'</tr></thead><tbody>';
    filtered.forEach(function(j){
      var acColors={1:'#EA4335',2:'#F97316',3:'#4285F4',4:'#34A853',5:'#9DA3B8'};
      var pri=parseInt(j['Priority']||j['Priority (1-5)']||3)||3;
      var ac=acColors[Math.min(5,Math.max(1,pri))];
      var jid=_esc(j['Job ID']||'');
      var cutSt=j['Cut Status']||'Pending';var printSt=j['Print Status']||'Pending';var disSt=j['Dispatch Status']||'Pending';
      var delayed=(j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED');
      html+='<tr onclick="_mJobDetail(\''+jid+'\')">';
        +'<td><div style="display:flex;align-items:center;gap:8px"><div style="width:3px;height:28px;border-radius:2px;background:'+ac+'"></div><div><b>'+_e(j['Job ID']||'--')+'</b>'+(delayed?'<span style="color:#EA4335;margin-left:4px">&#9888;</span>':'')+'</div></div></td>'
        +'<td style="max-width:180px"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">'+_e(j['Job Name / Description']||'--')+'</div></td>'
        +'<td>'+_e(j['Party Name']||'--')+'</td>'
        +'<td>'+_e(j['Machine Assigned']||'--')+'</td>'
        +'<td><span class="badge '+(pri==1?'br':pri==2?'bo':'bb')+'">P'+pri+'</span></td>'
        +'<td><span class="badge '+_cBadge(cutSt)+'">'+cutSt+'</span></td>'
        +'<td><span class="badge '+_pBadge(printSt)+'">'+printSt+'</span></td>'
        +'<td><span class="badge '+(disSt==='Done'?'bg':'bx')+'">'+disSt+'</span></td>'
        +'<td>'+_stBadge(j['Job Status']||'Pending')+'</td>'
        +'<td style="white-space:nowrap;font-size:12px">'+_e(j['Promised Date']||'--')+'</td>';
      if(role!=='viewer'){
        html+='<td onclick="event.stopPropagation()" style="white-space:nowrap">';
        if((role==='cutting'||role==='admin'||role==='supervisor')&&cutSt!=='Done')html+='<button class="btn btn-sm btnO" onclick="_mCut(\''+jid+'\'"><i class="fa-solid fa-scissors"></i></button> ';
        if((role==='operator'||role==='admin'||role==='supervisor')&&cutSt==='Done'&&printSt!=='Done')html+='<button class="btn btn-sm btnB" onclick="_mPrint(\''+jid+'\'"><i class="fa-solid fa-print"></i></button> ';
        if((role==='admin'||role==='supervisor')&&printSt==='Done'&&disSt==='Pending')html+='<button class="btn btn-sm btnT" onclick="_mDispatchJob(\''+jid+'\'"><i class="fa-solid fa-truck"></i></button>';
        html+='</td>';
      }
      html+='</tr>';
    });
    html+='</tbody></table></div>';
  } else {
    filtered.forEach(function(j){html+=_jobCard(j,role!=='viewer');});
  }
  _html(html);
  var s=document.getElementById('jobSearch');if(s&&_jSearch)s.value=_jSearch;
}
function _jFlt(f){_jFilter=f;_vJobs();}function _jSrch(v){_jSearch=v;}function _setJobView(m){_jobViewMode=m;_vJobs();}

/* HISTORY */
function _vHistory(){
  var role=_U?_U.role:'viewer';
  var jobs=_D.jobs||[];
  if(role==='operator')jobs=jobs.filter(function(j){return j['Machine Assigned']===(_U.machine||'')&&j['Print Status']==='Done';});
  else if(role==='cutting')jobs=jobs.filter(function(j){return j['Cut Status']==='Done';});
  jobs=jobs.slice().reverse();
  var html='<div class="sec-head"><div class="sec-title">'+jobs.length+' completed</div></div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-clock-rotate-left"></i><h3>No history yet</h3><p>Completed jobs appear here</p></div>';
  else jobs.forEach(function(j){html+=_jobCard(j,false);});
  _html(html);
}

/* JOB CARD — Premium Design */
function _jobCard(j,showAct){
  var id=j['Job ID']||'';
  var name=j['Job Name / Description']||'--';
  var party=j['Party Name']||'--';
  var machine=j['Machine Assigned']||'--';
  var pri=parseInt(j['Priority']||j['Priority (1-5)']||3)||3;
  var cutSt=j['Cut Status']||'Pending';
  var printSt=j['Print Status']||'Pending';
  var disSt=j['Dispatch Status']||'Pending';
  var jobSt=j['Job Status']||'Pending';
  var delayed=(j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED');
  var role=_U?_U.role:'viewer';
  var acColors={1:'#EA4335',2:'#F97316',3:'#4285F4',4:'#34A853',5:'#9DA3B8'};
  var ac=acColors[Math.min(5,Math.max(1,pri))];
  var h='<div class="job-card" onclick="_mJobDetail(\''+_esc(id)+'\')">';
  h+='<div class="jc-accent" style="background:'+ac+'"></div>';
  h+='<div class="jc-body">';
  h+='<div class="jc-top">';
  h+='<div style="flex:1;min-width:0">';
  h+='<div class="jc-id">'+_e(id)+' &middot; P'+pri+(delayed?' &middot; <b style="color:#EA4335">&#9888; DELAYED</b>':'')+'</div>';
  h+='<div class="jc-name">'+_e(name)+'</div>';
  h+='<div class="jc-party"><i class="fa-solid fa-building-user" style="color:#9DA3B8;font-size:10px;margin-right:4px"></i>'+_e(party)+'</div>';
  h+='</div>';
  h+='<div style="flex-shrink:0;margin-left:8px;padding-top:2px">'+_stBadge(jobSt)+'</div>';
  h+='</div>';
  h+='<div class="jc-meta">';
  h+='<span class="badge bx"><i class="fa-solid fa-gears" style="font-size:9px"></i> '+_e(machine)+'</span>';
  h+='<span class="badge '+_cBadge(cutSt)+'">&#9986; '+cutSt+'</span>';
  h+='<span class="badge '+_pBadge(printSt)+'">&#128424; '+printSt+'</span>';
  if(j['Promised Date'])h+='<span class="badge bx"><i class="fa-regular fa-calendar" style="font-size:9px"></i> '+j['Promised Date']+'</span>';
  h+='</div></div>';
  if(showAct){
    h+='<div class="jc-act">';
    if((role==='cutting'||role==='admin'||role==='supervisor')&&cutSt!=='Done')
      h+='<button class="btn btn-sm btnO" onclick="event.stopPropagation();_mCut(\''+_esc(id)+'\')"><i class="fa-solid fa-scissors"></i> Cut</button>';
    if((role==='operator'||role==='admin'||role==='supervisor')&&cutSt==='Done'&&printSt!=='Done')
      h+='<button class="btn btn-sm btnB" onclick="event.stopPropagation();_mPrint(\''+_esc(id)+'\')"><i class="fa-solid fa-print"></i> Print</button>';
    if((role==='admin'||role==='supervisor')&&printSt==='Done'&&disSt==='Pending')
      h+='<button class="btn btn-sm btnT" onclick="event.stopPropagation();_mDispatchJob(\''+_esc(id)+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>';
    if(role==='admin'&&disSt==='Done'&&!j['Billed (Y/N)'])
      h+='<button class="btn btn-sm btnG" onclick="event.stopPropagation();_mInvoice(\''+_esc(id)+'\')"><i class="fa-solid fa-file-invoice"></i> Invoice</button>';
    if((role==='admin'||role==='supervisor')&&printSt==='Done'&&!j['QC Done (Y/N)'])
      h+='<button class="btn btn-sm btnV" onclick="event.stopPropagation();_mNewQCForJob(\''+_esc(id)+'\')"><i class="fa-solid fa-magnifying-glass-chart"></i> QC</button>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function _cBadge(s){return s==='Done'?'bg':s==='In Progress'?'bb':'bx';}
function _pBadge(s){return s==='Done'?'bg':s==='In Progress'?'bv':'bx';}
function _stBadge(s){var m={'Pending':'bx','In Progress':'bb','Done - Dispatch Pending':'bt','Complete':'bg'};return '<span class="badge '+(m[s]||'bx')+'">'+s+'</span>';}

/* PARTIES */
function _vParties(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'){_fabCb=_mNewParty;_el('fab',function(e){e.classList.add('on');});}
  var pts=_D.parties||[];
  _html('<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input id="ptSrch" placeholder="Search party..." oninput="_ptRender(this.value)"></div><div id="ptList"></div>');
  function renderPt(q){
    q=(q||'').toLowerCase();
    var flt=pts.filter(function(p){return!q||(p['Party Name']||'').toLowerCase().indexOf(q)>=0;});
    var out='';
    if(!flt.length)out='<div class="empty"><i class="fa-solid fa-building-user"></i><h3>No parties</h3><p>Add your first party</p></div>';
    else flt.forEach(function(p){
      var st=p['Status']||'Active';
      var jcnt=(_D.jobs||[]).filter(function(j){return j['Party ID']===p['Party ID'];}).length;
      var pid=_esc(p['Party ID']||'');
      out+='<div class="card" onclick="_mPartyDetail(\''+pid+'\')"><div class="card-head">'
        +'<div class="card-title"><div style="width:36px;height:36px;border-radius:12px;background:rgba(66,133,244,.12);display:flex;align-items:center;justify-content:center;color:#4285F4;font-weight:800;font-size:15px">'+(p['Party Name']||'?')[0]+'</div>'+_e(p['Party Name']||'--')+'</div>'
        +'<span class="badge '+(st==='Active'?'bg':st==='Blacklisted'?'br':'bx')+'">'+st+'</span></div><div class="card-body">'
        +'<div class="info-row"><span class="ir-l">Contact</span><span class="ir-v">'+_e(p['Contact Person 1']||'--')+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Mobile</span><span class="ir-v">'+_e(p['Mobile 1']||'--')+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:#EA4335;font-weight:700">&#8377;'+_f(_n(p['Outstanding Balance (Rs)']))+'</span></div>'
        +'<div class="info-row"><span class="ir-l">Jobs</span><span class="ir-v">'+jcnt+'</span></div>';
      if(p['WhatsApp 1']){var wn=_esc(p['WhatsApp 1']);var cn=_esc(p['Contact Person 1']||'');out+='<div style="margin-top:12px"><button class="wa-btn btn-sm" onclick="event.stopPropagation();_waParty(\''+wn+'\',\''+cn+'\')"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button></div>';}
      out+='</div></div>';
    });
    var pl=document.getElementById('ptList');if(pl)pl.innerHTML=out;
  }
  window._ptRender=renderPt;renderPt('');
}

/* STOCK */
function _vStock(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mStockIn;_el('fab',function(e){e.classList.add('on');});}
  var stock=(_D.stock||[]).sort(function(a,b){return _n(b['Usage %  (Formula)'])-_n(a['Usage %  (Formula)']);});
  var avail=stock.filter(function(s){return s['Status']==='Available';}).length;
  var partial=stock.filter(function(s){return s['Status']==='Partial';}).length;
  var html='<div class="kpi-row">'+_kpi('Available',''+avail,'fa-check-circle','#34A853','rgba(52,168,83,.1)')+_kpi('Partial',''+partial,'fa-circle-half-stroke','#FBBC05','rgba(251,188,5,.12)')+'</div>';
  if(!stock.length)html+='<div class="empty"><i class="fa-solid fa-boxes-stacked"></i><h3>No stock</h3><p>Add stock to get started</p></div>';
  else stock.forEach(function(s){
    var pct=Math.min(100,_n(s['Usage %  (Formula)']));
    var rem=_n(s['Remaining Gross (Formula)']);var good=_n(s['Good Gross']);
    var st=s['Status']||'Available';var barC=pct>=80?'#EA4335':pct>=50?'#FBBC05':'#34A853';
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-layer-group" style="color:#4285F4"></i>'+_e(s['Stock ID']||'--')+' &mdash; '+_e(s['Paper Type']||'--')+'</div>'
      +'<span class="badge '+(st==='Available'?'bg':st==='Partial'?'bo':'bx')+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(s['Party Name']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Size / GSM</span><span class="ir-v">'+(s['Sheet Size (inches)']||'--')+' / '+(s['GSM (Weight)']||'--')+' GSM</span></div>'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(s['Inward Date']||'--')+'</span></div>'
      +'<div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;font-weight:600"><span style="color:#5B6480">Usage</span><span>'+rem.toFixed(0)+' / '+good.toFixed(0)+' gross</span></div>'
      +'<div class="prog-track"><div class="prog-bar" style="width:'+pct+'%;background:'+barC+'"></div></div>'
      +'<div style="font-size:11px;color:#9DA3B8;text-align:right;margin-top:4px">'+pct.toFixed(1)+'% used</div></div>'
      +(pct>=80?'<div class="alert warn" style="margin-top:10px;margin-bottom:0"><i class="fa-solid fa-triangle-exclamation"></i>Low stock &mdash; reorder soon</div>':'')
      +'</div></div>';
  });
  _html(html);
}

/* INVOICES */
function _vInvoices(){
  var role=_U?_U.role:'viewer';
  var invs=(_D.invoices||[]).slice().reverse();
  var pending=invs.filter(function(i){return i['Status']==='Pending';});
  var overdue=invs.filter(function(i){return i['Status']==='Overdue';});
  var paid=invs.filter(function(i){return i['Status']==='Paid';});
  var totalPend=pending.reduce(function(s,i){return s+_n(i['Net Payable (Formula)']||i['Net Payable']);},0);
  var filter=_vInvoices._f||'all';
  var html='<div class="kpi-row">'
    +_kpi('Pending',''+pending.length,'fa-hourglass-half','#FBBC05','rgba(251,188,5,.12)')
    +_kpi('Overdue',''+overdue.length,'fa-circle-exclamation','#EA4335','rgba(234,67,53,.1)')
    +_kpi('Paid',''+paid.length,'fa-circle-check','#34A853','rgba(52,168,83,.1)')
    +_kpi('Due','&#8377;'+_f(totalPend),'fa-indian-rupee-sign','#4285F4','rgba(66,133,244,.1)')
    +'</div>'
    +'<div class="filter-row">'
    +'<div class="pill'+(filter==='all'?' on':'')+'" onclick="_vInvoices._f=\'all\';_vInvoices()">All</div>'
    +'<div class="pill'+(filter==='Pending'?' on':'')+'" onclick="_vInvoices._f=\'Pending\';_vInvoices()">Pending</div>'
    +'<div class="pill'+(filter==='Overdue'?' on':'')+'" onclick="_vInvoices._f=\'Overdue\';_vInvoices()">Overdue</div>'
    +'<div class="pill'+(filter==='Paid'?' on':'')+'" onclick="_vInvoices._f=\'Paid\';_vInvoices()">Paid</div>'
    +'</div>';
  var flt=filter==='all'?invs:invs.filter(function(i){return i['Status']===filter;});
  if(!flt.length)html+='<div class="empty"><i class="fa-solid fa-file-invoice"></i><h3>No invoices</h3><p>Invoices appear here after dispatch</p></div>';
  else flt.forEach(function(inv){
    var st=inv['Status']||'Pending';
    var stCls=st==='Paid'?'bg':st==='Overdue'?'br':st==='Partial'?'bo':'bb';
    var party=(_D.parties||[]).filter(function(p){return p['Party ID']===inv['Party ID'];})[0]||{};
    var waNum=party['WhatsApp 1']||party['Mobile 1']||'';
    var netPay=_n(inv['Net Payable (Formula)']||inv['Net Payable']);
    var invNo=_esc(inv['Invoice No.']||'');
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-file-invoice" style="color:#4285F4"></i>'+_e(inv['Invoice No.']||'--')+'</div>'
      +'<span class="badge '+stCls+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(inv['Party Name']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(inv['Invoice Date']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Due</span><span class="ir-v" style="'+(st==='Overdue'?'color:#EA4335;font-weight:700':'')+'"> '+(inv['Due Date']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Amount</span><span class="ir-v" style="font-size:18px;font-weight:800;color:#0F1623">&#8377;'+_f(_n(inv['Final Amount']))+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Net Payable</span><span class="ir-v" style="color:#4285F4;font-weight:700">&#8377;'+_f(netPay)+'</span></div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">';
    if(role==='admin'&&st!=='Paid')html+='<button class="btn btn-sm btnG" onclick="_mRecordPayment(\''+invNo+'\')"><i class="fa-solid fa-indian-rupee-sign"></i> Record Payment</button>';
    if(waNum&&role!=='viewer'){var wn=_esc(waNum);var cn=_esc(party['Contact Person 1']||'');var dd=_esc(inv['Due Date']||'');html+='<button class="wa-btn btn-sm" onclick="_waPaymentReminder(\''+wn+'\',\''+invNo+'\',\''+_f(netPay)+'\',\''+dd+'\',\''+cn+'\')"><i class="fa-brands fa-whatsapp"></i> Remind</button>';}
    html+='</div></div></div>';
  });
  _html(html);
}
_vInvoices._f='all';

/* PAYMENTS */
function _vPayments(){
  var pays=(_D.payments||[]).slice().reverse();
  var total=pays.reduce(function(s,p){return s+_n(p['Amount Received (Rs)']);},0);
  var html='<div class="kpi-row">'+_kpi('Receipts',''+pays.length,'fa-receipt','#4285F4','rgba(66,133,244,.1)')+_kpi('Total Received','&#8377;'+_f(total),'fa-money-bill-wave','#34A853','rgba(52,168,83,.1)')+'</div>';
  if(!pays.length){html+='<div class="empty"><i class="fa-solid fa-indian-rupee-sign"></i><h3>No payments</h3><p>Received payments appear here</p></div>';}
  else {
    html+='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Payment ID</th><th>Date</th><th>Party</th><th>Invoice</th><th>Amount</th><th>Mode</th><th>Ref / UTR</th></tr></thead><tbody>';
    pays.forEach(function(p){
      html+='<tr>'
        +'<td><b>'+_e(p['Payment ID']||'--')+'</b></td>'
        +'<td style="white-space:nowrap">'+_e(p['Payment Date']||'--')+'</td>'
        +'<td>'+_e(p['Party Name']||'--')+'</td>'
        +'<td>'+_e(p['Invoice No.']||'--')+'</td>'
        +'<td style="font-weight:800;color:#34A853;font-size:14px">&#8377;'+_f(_n(p['Amount Received (Rs)']))+'</td>'
        +'<td><span class="badge bb">'+_e(p['Payment Mode']||'--')+'</span></td>'
        +'<td style="font-size:12px;color:var(--tx3)">'+_e(p['Reference No. / UTR / Cheque No.']||'--')+'</td>'
        +'</tr>';
    });
    html+='</tbody></table></div>';
  }
  _html(html);
}

/* EXPENSES */
function _vExpenses(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mNewExpense;_el('fab',function(e){e.classList.add('on');});}
  var exps=(_D.expenses||[]).slice().reverse();
  var total=exps.reduce(function(s,e){return s+_n(e['Total (Formula)']);},0);
  var byCat={};exps.forEach(function(e){var cat=e['Category']||'Other';byCat[cat]=(byCat[cat]||0)+_n(e['Total (Formula)']);});
  var html='<div class="kpi-row">'+_kpi('Expenses',''+exps.length,'fa-receipt','#FBBC05','rgba(251,188,5,.12)')+_kpi('Total Spend','&#8377;'+_f(total),'fa-money-bill','#EA4335','rgba(234,67,53,.1)')+'</div>';
  var catKeys=Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a];});
  if(catKeys.length){
    var maxC=Math.max.apply(null,catKeys.map(function(k){return byCat[k];}))||1;
    var catC=['#FBBC05','#4285F4','#34A853','#EA4335','#7C3AED','#0D9488'];
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-bar"></i>By Category</div></div><div class="card-body"><div class="chart-bar-group">';
    catKeys.forEach(function(k,i){var pct=(byCat[k]/maxC*100).toFixed(0);html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+_e(k)+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+pct+'%;background:'+catC[i%catC.length]+'"></div></div><span class="chart-bar-val">&#8377;'+_f(byCat[k])+'</span></div>';});
    html+='</div></div></div>';
  }
  if(!exps.length)html+='<div class="empty"><i class="fa-solid fa-receipt"></i><h3>No expenses</h3><p>Log your first expense</p></div>';
  else exps.forEach(function(e){
    html+='<div class="card"><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(e['Date']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Category</span><span class="ir-v"><span class="badge bam">'+_e(e['Category']||'--')+'</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Item</span><span class="ir-v">'+_e(e['Item Description']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Vendor</span><span class="ir-v">'+_e(e['Vendor Name']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Total</span><span class="ir-v" style="color:#EA4335;font-weight:700">&#8377;'+_f(_n(e['Total (Formula)']))+'</span></div>'
      +'</div></div>';
  });
  _html(html);
}

/* MACHINES */
function _vMachines(){
  var machs=_D.machines||[];var jobs=_D.jobs||[];
  var html='';
  if(!machs.length)html='<div class="empty"><i class="fa-solid fa-gears"></i><h3>No machines</h3><p>Add machines in your sheet</p></div>';
  else machs.forEach(function(m){
    var name=m['Machine Name']||'--';var st=m['Current Status']||'Active';
    var activeJ=jobs.filter(function(j){return j['Machine Assigned']===name&&j['Print Status']==='In Progress';});
    var totalJ=jobs.filter(function(j){return j['Machine Assigned']===name;}).length;
    var maint=m['Next Maintenance Due']||'';var maintOD=maint&&maint<=_today();
    html+='<div class="card"><div class="card-head"><div class="card-title">'
      +'<div style="width:40px;height:40px;border-radius:12px;background:rgba(66,133,244,.1);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-gears" style="color:#4285F4;font-size:17px"></i></div>'+_e(name)+'</div>'
      +'<span class="badge '+(st==='Active'?'bg':st==='On Repair'?'br':'bx')+'">'+st+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Brand</span><span class="ir-v">'+_e(m['Make/Brand']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Operator</span><span class="ir-v">'+_e(m['Assigned Operator']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Active Jobs</span><span class="ir-v"><span class="badge '+(activeJ.length?'bb':'bx')+'">'+activeJ.length+' in progress</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Next Maint.</span><span class="ir-v" style="'+(maintOD?'color:#EA4335;font-weight:700':'')+'">'+_e(maint||'--')+(maintOD?' &#9888;':'')+'</span></div>'
      +(maintOD?'<div class="alert danger" style="margin-top:10px;margin-bottom:0"><i class="fa-solid fa-wrench"></i>Maintenance overdue!</div>':'')
      +'<div style="margin-top:12px;font-size:12px;color:#5B6480;margin-bottom:6px;font-weight:600">Load</div>'
      +'<div class="prog-track"><div class="prog-bar" style="width:'+(totalJ?Math.min(100,activeJ.length/Math.max(1,totalJ)*100):0).toFixed(0)+'%;background:#4285F4"></div></div>'
      +'</div></div>';
  });
  _html(html);
}

/* QC */
function _vQC(){
  var role=_U?_U.role:'viewer';
  if(role==='admin'||role==='supervisor'){_fabCb=_mNewQC;_el('fab',function(e){e.classList.add('on');});}
  var qcs=(_D.qc||[]).slice().reverse();
  var passed=qcs.filter(function(q){return q['Pass/Fail']==='Pass';}).length;
  var failed=qcs.filter(function(q){return q['Pass/Fail']==='Fail';}).length;
  var html='<div class="kpi-row">'
    +_kpi('Total QC',''+qcs.length,'fa-magnifying-glass-chart','#4285F4','rgba(66,133,244,.1)')
    +_kpi('Pass',''+passed,'fa-circle-check','#34A853','rgba(52,168,83,.1)')
    +_kpi('Fail',''+failed,'fa-circle-xmark','#EA4335','rgba(234,67,53,.1)')
    +_kpi('Pass Rate',''+(qcs.length?Math.round(passed/qcs.length*100):0)+'%','fa-percent','#7C3AED','rgba(124,58,237,.1)')
    +'</div>';
  if(!qcs.length)html+='<div class="empty"><i class="fa-solid fa-magnifying-glass-chart"></i><h3>No QC entries</h3><p>Add QC after printing jobs</p></div>';
  else qcs.forEach(function(q){
    var pf=q['Pass/Fail']||'Pending';var score=_n(q['Overall Score (Formula)']);
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-magnifying-glass-chart"></i>'+_e(q['QC ID']||'--')+'</div>'
      +'<span class="badge '+(pf==='Pass'?'bg':pf==='Fail'?'br':'bo')+'">'+pf+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Job</span><span class="ir-v">'+_e(q['Job Name']||q['Job ID']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Stage</span><span class="ir-v"><span class="badge bx">'+_e(q['QC Stage']||'--')+'</span></span></div>'
      +'<div class="info-row"><span class="ir-l">Score</span><span class="ir-v" style="font-weight:800;color:'+(score>=4?'#34A853':score>=3?'#FBBC05':'#EA4335')+'">'+score.toFixed(1)+'/5</span></div>'
      +'<div style="margin-top:10px"><div class="prog-track"><div class="prog-bar" style="width:'+(score/5*100).toFixed(0)+'%;background:'+(score>=4?'#34A853':score>=3?'#FBBC05':'#EA4335')+'"></div></div></div>'
      +(q['Rejection Qty']?'<div class="info-row"><span class="ir-l">Rejection</span><span class="ir-v" style="color:#EA4335">'+q['Rejection Qty']+' qty</span></div>':'')
      +'</div></div>';
  });
  _html(html);
}

/* DOWNTIME */
function _vDowntime(){
  _fabCb=_mNewDowntime;_el('fab',function(e){e.classList.add('on');});
  var dts=(_D.downtime||[]).slice().reverse();
  var totalCost=dts.reduce(function(s,d){return s+_n(d['Repair Cost (Rs)']);},0);
  var html='<div class="kpi-row">'+_kpi('Events',''+dts.length,'fa-triangle-exclamation','#EA4335','rgba(234,67,53,.1)')+_kpi('Repair Cost','&#8377;'+_f(totalCost),'fa-wrench','#F97316','rgba(249,115,22,.1)')+'</div>';
  if(!dts.length)html+='<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>No downtime logged</h3><p>Log machine issues here</p></div>';
  else dts.forEach(function(d){
    html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-triangle-exclamation" style="color:#EA4335"></i>'+_e(d['Log ID']||'--')+'</div>'
      +'<span class="badge '+(d['Preventable (Y/N)']==='Y'?'bo':'br')+'">'+_e(d['Reason Category']||'--')+'</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Machine</span><span class="ir-v">'+_e(d['Machine Name']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Date</span><span class="ir-v">'+(d['Date']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Reason</span><span class="ir-v" style="font-size:12px">'+_e(d['Reason Description']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Repair Cost</span><span class="ir-v" style="color:#EA4335;font-weight:700">&#8377;'+_f(_n(d['Repair Cost (Rs)']))+'</span></div>'
      +(d['Action Taken']?'<div class="info-row"><span class="ir-l">Action</span><span class="ir-v" style="font-size:12px">'+_e(d['Action Taken'])+'</span></div>':'')
      +'</div></div>';
  });
  _html(html);
}

/* DISPATCH */
function _vDispatch(){
  var jobs=(_D.jobs||[]).filter(function(j){return j['Print Status']==='Done'&&j['Dispatch Status']==='Pending';});
  var html='<div class="alert info" style="margin-bottom:14px"><i class="fa-solid fa-truck"></i>'+jobs.length+' job(s) ready to dispatch</div>';
  if(!jobs.length)html+='<div class="empty"><i class="fa-solid fa-truck"></i><h3>All dispatched!</h3><p>No pending dispatch jobs</p></div>';
  else jobs.forEach(function(j){
    var party=(_D.parties||[]).filter(function(p){return p['Party ID']===j['Party ID'];})[0]||{};
    var jid=_esc(j['Job ID']||'');
    html+='<div class="card"><div class="card-head"><div class="card-title" style="font-size:15px">'+_e(j['Job Name / Description']||'--')+'</div><span class="badge bt">Ready</span></div><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Job ID</span><span class="ir-v">'+_e(j['Job ID']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(j['Party Name']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">QC Status</span><span class="ir-v"><span class="badge '+(j['QC Pass/Fail']==='Pass'?'bg':'bo')+'">'+_e(j['QC Pass/Fail']||'Pending')+'</span></span></div>'
      +(j['QC Pass/Fail']!=='Pass'?'<div class="alert warn" style="margin:10px 0 0"><i class="fa-solid fa-triangle-exclamation"></i>QC not passed yet</div>':'')
      +'<div style="display:flex;gap:8px;margin-top:12px">'
      +'<button class="btn btnT btn-sm" style="flex:1" onclick="_mDispatchJob(\''+jid+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>';
    if(party['WhatsApp 1']){var wn=_esc(party['WhatsApp 1']);var cn=_esc(party['Contact Person 1']||'');html+='<button class="wa-btn btn-sm" onclick="_waParty(\''+wn+'\',\''+cn+'\')"><i class="fa-brands fa-whatsapp"></i></button>';}
    html+='</div></div></div>';
  });
  _html(html);
}

/* PLATES */
function _vPlates(){
  var plates=(_D.plates||[]).slice().reverse();
  var html='<div class="kpi-row">'+_kpi('Total',''+plates.length,'fa-layer-group','#4285F4','rgba(66,133,244,.1)')+_kpi('Active',''+plates.filter(function(p){return!p['Scrapped (Y/N)'];}).length,'fa-check','#34A853','rgba(52,168,83,.1)')+'</div>';
  if(!plates.length)html+='<div class="empty"><i class="fa-solid fa-layer-group"></i><h3>No plates</h3><p>Plate records appear here</p></div>';
  else plates.forEach(function(p){
    html+='<div class="card"><div class="card-body">'
      +'<div class="info-row"><span class="ir-l">Plate ID</span><span class="ir-v">'+_e(p['Plate ID']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Job</span><span class="ir-v">'+_e(p['Job Name']||p['Job ID']||'--')+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Type/Color</span><span class="ir-v">'+_e((p['Plate Type']||'')+'/'+(p['Color (C/M/Y/K/Spot)']||'--'))+'</span></div>'
      +'<div class="info-row"><span class="ir-l">Reused</span><span class="ir-v">'+(p['Times Reused']||0)+'/'+(p['Max Reuse Allowed']||5)+'</span></div>'
      +'</div></div>';
  });
  _html(html);
}

/* REPORTS */
function _vReports(){
  var jobs=_D.jobs||[];var invs=_D.invoices||[];var exps=_D.expenses||[];
  var pays=_D.payments||[];var dts=_D.downtime||[];var qcs=_D.qc||[];
  var totalBill=invs.reduce(function(s,i){return s+_n(i['Final Amount']);},0);
  var totalExp=exps.reduce(function(s,e){return s+_n(e['Total (Formula)']);},0);
  var totalPaid=pays.reduce(function(s,p){return s+_n(p['Amount Received (Rs)']);},0);
  var passRate=qcs.length?Math.round(qcs.filter(function(q){return q['Pass/Fail']==='Pass';}).length/qcs.length*100):0;
  var html='<div class="kpi-row">'
    +_kpi('Revenue','&#8377;'+_f(totalBill),'fa-indian-rupee-sign','#34A853','rgba(52,168,83,.1)','Total billed')
    +_kpi('Collected','&#8377;'+_f(totalPaid),'fa-circle-check','#4285F4','rgba(66,133,244,.1)','Payments received')
    +_kpi('Outstanding','&#8377;'+_f(totalBill-totalPaid),'fa-hourglass-half','#EA4335','rgba(234,67,53,.1)',invs.filter(function(i){return i['Status']==='Overdue';}).length+' overdue')
    +_kpi('QC Pass Rate',''+passRate+'%','fa-percent','#7C3AED','rgba(124,58,237,.1)',qcs.length+' inspections')
    +'</div>';
  html+='<div class="kpi-row">'
    +_kpi('Total Jobs',''+jobs.length,'fa-clipboard-list','#0D9488','rgba(13,148,136,.1)',jobs.filter(function(j){return j['Job Status']==='Complete';}).length+' complete')
    +_kpi('Expenses','&#8377;'+_f(totalExp),'fa-receipt','#F97316','rgba(249,115,22,.1)','Total spend')
    +_kpi('Gross Profit','&#8377;'+_f(totalBill-totalExp),'fa-scale-balanced',totalBill-totalExp>=0?'#34A853':'#EA4335',totalBill-totalExp>=0?'rgba(52,168,83,.1)':'rgba(234,67,53,.1)','Revenue - Expenses')
    +_kpi('Downtime Events',''+dts.length,'fa-triangle-exclamation','#EA4335','rgba(234,67,53,.1)','&#8377;'+_f(dts.reduce(function(s,d){return s+_n(d['Repair Cost (Rs)']);},0))+' cost')
    +'</div>';
  var machs=['Machine 1','Machine 2','Machine 3'];var mColors=['#4285F4','#34A853','#EA4335'];
  var mMax=Math.max.apply(null,machs.map(function(m){return jobs.filter(function(j){return j['Machine Assigned']===m;}).length;}))||1;
  var stMap={'Complete':0,'In Progress':0,'Pending':0,'Done - Dispatch Pending':0};
  jobs.forEach(function(j){var s=j['Job Status']||'Pending';if(stMap.hasOwnProperty(s))stMap[s]++;});
  var stC=['#34A853','#4285F4','#FBBC05','#EA4335'];var tot=jobs.length||1;var conic=[],cum=0;
  Object.keys(stMap).forEach(function(k,i){var p=stMap[k]/tot*100;conic.push(stC[i]+' '+cum.toFixed(1)+'% '+(cum+p).toFixed(1)+'%');cum+=p;});
  html+='<div class="desktop-grid-2" style="margin-bottom:14px">';
  html+='<div class="card" style="margin-bottom:0"><div class="card-head"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Job Status</div></div><div class="card-body"><div class="donut-wrap"><div class="donut" style="background:conic-gradient('+conic.join(',')+')" ></div><div class="donut-legend">'+Object.keys(stMap).map(function(k,i){return '<div class="donut-row"><div class="donut-dot" style="background:'+stC[i]+'"></div><span style="flex:1">'+k.replace('Done - Dispatch Pending','Dispatch')+'</span><b>'+stMap[k]+'</b></div>';}).join('')+'</div></div></div></div>';
  html+='<div class="card" style="margin-bottom:0"><div class="card-head"><div class="card-title"><i class="fa-solid fa-gears"></i>Jobs Per Machine</div></div><div class="card-body"><div class="chart-bar-group">';
  machs.forEach(function(m,i){var cnt=jobs.filter(function(j){return j['Machine Assigned']===m;}).length;html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+m+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+(cnt/mMax*100).toFixed(0)+'%;background:'+mColors[i]+'"></div></div><span class="chart-bar-val">'+cnt+'</span></div>';});
  html+='</div></div></div>';
  html+='</div>';
  var pBill={};invs.forEach(function(i){var pid=i['Party Name']||'Unknown';pBill[pid]=(pBill[pid]||0)+_n(i['Final Amount']);});
  var topPts=Object.keys(pBill).sort(function(a,b){return pBill[b]-pBill[a];}).slice(0,5);
  html+='<div class="desktop-grid-2" style="margin-bottom:14px">';
  html+='<div class="card" style="margin-bottom:0"><div class="card-head"><div class="card-title"><i class="fa-solid fa-scale-balanced"></i>P&amp;L Summary</div></div><div class="card-body">'
    +'<div class="info-row"><span class="ir-l">Revenue Billed</span><span class="ir-v" style="color:#34A853;font-weight:700">&#8377;'+_f(totalBill)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Payments Collected</span><span class="ir-v" style="color:#4285F4;font-weight:700">&#8377;'+_f(totalPaid)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:#EA4335;font-weight:700">&#8377;'+_f(totalBill-totalPaid)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Expenses</span><span class="ir-v" style="color:#F97316;font-weight:700">&#8377;'+_f(totalExp)+'</span></div>'
    +'<div class="info-row" style="border-bottom:none;padding-top:14px;margin-top:4px;border-top:2px solid var(--bdr)"><span class="ir-l" style="font-weight:700">Gross Profit</span><span class="ir-v" style="color:'+(totalBill-totalExp>=0?'#34A853':'#EA4335')+';font-weight:800;font-size:17px">&#8377;'+_f(totalBill-totalExp)+'</span></div>'
    +'</div></div>';
  if(topPts.length){var pMax2=pBill[topPts[0]]||1;html+='<div class="card" style="margin-bottom:0"><div class="card-head"><div class="card-title"><i class="fa-solid fa-trophy"></i>Top Parties</div></div><div class="card-body"><div class="chart-bar-group">';topPts.forEach(function(pt){html+='<div class="chart-bar-row"><span class="chart-bar-lbl">'+_e(pt)+'</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:'+(pBill[pt]/pMax2*100).toFixed(0)+'%;background:#4285F4"></div></div><span class="chart-bar-val">&#8377;'+_f(pBill[pt])+'</span></div>';});html+='</div></div></div>';}
  html+='</div>';
  _html(html);
}

/* STAFF */
function _vStaff(){
  var users=_D.users||[];
  var rC={admin:'#EA4335',supervisor:'#7C3AED',operator:'#4285F4',cutting:'#F97316',viewer:'#0D9488'};
  var html='<div class="kpi-row">'+_kpi('Total Staff',''+users.length,'fa-users','#4285F4','rgba(66,133,244,.1)')+_kpi('Active',''+users.filter(function(u){return u['Active (Y/N)']!=='N';}).length,'fa-circle-check','#34A853','rgba(52,168,83,.1)')+'</div>';
  if(!users.length)html+='<div class="empty"><i class="fa-solid fa-id-badge"></i><h3>No staff</h3><p>Staff appear from Users sheet</p></div>';
  else users.forEach(function(u){
    var role=(u['Role']||'').toLowerCase();
    var rc=rC[role]||'#9DA3B8';
    html+='<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:14px">'
      +'<div style="width:48px;height:48px;border-radius:50%;background:'+rc+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;flex-shrink:0">'+(u['Full Name']||'?')[0].toUpperCase()+'</div>'
      +'<div style="flex:1"><div style="font-size:15px;font-weight:700;color:#0F1623">'+_e(u['Full Name']||'--')+'</div>'
      +'<div style="font-size:12px;color:#5B6480;margin-top:2px">'+_rl(role)+(u['Machine Assigned']?' &middot; '+u['Machine Assigned']:'')+'</div>'
      +'<div style="font-size:11px;color:#9DA3B8;margin-top:2px">'+_e(u['Personal Email']||'--')+'</div></div>'
      +'<span class="badge '+(u['Active (Y/N)']==='Y'?'bg':'bx')+'">'+(u['Active (Y/N)']==='Y'?'Active':'Inactive')+'</span>'
      +'</div></div>';
  });
  _html(html);
}

/* ════ MODALS ════════════════════════════ */

function _mJobDetail(jobId){
  var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];
  if(!j){_toast('Job not found');return;}
  var role=_U?_U.role:'viewer';
  var cutSt=j['Cut Status']||'Pending';var printSt=j['Print Status']||'Pending';
  var disSt=j['Dispatch Status']||'Pending';var qcPF=j['QC Pass/Fail']||'Pending';
  var steps=[{l:'Cut',done:cutSt==='Done',act:cutSt==='In Progress'},
    {l:'Print',done:printSt==='Done',act:printSt==='In Progress'},
    {l:'QC',done:qcPF==='Pass',act:!!(j['QC Done (Y/N)']&&qcPF!=='Pass')},
    {l:'Dispatch',done:disSt==='Done',act:false},{l:'Invoice',done:!!j['Billed (Y/N)'],act:false}];
  var sh='<div class="steps">';
  steps.forEach(function(s,i){
    var cls=s.done?'done':s.act?'active':'wait';
    sh+='<div class="step-item"><div class="step-row"><div class="step-dot '+cls+'">'+(s.done?'<i class="fa-solid fa-check" style="font-size:10px"></i>':(i+1))+'</div>'+(i<steps.length-1?'<div class="step-line'+(s.done?' done':'')+'"></div>':'')+'</div><div class="step-lbl">'+s.l+'</div></div>';
  });
  sh+='</div>';
  var body=sh+'<div class="form-sec">Job Info</div>'
    +'<div class="info-row"><span class="ir-l">Job ID</span><span class="ir-v">'+_e(j['Job ID']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(j['Party Name']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Description</span><span class="ir-v" style="font-size:12px">'+_e(j['Job Name / Description']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Machine</span><span class="ir-v">'+_e(j['Machine Assigned']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Priority</span><span class="ir-v">P'+(j['Priority']||j['Priority (1-5)']||3)+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Promised</span><span class="ir-v">'+_e(j['Promised Date']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Status</span><span class="ir-v">'+_stBadge(j['Job Status']||'Pending')+'</span></div>'
    +(j['Supervisor Notes']?'<div class="alert info" style="margin-top:12px"><i class="fa-solid fa-note-sticky"></i>'+_e(j['Supervisor Notes'])+'</div>':'');
  var foot='';var jid=_esc(jobId);
  if((role==='cutting'||role==='admin'||role==='supervisor')&&cutSt!=='Done')foot+='<button class="btn btnO btn-sm" onclick="_mClose();_mCut(\''+jid+'\')"><i class="fa-solid fa-scissors"></i> Cut</button>';
  if((role==='operator'||role==='admin'||role==='supervisor')&&cutSt==='Done'&&printSt!=='Done')foot+='<button class="btn btnB btn-sm" onclick="_mClose();_mPrint(\''+jid+'\')"><i class="fa-solid fa-print"></i> Print</button>';
  if((role==='admin'||role==='supervisor')&&printSt==='Done'&&!j['QC Done (Y/N)'])foot+='<button class="btn btnV btn-sm" onclick="_mClose();_mNewQCForJob(\''+jid+'\')"><i class="fa-solid fa-magnifying-glass-chart"></i> QC</button>';
  if((role==='admin'||role==='supervisor')&&printSt==='Done'&&qcPF==='Pass'&&disSt==='Pending')foot+='<button class="btn btnT btn-sm" onclick="_mClose();_mDispatchJob(\''+jid+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>';
  if(role==='admin'&&disSt==='Done'&&!j['Billed (Y/N)'])foot+='<button class="btn btnG btn-sm" onclick="_mClose();_mInvoice(\''+jid+'\')"><i class="fa-solid fa-file-invoice"></i> Invoice</button>';
  _mOpen(j['Job Name / Description']||jobId,body,foot||null);
}

function _mNewJob(){
  var parties=(_D.parties||[]).filter(function(p){return(p['Status']||'Active')==='Active';});
  var stocks=(_D.stock||[]).filter(function(s){return s['Status']==='Available'||s['Status']==='Partial';});
  _mOpen('New Job',
    '<div class="form-sec">Job Basics</div>'
    +'<div class="fg"><label>Party *</label><select id="njP"><option value="">-- Select --</option>'+parties.map(function(p){return '<option value="'+_esc(p['Party ID']||'')+'">'+_e(p['Party Name']||'')+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Job Name *</label><input id="njN" placeholder="e.g. ABC Mono Carton 300gsm"></div>'
    +'<div class="fg"><label>Category</label><select id="njCat"><option>Carton</option><option>Mono Carton</option><option>Wrapper</option><option>Brochure</option><option>Catalogue</option><option>Banner</option><option>Visiting Card</option><option>Envelope</option><option>Book Pages</option><option>Sticker</option><option>Label</option><option>Other</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Order Qty *</label><input type="number" id="njOQ" placeholder="1000"></div><div class="fg"><label>Execute Qty</label><input type="number" id="njEQ" placeholder="500"></div></div>'
    +'<div class="form-sec">Material</div>'
    +'<div class="fg"><label>Stock *</label><select id="njS"><option value="">-- Select --</option>'+stocks.map(function(s){return '<option value="'+_esc(s['Stock ID']||'')+'">'+_e((s['Stock ID']||'')+' -- '+(s['Paper Type']||'')+' '+(s['Sheet Size (inches)']||''))+'</option>';}).join('')+'</select></div>'
    +'<div class="form-sec">Assignment</div>'
    +'<div class="fg"><label>Machine *</label><select id="njM"><option value="Machine 1">Machine 1</option><option value="Machine 2">Machine 2</option><option value="Machine 3">Machine 3</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Priority</label><select id="njPri"><option value="1">P1 Urgent</option><option value="2">P2 High</option><option value="3" selected>P3 Normal</option><option value="4">P4 Low</option><option value="5">P5 Lowest</option></select></div><div class="fg"><label>Promised Date *</label><input type="date" id="njD"></div></div>'
    +'<div class="fg"><label>Colors</label><input id="njCol" placeholder="C,M,Y,K"></div>'
    +'<div class="fg"><label>Customer PO</label><input id="njPO" placeholder="PO-001"></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnB btn-sm" style="flex:1" onclick="_saveNewJob()"><i class="fa-solid fa-plus"></i> Add Job</button>');
}
function _saveNewJob(){
  var d={partyId:_v2('njP'),jobName:_v2('njN'),category:_v2('njCat'),orderQty:_v2('njOQ'),execQty:_v2('njEQ'),stockId:_v2('njS'),machine:_v2('njM'),priority:_v2('njPri'),promDate:_v2('njD'),colors:_v2('njCol'),custPO:_v2('njPO')};
  if(!d.partyId||!d.jobName||!d.stockId||!d.promDate){_toast('Fill required fields');return;}
  _mLoad();
  _api('addJob',d,function(r){
    if(r.success){if(_D.jobs&&r.job)_D.jobs.push(r.job);_mClose();_toast('Job added!');_lv('jobs');}
    else _toast(r.error||'Failed');
  });
}

function _mCut(jobId){
  var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(!j)return;
  _mOpen('Cut -- '+jobId,
    '<div class="alert info"><i class="fa-solid fa-scissors"></i>'+_e(j['Job Name / Description']||jobId)+'</div>'
    +'<div class="fg"><label>Cut Status *</label><select id="cSt"><option value="Pending"'+(j['Cut Status']==='Pending'?' selected':'')+'>Pending</option><option value="In Progress"'+(j['Cut Status']==='In Progress'?' selected':'')+'>In Progress</option><option value="Done"'+(j['Cut Status']==='Done'?' selected':'')+'>Done</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="cST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="cET"></div></div>'
    +'<div class="fg"><label>Qty Cut</label><input type="number" id="cQ" value="'+_n(j['Cut Qty'])+'"></div>'
    +'<div class="fg"><label>Remark</label><textarea id="cR">'+_e(j['Cut Remark']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnO btn-sm" style="flex:1" onclick="_saveCut(\''+_esc(jobId)+'\')"><i class="fa-solid fa-check"></i> Save</button>');
}
function _saveCut(jobId){
  var d={jobId:jobId,cutStatus:_v2('cSt'),cutStart:_v2('cST'),cutEnd:_v2('cET'),cutQty:_v2('cQ'),cutRemark:_v2('cR')};
  _mLoad();
  _api('updateCut',d,function(r){
    if(r.success){var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(j)j['Cut Status']=d.cutStatus;_mClose();_toast('Cut updated!');_lv(_V);
      if(d.cutStatus==='Done'&&j){var op=(_D.users||[]).filter(function(u){return(u['Role']||'').toLowerCase()==='operator'&&u['Machine Assigned']===j['Machine Assigned'];})[0]||{};var opWA=op['WhatsApp']||op['Mobile'];if(opWA)setTimeout(function(){_waCutDone(opWA,op['Full Name']||'Operator',jobId,j['Job Name / Description']||'');},600);}
    } else _toast(r.error||'Failed');
  });
}

function _mPrint(jobId){
  var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(!j)return;
  _mOpen('Print -- '+jobId,
    '<div class="alert ok"><i class="fa-solid fa-check"></i>Cutting done -- ready to print</div>'
    +'<div class="fg"><label>Print Status *</label><select id="pSt"><option value="Pending"'+(j['Print Status']==='Pending'?' selected':'')+'>Pending</option><option value="In Progress"'+(j['Print Status']==='In Progress'?' selected':'')+'>In Progress</option><option value="Done"'+(j['Print Status']==='Done'?' selected':'')+'>Done</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="pST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="pET"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Impressions Run</label><input type="number" id="pIR" value="'+_n(j['Impressions Run'])+'"></div><div class="fg"><label>Good Impressions</label><input type="number" id="pIG" value="'+_n(j['Good Impressions'])+'"></div></div>'
    +'<div class="fg"><label>Rejections</label><input type="number" id="pRej" value="'+_n(j['Rejection Impressions'])+'"></div>'
    +'<div class="fg"><label>Remark</label><textarea id="pR">'+_e(j['Print Remark']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnB btn-sm" style="flex:1" onclick="_savePrint(\''+_esc(jobId)+'\')"><i class="fa-solid fa-print"></i> Save</button>');
}
function _savePrint(jobId){
  var d={jobId:jobId,printStatus:_v2('pSt'),printStart:_v2('pST'),printEnd:_v2('pET'),impressions:_v2('pIR'),goodImp:_v2('pIG'),rejectImp:_v2('pRej'),printRemark:_v2('pR')};
  _mLoad();
  _api('updatePrint',d,function(r){if(r.success){var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(j)j['Print Status']=d.printStatus;_mClose();_toast('Print updated!');_lv(_V);}else _toast(r.error||'Failed');});
}

function _mDispatchJob(jobId){
  var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(!j)return;
  _mOpen('Dispatch -- '+jobId,
    '<div class="alert ok"><i class="fa-solid fa-check"></i>Print done</div>'
    +(j['QC Pass/Fail']!=='Pass'?'<div class="alert warn"><i class="fa-solid fa-triangle-exclamation"></i>QC not passed yet</div>':'')
    +'<div class="fg"><label>Vehicle No.</label><input id="dVeh" placeholder="DL 1C 1234" value="'+_e(j['Vehicle No.']||'')+'"></div>'
    +'<div class="fg"><label>Driver Name</label><input id="dDrv" value="'+_e(j['Driver Name']||'')+'"></div>'
    +'<div class="fg"><label>LR Number</label><input id="dLR" value="'+_e(j['LR Number']||'')+'"></div>'
    +'<div class="fg"><label>Expected Delivery</label><input type="date" id="dEDD"></div>'
    +'<div class="fg"><label>Note</label><textarea id="dNote">'+_e(j['Supervisor Notes']||'')+'</textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnT btn-sm" style="flex:1" onclick="_saveDispatch(\''+_esc(jobId)+'\')"><i class="fa-solid fa-truck"></i> Dispatch</button>');
}
function _saveDispatch(jobId){
  var d={jobId:jobId,vehicleNo:_v2('dVeh'),driverName:_v2('dDrv'),lrNumber:_v2('dLR'),edd:_v2('dEDD'),supNote:_v2('dNote')};
  _mLoad();
  _api('updateDispatch',d,function(r){
    if(r.success){var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(j)j['Dispatch Status']='Done';_mClose();_toast('Dispatched!');_lv(_V);
      if(j){var party=(_D.parties||[]).filter(function(p){return p['Party ID']===j['Party ID'];})[0]||{};var wa=party['WhatsApp 1']||party['Mobile 1'];if(wa)setTimeout(function(){_waDispatch(wa,party['Contact Person 1']||'',j['Job Name / Description']||'',jobId,_today(),d.vehicleNo,d.lrNumber);},700);}
    } else _toast(r.error||'Failed');
  });
}

function _mInvoice(jobId){
  _mOpen('Invoice -- '+jobId,
    '<div class="fg"><label>Invoice Type</label><select id="iT"><option value="Pakka">Pakka (With GST)</option><option value="Kachha">Kachha</option></select></div>'
    +'<div class="fg"><label>Taxable Amount (Rs) *</label><input type="number" id="iAmt" placeholder="5000"></div>'
    +'<div class="form-row"><div class="fg"><label>CGST %</label><input type="number" id="iCG" value="9"></div><div class="fg"><label>SGST %</label><input type="number" id="iSG" value="9"></div></div>'
    +'<div class="fg"><label>Payment Terms (days)</label><input type="number" id="iTP" value="30"></div>'
    +'<div class="fg"><label>Notes</label><textarea id="iN"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" style="flex:1" onclick="_saveInvoice(\''+_esc(jobId)+'\')"><i class="fa-solid fa-file-invoice"></i> Generate</button>');
}
function _saveInvoice(jobId){
  var d={jobId:jobId,type:_v2('iT'),taxable:_v2('iAmt'),cgst:_v2('iCG'),sgst:_v2('iSG'),terms:_v2('iTP'),note:_v2('iN')};
  if(!d.taxable){_toast('Enter taxable amount');return;}
  _mLoad();
  _api('addInvoice',d,function(r){if(r.success){var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===jobId;})[0];if(j)j['Billed (Y/N)']=true;if(r.invoice&&_D.invoices)_D.invoices.push(r.invoice);_mClose();_toast('Invoice generated!');_lv('invoices');}else _toast(r.error||'Failed');});
}

function _mRecordPayment(invNo){
  var inv=(_D.invoices||[]).filter(function(i){return i['Invoice No.']===invNo;})[0];if(!inv)return;
  var netPay=_n(inv['Net Payable (Formula)']||inv['Net Payable']);
  _mOpen('Record Payment',
    '<div class="alert info"><i class="fa-solid fa-file-invoice"></i><b>'+_e(invNo)+'</b> -- Rs.'+_f(netPay)+'</div>'
    +'<div class="fg"><label>Amount (Rs) *</label><input type="number" id="pmA" placeholder="0"></div>'
    +'<div class="fg"><label>Payment Mode *</label><select id="pmM"><option>Cash</option><option>UPI</option><option>NEFT</option><option>RTGS</option><option>Cheque</option></select></div>'
    +'<div class="fg"><label>Ref / UTR</label><input id="pmR" placeholder="Transaction ID"></div>'
    +'<div class="fg"><label>TDS (Rs)</label><input type="number" id="pmT" value="0"></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" style="flex:1" onclick="_savePayment(\''+_esc(invNo)+'\')"><i class="fa-solid fa-check"></i> Record</button>');
}
function _savePayment(invNo){
  var d={invoiceNo:invNo,amount:_v2('pmA'),mode:_v2('pmM'),ref:_v2('pmR'),tds:_v2('pmT'),type:'Full Payment'};
  if(!d.amount||parseFloat(d.amount)<=0){_toast('Enter valid amount');return;}
  _mLoad();
  _api('addPayment',d,function(r){if(r.success){_mClose();_toast('Payment recorded!');_lv('payments');}else _toast(r.error||'Failed');});
}

function _mStockIn(){
  var parties=(_D.parties||[]).filter(function(p){return(p['Status']||'Active')==='Active';});
  _mOpen('Stock Inward',
    '<div class="fg"><label>Party *</label><select id="siP"><option value="">-- Select --</option>'+parties.map(function(p){return '<option value="'+_esc(p['Party ID']||'')+'">'+_e(p['Party Name']||'')+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>Challan No. *</label><input id="siCh" placeholder="CH-2501"></div>'
    +'<div class="form-row"><div class="fg"><label>Challan Date</label><input type="date" id="siCD"></div><div class="fg"><label>Vehicle No.</label><input id="siV" placeholder="DL 1AB 1234"></div></div>'
    +'<div class="fg"><label>Paper Type *</label><select id="siPT"><option>Duplex</option><option>Kraft</option><option>Normal</option><option>Loose</option><option>Craft</option><option>Art Paper</option><option>Newsprint</option><option>Bond</option><option>Other</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Sheet Size *</label><input id="siSz" placeholder="27x35"></div><div class="fg"><label>GSM *</label><input type="number" id="siG" placeholder="300"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Bundles *</label><input type="number" id="siB" placeholder="12"></div><div class="fg"><label>Gross/Bundle *</label><input type="number" id="siGB" placeholder="4"></div></div>'
    +'<div class="fg"><label>Location</label><input id="siR" placeholder="Rack A1"></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnG btn-sm" style="flex:1" onclick="_saveStockIn()"><i class="fa-solid fa-boxes-stacked"></i> Add Stock</button>');
}
function _saveStockIn(){
  var d={partyId:_v2('siP'),challan:_v2('siCh'),chDate:_v2('siCD'),vehicle:_v2('siV'),paperType:_v2('siPT'),sheetSize:_v2('siSz'),gsm:_v2('siG'),bundles:_v2('siB'),gross:_v2('siGB'),rack:_v2('siR')};
  if(!d.partyId||!d.challan||!d.bundles){_toast('Fill required fields');return;}
  _mLoad();
  _api('addStock',d,function(r){if(r.success){if(_D.stock&&r.stock)_D.stock.push(r.stock);_mClose();_toast('Stock added!');_lv('stock');}else _toast(r.error||'Failed');});
}

function _mNewQC(){_mNewQCForJob('');}
function _mNewQCForJob(preJobId){
  var readyJobs=(_D.jobs||[]).filter(function(j){return j['Print Status']==='Done';});
  _mOpen('QC Entry',
    '<div class="fg"><label>Job *</label><select id="qJ"><option value="">-- Select --</option>'+readyJobs.map(function(j){return '<option value="'+_esc(j['Job ID']||'')+'"'+(j['Job ID']===preJobId?' selected':'')+'>'+_e((j['Job ID']||'')+' -- '+(j['Job Name / Description']||''))+'</option>';}).join('')+'</select></div>'
    +'<div class="fg"><label>QC Stage *</label><select id="qSt"><option>Pre-press QC</option><option>Print QC</option><option>Post-press QC</option><option>Final QC</option></select></div>'
    +'<div class="form-sec">Ratings (1-5)</div>'
    +'<div class="form-row"><div class="fg"><label>Color Accuracy</label><input type="number" id="qCA" min="1" max="5" value="4"></div><div class="fg"><label>Register</label><input type="number" id="qRA" min="1" max="5" value="4"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Ink Density</label><input type="number" id="qID" min="1" max="5" value="4"></div><div class="fg"><label>Cutting</label><input type="number" id="qCuA" min="1" max="5" value="4"></div></div>'
    +'<div class="fg"><label>Result *</label><select id="qR"><option>Pass</option><option>Partial Pass</option><option>Fail</option><option>Pending</option></select></div>'
    +'<div class="form-row"><div class="fg"><label>Total Inspected</label><input type="number" id="qTI" placeholder="200"></div><div class="fg"><label>Rejection Qty</label><input type="number" id="qRQ" value="0"></div></div>'
    +'<div class="fg"><label>Corrective Action</label><textarea id="qNote"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnV btn-sm" style="flex:1" onclick="_saveQC()"><i class="fa-solid fa-magnifying-glass-chart"></i> Save QC</button>');
}
function _saveQC(){
  var d={jobId:_v2('qJ'),stage:_v2('qSt'),colorAcc:_v2('qCA'),regAcc:_v2('qRA'),inkDen:_v2('qID'),cutAcc:_v2('qCuA'),result:_v2('qR'),totalInsp:_v2('qTI'),rejQty:_v2('qRQ'),note:_v2('qNote')};
  if(!d.jobId){_toast('Select a job');return;}
  _mLoad();
  _api('addQC',d,function(r){
    if(r.success){var j=(_D.jobs||[]).filter(function(x){return x['Job ID']===d.jobId;})[0];if(j){j['QC Done (Y/N)']=true;j['QC Pass/Fail']=d.result;}
      _mClose();_toast('QC saved!');_lv(_V);
      if(d.result==='Fail'&&j){var sup=(_D.users||[]).filter(function(u){return(u['Role']||'').toLowerCase()==='supervisor';})[0]||{};var supWA=sup['WhatsApp']||sup['Mobile'];if(supWA)setTimeout(function(){_waQCFailed(supWA,d.jobId,j['Job Name / Description']||'',d.stage,d.rejQty);},600);}
    } else _toast(r.error||'Failed');
  });
}

function _mNewDowntime(){
  _mOpen('Log Downtime',
    '<div class="fg"><label>Machine *</label><select id="dtM"><option value="Machine 1">Machine 1</option><option value="Machine 2">Machine 2</option><option value="Machine 3">Machine 3</option></select></div>'
    +'<div class="fg"><label>Category *</label><select id="dtC"><option>Mechanical</option><option>Electrical</option><option>Operator Error</option><option>Scheduled Maintenance</option><option>Chemical Issue</option><option>Power Cut</option><option>Other</option></select></div>'
    +'<div class="fg"><label>Description *</label><textarea id="dtD" placeholder="Describe the issue..."></textarea></div>'
    +'<div class="form-row"><div class="fg"><label>Start Time</label><input type="datetime-local" id="dtST"></div><div class="fg"><label>End Time</label><input type="datetime-local" id="dtET"></div></div>'
    +'<div class="form-row"><div class="fg"><label>Repair Cost (Rs)</label><input type="number" id="dtRC" value="0"></div><div class="fg"><label>Preventable?</label><select id="dtPrev"><option value="Y">Yes</option><option value="N">No</option></select></div></div>'
    +'<div class="fg"><label>Action Taken</label><textarea id="dtAct"></textarea></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnR btn-sm" style="flex:1" onclick="_saveDowntime()"><i class="fa-solid fa-triangle-exclamation"></i> Log Issue</button>');
}
function _saveDowntime(){
  var d={machine:_v2('dtM'),category:_v2('dtC'),desc:_v2('dtD'),startTime:_v2('dtST'),endTime:_v2('dtET'),cost:_v2('dtRC'),action:_v2('dtAct'),preventable:_v2('dtPrev')};
  if(!d.desc){_toast('Enter description');return;}
  _mLoad();
  _api('addDowntime',d,function(r){if(r.success){_mClose();_toast('Downtime logged!');_lv(_V);}else _toast(r.error||'Failed');});
}

function _mNewParty(){
  _mOpen('New Party',
    '<div class="fg"><label>Party Name *</label><input id="npN" placeholder="ABC Packaging Pvt Ltd"></div>'
    +'<div class="fg"><label>Type</label><select id="npT"><option>Brand Owner</option><option>Manufacturer</option><option>Trader</option><option>Printer</option><option>Other</option></select></div>'
    +'<div class="form-sec">Contact</div>'
    +'<div class="fg"><label>Contact Person *</label><input id="npCP" placeholder="Rajesh Kumar"></div>'
    +'<div class="form-row"><div class="fg"><label>Mobile *</label><input type="tel" id="npM" placeholder="9XXXXXXXXX"></div><div class="fg"><label>WhatsApp</label><input type="tel" id="npWA" placeholder="9XXXXXXXXX"></div></div>'
    +'<div class="fg"><label>GST Number</label><input id="npGST" placeholder="07XXXXX0000X1Z5"></div>'
    +'<div class="form-row"><div class="fg"><label>City *</label><input id="npCity" placeholder="Delhi"></div><div class="fg"><label>Credit Days</label><input type="number" id="npCD" value="30"></div></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnB btn-sm" style="flex:1" onclick="_saveNewParty()"><i class="fa-solid fa-plus"></i> Add Party</button>');
}
function _saveNewParty(){
  var d={name:_v2('npN'),type:_v2('npT'),contact:_v2('npCP'),mobile:_v2('npM'),whatsapp:_v2('npWA'),gst:_v2('npGST'),city:_v2('npCity'),creditDays:_v2('npCD')};
  if(!d.name||!d.mobile){_toast('Fill required fields');return;}
  _mLoad();
  _api('addParty',d,function(r){if(r.success){if(_D.parties&&r.party)_D.parties.push(r.party);_mClose();_toast('Party added!');_lv('parties');}else _toast(r.error||'Failed');});
}

function _mNewExpense(){
  _mOpen('New Expense',
    '<div class="fg"><label>Category *</label><select id="exC"><option>Ink</option><option>Plate</option><option>Chemical</option><option>Lamination Film</option><option>Maintenance</option><option>Electricity</option><option>Packing Material</option><option>Labour</option><option>Miscellaneous</option></select></div>'
    +'<div class="fg"><label>Description *</label><input id="exD" placeholder="Cyan Ink 1Kg"></div>'
    +'<div class="fg"><label>Vendor</label><input id="exV" placeholder="Vendor name"></div>'
    +'<div class="form-row"><div class="fg"><label>Qty</label><input type="number" id="exQ" placeholder="5"></div><div class="fg"><label>Unit</label><select id="exU"><option>Kg</option><option>Litre</option><option>Pcs</option><option>Roll</option><option>Bill</option><option>Job</option><option>Set</option></select></div></div>'
    +'<div class="form-row"><div class="fg"><label>Rate (Rs)</label><input type="number" id="exR" placeholder="800"></div><div class="fg"><label>GST %</label><input type="number" id="exGST" value="18"></div></div>'
    +'<div class="fg"><label>Payment Mode</label><select id="exPM"><option>Cash</option><option>UPI</option><option>NEFT</option><option>Cheque</option></select></div>',
    '<button class="btn btnOut btn-sm" onclick="_mClose()">Cancel</button><button class="btn btnO btn-sm" style="flex:1" onclick="_saveExpense()"><i class="fa-solid fa-receipt"></i> Add Expense</button>');
}
function _saveExpense(){
  var d={category:_v2('exC'),desc:_v2('exD'),vendor:_v2('exV'),qty:_v2('exQ'),unit:_v2('exU'),rate:_v2('exR'),gst:_v2('exGST'),mode:_v2('exPM')};
  if(!d.desc){_toast('Enter description');return;}
  _mLoad();
  _api('addExpense',d,function(r){if(r.success){_mClose();_toast('Expense added!');_lv('expenses');}else _toast(r.error||'Failed');});
}

function _mPartyDetail(partyId){
  var p=(_D.parties||[]).filter(function(x){return x['Party ID']===partyId;})[0];if(!p)return;
  var jobs=(_D.jobs||[]).filter(function(j){return j['Party ID']===partyId;});
  var body='<div class="info-row"><span class="ir-l">Contact</span><span class="ir-v">'+_e(p['Contact Person 1']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Mobile</span><span class="ir-v">'+_e(p['Mobile 1']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">GST</span><span class="ir-v">'+_e(p['GST Number']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">City</span><span class="ir-v">'+_e(p['Billing City']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Credit Days</span><span class="ir-v">'+(_n(p['Credit Days'])||30)+' days</span></div>'
    +'<div class="info-row"><span class="ir-l">Outstanding</span><span class="ir-v" style="color:#EA4335;font-weight:700">Rs.'+_f(_n(p['Outstanding Balance (Rs)']))+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Billed</span><span class="ir-v">Rs.'+_f(_n(p['Total Billed (Rs)']))+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Total Jobs</span><span class="ir-v">'+jobs.length+'</span></div>';
  var foot='<button class="btn btnOut btn-sm" onclick="_mClose()">Close</button>';
  if(p['WhatsApp 1'])foot='<button class="wa-btn btn-sm" onclick="_waParty(\''+_esc(p['WhatsApp 1'])+'\',\''+_esc(p['Contact Person 1']||'')+'\')"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>'+foot;
  _mOpen(p['Party Name']||'Party',body,foot);
}

/* ════ WHATSAPP ══════════════════════════ */
function _wa(num,msg,label){
  num=String(num||'').replace(/\D/g,'');
  if(!num){_toast('No WhatsApp number');return;}
  if(!num.startsWith('91')&&num.length===10)num='91'+num;
  if(!_gasOk()){window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');return;}
  _toast('Sending...');
  _api('sendWhatsApp',{number:num,message:msg},function(r){
    if(r&&r.success)_toast('WhatsApp sent'+(label?' -- '+label:''));
    else{_toast('Opening WhatsApp');window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');}
  },function(){window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');});
}
function _waParty(num,name){_wa(num,'Namaskar '+(name||'')+' ji!\nNitin Mittal Offset Printing se bol rahe hain.\nKoi kaam ho to bataiye.\n-- Nitin Mittal Press',name);}
function _waDispatch(num,name,jobName,jobId,dispDate,veh,lr){_wa(num,'Namaskar '+(name||'')+' ji!\n\nAapka kaam complete:\n*'+jobName+'*\nJob: '+jobId+'\nDispatch: '+(dispDate||_today())+'\nVehicle: '+(veh||'--')+'\nLR: '+(lr||'--')+'\n\nDhanyawad!\n-- Nitin Mittal Press','Dispatch');}
function _waPaymentReminder(num,invNo,amount,dueDate,name){var od=dueDate&&dueDate<_today();_wa(num,'Namaskar '+(name||'')+' ji!\n\n'+(od?'Payment Overdue!\n\n':'Payment Reminder\n\n')+'Invoice: *'+invNo+'*\nAmount: *Rs.'+amount+'*\nDue: '+(dueDate||'--')+'\n\nKripya payment karein.\n-- Nitin Mittal Press','Payment');}
function _waCutDone(num,opName,jobId,jobName){_wa(num,'Namaskar '+(opName||'')+' ji!\nCutting done: '+jobId+' -- '+jobName+'\nPrinting shuru karein.\n-- NM Press','Cut Done');}
function _waQCFailed(num,jobId,jobName,stage,rejQty){_wa(num,'QC Fail!\n'+jobId+' -- '+jobName+'\n'+stage+'\nRejection: '+(rejQty||0)+'\nUrgent review karein.\n-- NM Press','QC Fail');}
function _waJobAssigned(num,opName,jobId,jobName,party,machine,pri,promDate){_wa(num,'Namaskar '+(opName||'')+' ji!\nNaya Job: '+jobId+' -- '+jobName+'\nParty: '+party+'\n'+machine+'\nP'+pri+' | '+promDate+'\nApp check karein.\n-- NM Press','Job Assigned');}

/* ════ MODAL HELPERS ═════════════════════ */
function _mOpen(title,body,foot){
  _elSet('mTitle',title);
  _el('mBody',function(e){e.innerHTML=body;});
  _el('mFoot',function(mf){if(foot){mf.innerHTML=foot;mf.style.display='flex';}else{mf.innerHTML='';mf.style.display='none';}});
  _el('mOv',function(e){e.classList.add('on');});
  _el('modal',function(e){e.classList.add('on');e.scrollTop=0;});
}
function _mClose(){_el('mOv',function(e){e.classList.remove('on');});_el('modal',function(e){e.classList.remove('on');});}
function _mLoad(){_el('mFoot',function(mf){mf.innerHTML='<button class="btn btnOut btn-full" disabled><i class="fa-solid fa-spinner fa-spin"></i> Saving...</button>';});}
function _fabClick(){if(_fabCb)_fabCb();}

/* ════ COMPONENT HELPERS ═════════════════ */
function _kpi(label,val,icon,color,bg,sub,trend){
  var trendHtml='';
  if(trend){var tCls=trend>0?'up':'dn';trendHtml='<div class="kpi-trend '+tCls+'">'+(trend>0?'&#9650;':'&#9660;')+' '+Math.abs(trend)+'%</div>';}
  return '<div class="kpi" style="--kc:'+color+';--kib:'+bg+'">'
    +'<div class="kpi-top"><div class="kpi-ico"><i class="fa-solid '+icon+'"></i></div>'+trendHtml+'</div>'
    +'<div class="kpi-val">'+val+'</div>'
    +'<div class="kpi-lbl">'+label+'</div>'
    +(sub?'<div class="kpi-sub">'+sub+'</div>':'')
    +'</div>';
}
function _tile(icon,color,bg,name,sub,fn,badge){
  return '<div class="qa-tile" style="--tc:'+color+';--tib:'+bg+'" onclick="'+fn+'">'
    +(badge&&badge!==''&&badge!=='0'?'<div class="qa-badge">'+badge+'</div>':'')
    +'<div class="qa-ico"><i class="fa-solid '+icon+'"></i></div>'
    +'<div class="qa-name">'+name+'</div>'
    +'<div class="qa-sub">'+sub+'</div></div>';
}


/* ════ SETTINGS VIEW ════════════════════ */
function _vSettings(){
  var role=_U?_U.role:'viewer';
  var html='<div class="sec-head"><div class="sec-title">App Settings</div></div>';
  /* GAS status */
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-server"></i>Connection Status</div></div><div class="card-body">'
    +(  _gasOk()
      ? '<div class="alert ok" style="margin-bottom:0"><i class="fa-solid fa-circle-check"></i><div><b>GAS Connected</b><br><span style="font-size:11px;word-break:break-all">'+_e(GAS_URL)+'</span></div></div>'
      : '<div class="alert warn" style="margin-bottom:0"><i class="fa-solid fa-triangle-exclamation"></i><div><b>Demo Mode</b> — GAS not connected<br><span style="font-size:12px">app.js line 3 mein GAS_URL replace karo</span></div></div>'
    )+'</div></div>';
  /* User info */
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-user"></i>Logged In As</div></div><div class="card-body">'
    +'<div class="info-row"><span class="ir-l">Name</span><span class="ir-v">'+_e(_U.name||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Email</span><span class="ir-v" style="font-size:12px">'+_e(_U.email||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Role</span><span class="ir-v"><span class="badge bb">'+_rl(_U.role)+'</span></span></div>'
    +(  _U.machine
      ? '<div class="info-row"><span class="ir-l">Machine</span><span class="ir-v">'+_e(_U.machine)+'</span></div>'
      : ''
    )+'</div></div>';
  /* Demo users reference */
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-solid fa-users"></i>Demo Logins</div></div><div class="card-body">'
    +'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Email</th><th>Password</th><th>Role</th></tr></thead><tbody>'
    +'<tr><td>nitin@press.com</td><td>nitin@123</td><td><span class="badge br">Admin</span></td></tr>'
    +'<tr><td>ravi@press.com</td><td>ravi@123</td><td><span class="badge bv">Supervisor</span></td></tr>'
    +'<tr><td>m1@press.com</td><td>m1@123</td><td><span class="badge bb">Operator M1</span></td></tr>'
    +'<tr><td>m2@press.com</td><td>m2@123</td><td><span class="badge bb">Operator M2</span></td></tr>'
    +'<tr><td>m3@press.com</td><td>m3@123</td><td><span class="badge bb">Operator M3</span></td></tr>'
    +'<tr><td>ramesh@press.com</td><td>ramesh@123</td><td><span class="badge bo">Cutting</span></td></tr>'
    +'<tr><td>bauji@press.com</td><td>bauji@123</td><td><span class="badge bt">Viewer</span></td></tr>'
    +'</tbody></table></div>'
    +'<div style="margin-top:12px;font-size:12px;color:var(--tx3)">Master password (kisi bhi account pe): <b>nmpress@admin2026</b></div>'
    +'</div></div>';
  /* MAS info */
  html+='<div class="card"><div class="card-head"><div class="card-title"><i class="fa-brands fa-whatsapp" style="color:#22C55E"></i>WhatsApp (MAS API)</div></div><div class="card-body">'
    +'<div class="info-row"><span class="ir-l">Username</span><span class="ir-v" style="font-size:12px">nationalenterprises</span></div>'
    +'<div class="info-row"><span class="ir-l">API Key</span><span class="ir-v" style="font-size:11px;word-break:break-all">1f6b2a4fa55d78a7...</span></div>'
    +'<div style="margin-top:10px"><button class="wa-btn btn-sm" onclick="_waTest()"><i class="fa-brands fa-whatsapp"></i> Test WhatsApp</button></div>'
    +'</div></div>';
  /* Sign out */
  html+='<div style="margin-top:8px"><button class="btn btnR btn-full" onclick="_signOut()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button></div>';
  _html(html);
}
function _mInvDetail(invNo){
  var inv=(_D.invoices||[]).filter(function(i){return i['Invoice No.']===invNo;})[0];
  if(!inv)return;
  var st=inv['Status']||'Pending';var stCls=st==='Paid'?'bg':st==='Overdue'?'br':st==='Partial'?'bo':'bb';
  var netPay=_n(inv['Net Payable (Formula)']||inv['Net Payable']);
  var role=_U?_U.role:'viewer';
  var body='<div style="text-align:center;padding:16px 0 20px"><div style="font-size:30px;font-weight:800;color:var(--tx)">&#8377;'+_f(_n(inv['Final Amount']))+'</div>'
    +'<span class="badge '+stCls+'" style="margin-top:8px">'+st+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Invoice No.</span><span class="ir-v"><b>'+_e(inv['Invoice No.']||'--')+'</b></span></div>'
    +'<div class="info-row"><span class="ir-l">Party</span><span class="ir-v">'+_e(inv['Party Name']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Invoice Date</span><span class="ir-v">'+_e(inv['Invoice Date']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Due Date</span><span class="ir-v" style="'+(st==='Overdue'?'color:#EA4335;font-weight:700':'')+'">'+_e(inv['Due Date']||'--')+'</span></div>'
    +'<div class="info-row"><span class="ir-l">Net Payable</span><span class="ir-v" style="color:#4285F4;font-weight:700">&#8377;'+_f(netPay)+'</span></div>';
  var foot='<button class="btn btnOut btn-sm" onclick="_mClose()">Close</button>';
  if(role==='admin'&&st!=='Paid')foot+='<button class="btn btnG btn-sm" onclick="_mClose();_mRecordPayment(\''+_esc(invNo)+'\'"><i class="fa-solid fa-indian-rupee-sign"></i> Record Payment</button>';
  _mOpen('Invoice Detail',body,foot);
}
function _waTest(){
  if(!_U){return;}
  _toast('WhatsApp test message bheja...');
  _wa(_U.whatsapp||'','Test message from NM Press app!','Test');
}

/* ════ JOB LOG VIEW ═════════════════════ */
function _vJobLog(){
  var jobs=(_D.jobs||[]).slice().reverse();
  var html='<div class="search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input id="jlSrch" placeholder="Search job, party..." oninput="_jlRender(this.value)"></div>'
    +'<div id="jlList"></div>';
  _html(html);
  function renderJL(q){
    q=(q||'').toLowerCase();
    var flt=jobs.filter(function(j){
      return !q||(j['Job ID']||'').toLowerCase().indexOf(q)>=0
        ||(j['Job Name / Description']||'').toLowerCase().indexOf(q)>=0
        ||(j['Party Name']||'').toLowerCase().indexOf(q)>=0;
    });
    if(!flt.length){document.getElementById('jlList').innerHTML='<div class="empty"><i class="fa-solid fa-scroll"></i><h3>No jobs found</h3><p>Try different search terms</p></div>';return;}
    var out='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job ID</th><th>Description</th><th>Party</th><th>Machine</th><th>Priority</th><th>Cut</th><th>Print</th><th>Dispatch</th><th>Status</th><th>Promised</th></tr></thead><tbody>';
    flt.forEach(function(j){
      var pri=j['Priority']||j['Priority (1-5)']||3;
      var delayed=(j['Delay Flag']==='DELAYED'||j['Delay Flag (Formula)']==='DELAYED');
      var jid2=_esc(j['Job ID']||'');
      out+='<tr onclick="_mJobDetail(\''+jid2+'\')" style="cursor:pointer">'
        +'<td><b>'+_e(j['Job ID']||'--')+'</b>'+(delayed?' <span style="color:#EA4335">&#9888;</span>':'')+'</td>'
        +'<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_e(j['Job Name / Description']||'--')+'</td>'
        +'<td>'+_e(j['Party Name']||'--')+'</td>'
        +'<td>'+_e(j['Machine Assigned']||'--')+'</td>'
        +'<td><span class="badge '+(pri==1?'br':pri==2?'bo':'bb')+'">P'+pri+'</span></td>'
        +'<td><span class="badge '+_cBadge(j['Cut Status']||'Pending')+'">'+_e(j['Cut Status']||'Pending')+'</span></td>'
        +'<td><span class="badge '+_pBadge(j['Print Status']||'Pending')+'">'+_e(j['Print Status']||'Pending')+'</span></td>'
        +'<td><span class="badge '+(j['Dispatch Status']==='Done'?'bg':'bx')+'">'+_e(j['Dispatch Status']||'Pending')+'</span></td>'
        +'<td>'+_stBadge(j['Job Status']||'Pending')+'</td>'
        +'<td style="white-space:nowrap">'+_e(j['Promised Date']||'--')+'</td>'
        +'</tr>';
    });
    out+='</tbody></table></div>';
    out='<div class="sec-head" style="margin-bottom:8px"><div class="sec-title">'+flt.length+' jobs</div></div>'+out;
    document.getElementById('jlList').innerHTML=out;
  }
  window._jlRender=renderJL;
  renderJL('');
}

/* ════ UTILS ═════════════════════════════ */
function _today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function _n(v){var n=parseFloat(v);return isNaN(n)?0:n;}
function _f(n){return Number(n).toLocaleString('en-IN',{maximumFractionDigits:0});}
function _e(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function _esc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function _v(id){var e=document.getElementById(id);return e?(e.value||'').trim():'';}
function _toast(msg,dur){
  _el('toast',function(t){t.textContent=msg;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},dur||2800);});
}
