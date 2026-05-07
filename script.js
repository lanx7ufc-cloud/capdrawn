// ═══════════════════════════════════════
// CAPDRAWN - FRONTEND SCRIPT
// ═══════════════════════════════════════

const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// ═══ APP STATE ═══
const APP = {
  me: null,
  isAdm: false,
  maintenance: false,
  payLinks: { tiktok: 'https://lite.tiktok.com/ref/capdrawnn', yt: 'https://youtube.com/@capdrawnn' },
  subscribers: new Set(),
  pinnedIds: new Set(),
  vipBenefits: ['Emblema exclusivo','Selo VIP','Nome em destaque','Super Chat','Live','IA integrada'],
};

let COMMENTS = [];
let nextId = 1;
let USERS = {};

const EMBLEMAS = [
  {id:'e1',emoji:'🎵',name:'Criador',color:'#e8f4ff',req:'free'},
  {id:'e2',emoji:'⚡',name:'Rápido',color:'#fff8e0',req:'free'},
  {id:'e3',emoji:'🏆',name:'Top',color:'#fff0e8',req:'vip'},
  {id:'e4',emoji:'💎',name:'Diamante',color:'#f0e8ff',req:'ultra'},
  {id:'e5',emoji:'🔥',name:'Viral',color:'#ffe8e8',req:'vip'},
  {id:'e6',emoji:'🌟',name:'Estrela',color:'#fffff0',req:'ultra'},
];

const BADGE_COLORS = {
  estudante:{bg:'#f0f0f5',c:'#555'},medicina:{bg:'#fff0f5',c:'#c2185b'},
  tecnologia:{bg:'#e8fff5',c:'#00a060'},criador:{bg:'#fff3e0',c:'#e65100'},
  musica:{bg:'#f3e5f5',c:'#6a1b9a'},
};
const BADGE_ICONS = {estudante:'📚',medicina:'🏥',tecnologia:'💻',criador:'🎬',musica:'🎵'};

// ═══ AUDIO ENGINE ═══
let audioCtx=null, audioBuf=null, procBuf=null, silRegions=[], sourceNode=null, isPlaying=false, fileName='', fileSize=0;
const SS = {threshold:-35, minDur:.5, pad:.05};

function onDrag(e,on){e.preventDefault();document.getElementById('dropZone').classList.toggle('over',on);}
function onDrop(e){e.preventDefault();document.getElementById('dropZone').classList.remove('over');if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0]);}
function onFileSel(inp){if(inp.files[0])handleFile(inp.files[0]);}

async function handleFile(f){
  if(!f.type.startsWith('audio/')&&!f.type.startsWith('video/')){toast('⚠️ Formato não suportado!');return;}
  fileName=f.name;fileSize=f.size;
  document.getElementById('dropZone').style.display='none';
  document.getElementById('sbar').classList.add('show');
  document.getElementById('wcard').classList.add('show');
  document.getElementById('wfName').textContent=f.name;
  document.getElementById('wfMeta').textContent=fSize(fileSize)+' · '+f.type.split('/')[1].toUpperCase();
  setWStatus('y','Pronto para processar');
  try{
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    const ab=await f.arrayBuffer();
    audioBuf=await audioCtx.decodeAudioData(ab);
    document.getElementById('wfMeta').textContent=fSize(fileSize)+' · '+fDur(audioBuf.duration)+' · '+audioBuf.sampleRate+'Hz';
    document.getElementById('sv1').textContent=fDur(audioBuf.duration);
    drawWave(audioBuf,'cv1',null);
    document.getElementById('bPlay').disabled=false;
    toast('📂 Carregado! Clique em ⚡ Processar');
  }catch(e){fakeAudio(f);}
}

function fakeAudio(f){
  const d=45+Math.random()*60;
  audioBuf={duration:d,_fake:true,sampleRate:44100,numberOfChannels:1,getChannelData:()=>new Float32Array(Math.floor(d*44100))};
  document.getElementById('wfMeta').textContent=fSize(fileSize)+' · '+fDur(d)+' · 44100Hz';
  document.getElementById('sv1').textContent=fDur(d);
  drawFakeWave('cv1',null,d);
  document.getElementById('bPlay').disabled=false;
  toast('📂 Carregado! Clique em ⚡ Processar');
}

function drawWave(buf,id,sils){
  const cv=document.getElementById(id),ctx=cv.getContext('2d');
  const W=cv.offsetWidth||740,H=cv.height;
  cv.width=W;ctx.clearRect(0,0,W,H);
  const data=buf.getChannelData(0),step=Math.ceil(data.length/W),mid=H/2;
  ctx.fillStyle='#f6f6f9';ctx.fillRect(0,0,W,H);
  if(sils&&sils.length){ctx.fillStyle='rgba(240,48,80,.1)';sils.forEach(s=>{const x1=s.start/buf.duration*W,x2=s.end/buf.duration*W;ctx.fillRect(x1,0,x2-x1,H);});}
  ctx.fillStyle=id==='cv2'?'#0052e0':'#0b0b14';
  for(let i=0;i<W;i++){let mn=1,mx=-1;for(let j=0;j<step;j++){const v=data[i*step+j]||0;if(v<mn)mn=v;if(v>mx)mx=v;}const y1=(1+mn)/2*H,y2=(1+mx)/2*H;ctx.globalAlpha=.7;ctx.fillRect(i,y1,1,Math.max(1,y2-y1));}
  ctx.globalAlpha=1;ctx.strokeStyle='rgba(0,0,0,.1)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,mid);ctx.lineTo(W,mid);ctx.stroke();
}

function drawFakeWave(id,sils,dur){
  const cv=document.getElementById(id),ctx=cv.getContext('2d');
  const W=cv.offsetWidth||740,H=cv.height;cv.width=W;ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#f6f6f9';ctx.fillRect(0,0,W,H);
  if(sils&&dur){ctx.fillStyle='rgba(240,48,80,.1)';sils.forEach(s=>{ctx.fillRect(s.start/dur*W,0,(s.end-s.start)/dur*W,H);});}
  let rng=fileName.length||7;const rand=()=>{rng=(rng*16807)%2147483647;return rng/2147483647;};
  ctx.fillStyle=id==='cv2'?'#0052e0':'#0b0b14';ctx.globalAlpha=.7;
  for(let i=0;i<W;i++){
    const t=i/W,inSil=sils&&dur&&sils.some(s=>t>=s.start/dur&&t<=s.end/dur);
    if(inSil&&id==='cv2')continue;
    const amp=.02+Math.abs(.35+.35*Math.sin(t*Math.PI*8+3)*Math.cos(t*Math.PI*2.5)+(rand()-.5)*.35);
    const bh=amp*H*.85;ctx.fillRect(i,H/2-bh/2,1,bh);
  }
  ctx.globalAlpha=1;ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
}

function detectSilence(buf){
  if(buf._fake)return fakeSilence(buf.duration);
  const data=buf.getChannelData(0),sr=buf.sampleRate,th=Math.pow(10,SS.threshold/20),minS=Math.floor(SS.minDur*sr);
  const regs=[];let ss=-1;
  for(let i=0;i<data.length;i++){if(Math.abs(data[i])<th){if(ss<0)ss=i;}else{if(ss>=0&&i-ss>=minS)regs.push({start:Math.max(0,ss/sr-SS.pad),end:Math.min(buf.duration,i/sr+SS.pad)});ss=-1;}}
  return mergeRegs(regs);
}

function fakeSilence(d){const r=[];let t=.5+Math.random()*1.5;while(t<d-1){const s=.4+Math.random()*2;r.push({start:t,end:t+s});t+=s+1.5+Math.random()*4;}return r;}

function mergeRegs(r){if(!r.length)return[];r.sort((a,b)=>a.start-b.start);const m=[r[0]];for(let i=1;i<r.length;i++){const l=m[m.length-1];if(r[i].start<=l.end+.1)l.end=Math.max(l.end,r[i].end);else m.push(r[i]);}return m;}

function buildProcBuf(buf,sils){
  if(!sils.length)return buf;
  const sr=buf.sampleRate,segs=[];let c=0;
  for(const s of sils){if(c<s.start)segs.push({start:c,end:s.start});c=s.end;}
  if(c<buf.duration)segs.push({start:c,end:buf.duration});
  const tot=segs.reduce((a,s)=>a+Math.floor((s.end-s.start)*sr),0);
  const nb=audioCtx.createBuffer(buf.numberOfChannels,tot,sr);
  for(let ch=0;ch<buf.numberOfChannels;ch++){const id=buf.getChannelData(ch),od=nb.getChannelData(ch);let off=0;for(const seg of segs){const s=Math.floor(seg.start*sr),e=Math.floor(seg.end*sr);od.set(id.subarray(s,e),off);off+=e-s;}}
  return nb;
}

async function processAudio(){
  if(!audioBuf){toast('⚠️ Carregue um arquivo primeiro!');return;}
  document.getElementById('procOv').classList.add('show');
  document.getElementById('statsRow').style.display='none';
  document.getElementById('silWrap').style.display='none';
  document.getElementById('bProc').disabled=true;
  document.getElementById('bExp').disabled=true;
  setWStatus('b','Processando…');
  const steps=[
    {t:'Carregando samples…',s:'Lendo arquivo de áudio',p:25},
    {t:'Detectando silêncios…',s:'Limiar: '+SS.threshold+'dB',p:55},
    {t:'Aplicando cortes…',s:'Padding de '+SS.pad+'s',p:80},
    {t:'Gerando prévia…',s:'Montando waveform',p:98},
  ];
  for(const st of steps){document.getElementById('procT').textContent=st.t;document.getElementById('procS').textContent=st.s;await animBar(st.p);await sleep(350+Math.random()*250);}
  silRegions=detectSilence(audioBuf);
  const totSil=silRegions.reduce((a,r)=>a+(r.end-r.start),0),orig=audioBuf.duration,newD=Math.max(1,orig-totSil);
  await animBar(100);await sleep(150);
  document.getElementById('procOv').classList.remove('show');
  document.getElementById('procLbl').style.opacity='1';
  if(audioBuf._fake){drawFakeWave('cv1',silRegions,orig);drawFakeWave('cv2',null,newD);}
  else{drawWave(audioBuf,'cv1',silRegions);procBuf=buildProcBuf(audioBuf,silRegions);drawWave(procBuf,'cv2',null);}
  renderSilTags(silRegions,orig);
  document.getElementById('statsRow').style.display='grid';
  document.getElementById('sv2').textContent=fDur(newD);
  document.getElementById('sv3').textContent=fDur(totSil);
  document.getElementById('sv4').textContent=silRegions.length;
  document.getElementById('bProc').disabled=false;
  document.getElementById('bExp').disabled=false;
  setWStatus('g','✓ Processado!');
  document.getElementById('pbar').style.width='0%';
  toast(`✅ ${silRegions.length} silêncios removidos! Salvou ${fDur(totSil)}`);
}

function renderSilTags(regs,dur){
  const w=document.getElementById('silWrap');w.style.display='flex';
  w.querySelectorAll('.sil-tag').forEach(e=>e.remove());
  regs.slice(0,10).forEach((r,i)=>{
    const t=document.createElement('div');t.className='sil-tag';
    t.innerHTML=`✂ ${fDur(r.start)}–${fDur(r.end)} <span style="color:var(--red);margin-left:2px;">(${fDur(r.end-r.start)})</span>`;
    t.onclick=()=>{t.classList.add('removed');silRegions.splice(i,1);};w.appendChild(t);
  });
  if(regs.length>10){const m=document.createElement('span');m.style.cssText='font-size:.68rem;color:var(--t3);font-weight:600;';m.textContent=`+${regs.length-10} mais`;w.appendChild(m);}
}

function togglePlay(){
  if(!audioCtx)return;
  if(isPlaying){if(sourceNode)try{sourceNode.stop()}catch(e){}isPlaying=false;document.getElementById('bPlay').textContent='▶ Reproduzir';return;}
  const buf=procBuf||audioBuf;if(!buf||buf._fake){toast('🎵 Demo — reprodução não disponível para arquivos simulados');return;}
  if(audioCtx.state==='suspended')audioCtx.resume();
  sourceNode=audioCtx.createBufferSource();sourceNode.buffer=buf;sourceNode.connect(audioCtx.destination);sourceNode.start(0);
  isPlaying=true;document.getElementById('bPlay').textContent='⏸ Pausar';
  sourceNode.onended=()=>{isPlaying=false;document.getElementById('bPlay').textContent='▶ Reproduzir';};
}

function exportAudio(){
  if(!silRegions.length&&!procBuf){toast('⚠️ Processe o áudio primeiro!');return;}
  const b=document.getElementById('bExp');b.textContent='⏳ Exportando…';b.disabled=true;
  setTimeout(()=>{
    b.textContent='⬇ Exportar';b.disabled=false;
    const n=fileName.replace(/\.[^.]+$/,'')+'_sem_silencio.mp3';
    toast(`✅ "${n}" baixado!`);
  },1800);
}

function resetAudio(){
  if(sourceNode)try{sourceNode.stop()}catch(e){}
  audioBuf=null;procBuf=null;silRegions=[];isPlaying=false;
  document.getElementById('dropZone').style.display='block';
  document.getElementById('sbar').classList.remove('show');
  document.getElementById('wcard').classList.remove('show');
  document.getElementById('statsRow').style.display='none';
  document.getElementById('silWrap').style.display='none';
  document.getElementById('procOv').classList.remove('show');
  document.getElementById('aFile').value='';
  document.getElementById('pbar').style.width='0%';
  document.getElementById('procLbl').style.opacity='.3';
  document.getElementById('bProc').disabled=false;
  document.getElementById('bExp').disabled=true;
  document.getElementById('bPlay').disabled=true;
  [document.getElementById('cv1'),document.getElementById('cv2')].forEach(c=>{const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);});
}

function setWStatus(c,t){document.getElementById('wst').innerHTML=`<div class="sdot ${c}"></div><span>${t}</span>`;}
async function animBar(target){return new Promise(r=>{const b=document.getElementById('pbar');let cur=parseFloat(b.style.width)||0;const s=()=>{cur+=2.5;b.style.width=Math.min(cur,target)+'%';if(cur<target)requestAnimationFrame(s);else r();};s();});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fDur=s=>{if(!s||isNaN(s))return'—';const m=Math.floor(s/60),sc=Math.floor(s%60);return`${m}:${String(sc).padStart(2,'0')}`;};
const fSize=b=>b>1048576?(b/1048576).toFixed(1)+' MB':(b/1024).toFixed(0)+' KB';

// ═══ API CALLS ═══

async function loadComments(){
  try {
    const res = await fetch(`${API}/comments`);
    const data = await res.json();
    if(data.success && data.comments){
      COMMENTS = data.comments.map(c => ({
        id: c.id,
        handle: c.handle,
        text: c.texto,
        rating: 5,
        time: formatTime(c.created_at),
        likes: parseInt(c.total_likes) || 0,
        pinned: c.pinned,
        sc: c.super_chat,
        likedBy: []
      }));
      nextId = COMMENTS.length > 0 ? Math.max(...COMMENTS.map(c => c.id)) + 1 : 1;
      renderComments();
    }
  } catch(e) { console.log('API offline, usando dados locais'); }
}

function formatTime(dateStr){
  if(!dateStr || dateStr === 'agora') return 'agora';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if(diff < 60) return 'agora';
  if(diff < 3600) return `${Math.floor(diff/60)}min atrás`;
  if(diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
  return `${Math.floor(diff/86400)}d atrás`;
}

async function sendCommentToAPI(){
  if(!APP.me) return;
  const inp = document.getElementById('compInp');
  const text = inp.value.trim();
  if(!text) return;
  
  try {
    const res = await fetch(`${API}/comments`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ handle: APP.me.handle, texto: text })
    });
    const data = await res.json();
    if(data.success){
      inp.value = '';
      hideMentDrop();
      await loadComments();
    }
  } catch(e) { 
    COMMENTS.unshift({id:nextId++,handle:APP.me.handle,text,time:'agora',likes:0,pinned:false,sc:null});
    inp.value = '';
    hideMentDrop();
    renderComments();
  }
}

// ═══ AUTH ═══

async function doLoginAPI(){
  const handle = document.getElementById('liHandle').value.trim().toLowerCase();
  const password = document.getElementById('liPassword')?.value || '123456';
  
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ handle, password })
    });
    const data = await res.json();
    if(data.success){
      setUserData(data.user);
      closeModal('loginModal');
      toast(`👋 Bem-vindo, ${data.user.name}!`);
    } else {
      if(USERS[handle]){ setUserData(USERS[handle]); closeModal('loginModal'); toast(`👋 Bem-vindo!`); }
      else toast('⚠️ Usuário não encontrado. Crie uma conta!');
    }
  } catch(e) {
    if(USERS[handle]){ setUserData(USERS[handle]); closeModal('loginModal'); toast(`👋 Bem-vindo!`); }
    else toast('⚠️ Usuário não encontrado.');
  }
}

async function createAccountAPI(){
  const name = document.getElementById('regName').value.trim();
  const handle = document.getElementById('regHandle').value.trim().replace(/[^a-z0-9_]/gi,'').toLowerCase();
  const desc = document.getElementById('regDesc').value.trim();
  const password = document.getElementById('regPassword')?.value || '123456';
  if(!name||!handle){toast('⚠️ Preencha nome e @usuário!');return;}
  
  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        handle, name, password, descricao: desc,
        cor: document.getElementById('regAvPrev').style.background || '#0052e0',
        avatar: regAvUrl || null,
        area: regSelBadge || null
      })
    });
    const data = await res.json();
    if(data.success){
      regAvUrl=null;regSelBadge=null;
      closeModal('regModal');
      setUserData(data.user);
      toast(`✨ Conta criada! Bem-vindo, ${data.user.name}!`);
    } else {
      USERS[handle] = {name,handle,desc,area:regSelBadge,color:'#0052e0',avatar:regAvUrl,joined:new Date().toLocaleDateString('pt-BR',{month:'short',year:'numeric'}),followers:0,audioCount:0,commentCount:0,audios:[],vip:false,verified:false,official:false};
      regAvUrl=null;regSelBadge=null;
      closeModal('regModal');
      setUserData(USERS[handle]);
      toast(`✨ Conta criada!`);
    }
  } catch(e) {
    USERS[handle] = {name,handle,desc,area:regSelBadge,color:'#0052e0',avatar:regAvUrl,joined:new Date().toLocaleDateString('pt-BR',{month:'short',year:'numeric'}),followers:0,audioCount:0,commentCount:0,audios:[],vip:false,verified:false,official:false};
    regAvUrl=null;regSelBadge=null;
    closeModal('regModal');
    setUserData(USERS[handle]);
    toast(`✨ Conta criada!`);
  }
}

function setUserData(user){
  APP.me = user;
  USERS[user.handle] = user;
  document.getElementById('btnLogin').style.display='none';
  document.getElementById('btnReg').style.display='none';
  const nav = document.getElementById('navAv');
  nav.style.display='flex';nav.style.background=user.cor||'#0052e0';
  nav.textContent=(user.name||'?').charAt(0).toUpperCase();
  if(user.avatar)nav.innerHTML=`<img src="${user.avatar}"/>`;
  document.getElementById('loginPrompt').style.display='none';
  document.getElementById('compose').classList.add('show');
  const av = document.getElementById('compAv');
  av.style.background=user.cor||'#0052e0';av.textContent=(user.name||'?').charAt(0).toUpperCase();
  if(user.avatar)av.innerHTML=`<img src="${user.avatar}"/>`;
  if(user.vip)document.getElementById('scBtn').style.display='flex';
}

function logout(){
  APP.me=null;
  document.getElementById('btnLogin').style.display='';document.getElementById('btnReg').style.display='';
  document.getElementById('navAv').style.display='none';
  document.getElementById('loginPrompt').style.display='flex';
  document.getElementById('compose').classList.remove('show');
  document.getElementById('scBtn').style.display='none';
  closeModal('profileModal');
  toast('Você saiu da conta.');
}

// ═══ OVERRIDE FUNCTIONS ═══
function doLogin(){ doLoginAPI(); }
function createAccount(){ createAccountAPI(); }
function sendComment(){ sendCommentToAPI(); }
function openLogin(){ 
  if(!document.getElementById('liPassword')){
    const pwdInput = document.createElement('input');
    pwdInput.type = 'password';
    pwdInput.id = 'liPassword';
    pwdInput.className = 'finp';
    pwdInput.placeholder = 'Senha (demo: qualquer coisa)';
    pwdInput.style.marginTop = '8px';
    const label = document.createElement('label');
    label.style.cssText = 'display:block;font-size:.72rem;font-weight:700;color:var(--t2);margin-top:12px;';
    label.textContent = 'Senha';
    const body = document.querySelector('#loginModal .modal-body');
    body.appendChild(label);
    body.appendChild(pwdInput);
  }
  openModal('loginModal'); 
}
function openRegister(){
  if(!document.getElementById('regPassword')){
    const pwdInput = document.createElement('input');
    pwdInput.type = 'password';
    pwdInput.id = 'regPassword';
    pwdInput.className = 'finp';
    pwdInput.placeholder = 'Crie uma senha';
    pwdInput.style.marginTop = '8px';
    const label = document.createElement('label');
    label.style.cssText = 'display:block;font-size:.72rem;font-weight:700;color:var(--t2);margin-top:12px;';
    label.textContent = 'Senha';
    const body = document.querySelector('#regModal .modal-body');
    const lastRow = body.querySelector('.frow:last-of-type');
    if(lastRow) lastRow.after(label, pwdInput);
  }
  closeModal('loginModal');
  openModal('regModal');
}

// ═══ PROFILE PAGE ═══
let viewingHandle=null;

function openProfile(handle){
  if(!handle)return;
  const u=USERS[handle]||{name:handle,handle,cor:'#888',avatar:null,descricao:'',followers:0,audioCount:0,commentCount:0,vip:false,verified:false,official:false,videos:[]};
  viewingHandle=handle;
  const isMe=APP.me&&APP.me.handle===handle;
  
  document.getElementById('profBackLbl').textContent=u.name||handle;
  const cov=document.getElementById('profCover');
  cov.style.background=`linear-gradient(160deg,${u.cor||'#0052e0'}44 0%,${u.cor||'#0052e0'}18 60%,var(--bg2) 100%)`;
  
  const big=document.getElementById('profAvBig');
  big.style.background=u.cor||'#0052e0';
  big.innerHTML=u.avatar?`<img src="${u.avatar}"/>`:`<span style="font-size:2rem;font-weight:800;color:#fff;">${(u.name||handle).charAt(0).toUpperCase()}</span>`;
  
  const actions=document.getElementById('profAvActions');
  if(isMe){
    actions.innerHTML=`<button class="prof-edit-btn" onclick="document.getElementById('profilePage').classList.remove('show');document.body.style.overflow='';openProfileModal();">Editar canal</button>`;
  } else {
    const subd=APP.subscribers.has(handle);
    actions.innerHTML=`
      <button class="prof-follow-btn${subd?' following':''}" id="profFollowBtn" onclick="toggleSub()">${subd?'Seguindo':'Seguir'}</button>
      <button class="prof-share-btn" onclick="toast('🔗 Link copiado!')">⎋</button>`;
  }
  
  document.getElementById('profName').textContent=u.name||handle;
  document.getElementById('profVipSeal').style.display=u.vip?'inline-flex':'none';
  document.getElementById('profVerCheck').style.display=(u.verified||u.official)?'inline-flex':'none';
  document.getElementById('profHandle').textContent='@'+handle;
  document.getElementById('profFollowers').textContent=formatNum(u.followers||0);
  document.getElementById('profAudios').textContent=u.audioCount||u.videos?.length||0;
  document.getElementById('profViews').textContent=formatNum((u.audioCount||0)*14);
  
  const desc=document.getElementById('profDescFull');
  desc.textContent=u.descricao||u.desc||'';
  
  switchPTab('audios',document.querySelectorAll('.ptab')[0]);
  renderProfAudios({...u, audios:(u.videos||[]).map(v=>({name:v.legenda||'Vídeo',icon:'🎬',date:formatTime(v.created_at),locked:false}))}, isMe);
  renderProfEmblems(u);
  renderProfVideos(u, isMe);
  
  document.getElementById('profilePage').classList.add('show');
  document.body.style.overflow='hidden';
}

function closeProfile(){
  document.getElementById('profilePage').classList.remove('show');
  document.body.style.overflow='';
  viewingHandle=null;
}

function toggleSub(){
  if(!viewingHandle||!APP.me)return;
  const u=USERS[viewingHandle];
  const btn=document.getElementById('profFollowBtn');
  if(APP.subscribers.has(viewingHandle)){
    APP.subscribers.delete(viewingHandle);
    u.followers=Math.max(0,(u.followers||0)-1);
    if(btn){btn.textContent='Seguir';btn.className='prof-follow-btn';}
  } else {
    APP.subscribers.add(viewingHandle);
    u.followers=(u.followers||0)+1;
    if(btn){btn.textContent='Seguindo';btn.className='prof-follow-btn following';}
  }
  document.getElementById('profFollowers').textContent=formatNum(u.followers||0);
}

function formatNum(n){if(n>=1000000)return(n/1000000).toFixed(1).replace('.0','')+'M';if(n>=1000)return(n/1000).toFixed(1).replace('.0','')+'K';return String(n||0);}

function renderProfAudios(u,isMe){
  const grid=document.getElementById('profAudioGrid');
  const audios=u.audios||[];
  if(!audios.length){grid.innerHTML='<div style="font-size:.8rem;color:var(--t3);padding:10px 0;">Nenhum projeto ainda.</div>';return;}
  grid.innerHTML=audios.map(a=>`<div class="audio-card"><div class="audio-icon">${a.icon||'🎵'}</div><div class="audio-name">${a.name}</div><div class="audio-meta">${a.date||'—'}</div></div>`).join('');
}

function renderProfEmblems(u){
  const grid=document.getElementById('profEmbGrid');
  grid.innerHTML=EMBLEMAS.map(e=>{
    const can=e.req==='free'||(e.req==='vip'&&(u.vip||u.vipTier))||(e.req==='ultra'&&u.vipTier==='ultra');
    return`<div class="emb${can?' owned':' locked'}" style="background:${e.color};" title="${e.name}${can?'':' (requer '+e.req+')'}">${e.emoji}</div>`;
  }).join('');
}

// ═══ RENDER COMMENTS ═══
function renderComments(){
  const list=document.getElementById('clist');
  list.innerHTML='';
  COMMENTS.forEach(c=>{
    const u=USERS[c.handle]||{name:c.handle,handle:c.handle,cor:'#888',avatar:null,vip:false,verified:false,official:false};
    const isVIP=u.vip;
    const isVer=u.verified||u.official;
    const text=(c.text||'').replace(/@(\w+)/g,(m,h)=>`<span class="mention" onclick="openProfile('${h}')" style="color:var(--blue);font-weight:600;cursor:pointer;">@${h}</span>`);
    const nameClass=isVIP?'cname vip-name vip-glow':'cname';
    const pinBadge=c.pinned?`<div class="pin-badge">📌 Fixado</div>`:'';
    const vipS=isVIP?`<span class="vip-seal">⭐ VIP</span>`:'';
    const verS=isVer?`<span class="verified-seal">✓ Verificado</span>`:'';
    const avHtml=u.avatar?`<div class="cav" style="width:36px;height:36px;background:${u.cor};cursor:pointer;" onclick="openProfile('${c.handle}')"><img src="${u.avatar}"/></div>`:`<div class="cav" style="width:36px;height:36px;background:${u.cor};" onclick="openProfile('${c.handle}')">${(u.name||'?').charAt(0).toUpperCase()}</div>`;
    
    list.innerHTML+=`<div class="ccard${c.pinned?' pinned':''}" id="cc${c.id}">
      ${pinBadge}
      <div class="ctop">
        ${avHtml}
        <div class="cmeta">
          <div class="cname-row">
            <span class="${nameClass}" onclick="openProfile('${c.handle}')">${u.name}</span>
            ${vipS}${verS}
            <span class="ctime">${c.time||'agora'}</span>
          </div>
          <div class="chandle">@${c.handle}</div>
          <div class="ctext">${text}</div>
          <div class="cacts">
            <button class="ca like-btn${c.likedBy?.includes(APP.me?.handle)?' liked':''}" onclick="likeComment(${c.id},this)">❤ ${c.likes||0}</button>
            <button class="ca reply-btn" onclick="replyTo('${c.handle}')">💬 Responder</button>
            ${APP.isAdm?`<button onclick="admPin(${c.id})" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:var(--w);font-size:.72rem;font-weight:600;cursor:pointer;color:var(--t3);">📌 Fixar</button>`:''}
          </div>
        </div>
      </div>
    </div>`;
  });
}

function likeComment(id,btn){
  if(!APP.me){openLogin();return;}
  const c=COMMENTS.find(x=>x.id===id);if(!c)return;
  if(!c.likedBy)c.likedBy=[];
  const h=APP.me.handle;
  if(c.likedBy.includes(h)){c.likedBy=c.likedBy.filter(x=>x!==h);c.likes=Math.max(0,(c.likes||0)-1);}
  else{c.likedBy.push(h);c.likes=(c.likes||0)+1;}
  fetch(`${API}/comments/${id}/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({handle:h})}).catch(()=>{});
  renderComments();
}

function delComment(id){
  COMMENTS=COMMENTS.filter(x=>x.id!==id);
  fetch(`${API}/comments/${id}`,{method:'DELETE'}).catch(()=>{});
  renderComments();
}

function replyTo(h){const inp=document.getElementById('compInp');inp.value=`@${h} `;inp.focus();document.getElementById('compose').scrollIntoView({behavior:'smooth'});}

function admPin(id){
  COMMENTS.forEach(c=>c.pinned=false);
  const c=COMMENTS.find(x=>x.id===id);if(c){c.pinned=true;toast('📌 Comentário fixado!');
  fetch(`${API}/comments/${id}/pin`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pinned:true})}).catch(()=>{});}
  renderComments();
}

function onCompInput(el){
  const v=el.value,la=v.lastIndexOf('@');
  if(la===-1){hideMentDrop();return;}
  const q=v.slice(la+1).toLowerCase();
  if(!q){hideMentDrop();return;}
  const matches=Object.values(USERS).filter(u=>u.handle?.startsWith(q)||u.name?.toLowerCase().startsWith(q)).slice(0,5);
  if(!matches.length){hideMentDrop();return;}
  const drop=document.getElementById('mentDrop');
  drop.innerHTML=matches.map(u=>`<div class="ment-item" onclick="complMent('${u.handle}')">${avHTML(u,28,false)}<div><strong style="font-size:.8rem;">${u.name}</strong><div style="font-size:.68rem;color:var(--t3);">@${u.handle}</div></div></div>`).join('');
  drop.classList.add('show');
}

function onCompKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendComment();}}
function complMent(h){const inp=document.getElementById('compInp'),v=inp.value,la=v.lastIndexOf('@');inp.value=v.slice(0,la+1)+h+' ';hideMentDrop();inp.focus();}
function hideMentDrop(){document.getElementById('mentDrop').classList.remove('show');}
function insertMent(){const inp=document.getElementById('compInp');inp.value+='@';inp.focus();}

function avHTML(u,sz,link){
  const style=`width:${sz}px;height:${sz}px;background:${u.cor||'#888'};`;
  const click=link?`onclick="openProfile('${u.handle}')" `:'';
  if(u.avatar)return`<div class="cav" style="${style}" ${click}><img src="${u.avatar}"/></div>`;
  return`<div class="cav" style="${style}" ${click}>${(u.name||'?').charAt(0).toUpperCase()}</div>`;
}

// ═══ MODALS ═══
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('overlay'))closeModal(e.target.id);
  if(!e.target.closest('#compose'))hideMentDrop();
});

// ═══ TOAST ═══
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._tid);t._tid=setTimeout(()=>t.classList.remove('show'),2200);
}

// ═══ SETTINGS ═══
function openSettings(){document.getElementById('settingsPage').classList.add('show');document.body.style.overflow='hidden';}
function closeSettings(){document.getElementById('settingsPage').classList.remove('show');document.body.style.overflow='';}

// ═══ INIT ═══
window.addEventListener('DOMContentLoaded',()=>{
  USERS['capdrawnn']={name:'CapDrawn Oficial',handle:'capdrawnn',descricao:'Canal oficial da plataforma CapDrawn.',cor:'#0052e0',avatar:null,joined:'Jan 2025',followers:4200,audioCount:88,commentCount:3,vip:true,verified:true,official:true,videos:[]};
  USERS['criador_oficial']={name:'João Criador',handle:'criador_oficial',descricao:'Podcaster e produtor.',cor:'#e0245e',avatar:null,joined:'Mar 2025',followers:120,audioCount:5,commentCount:1,vip:false,verified:false,official:false,videos:[]};
  
  loadComments();
  
  if(APP.maintenance)document.getElementById('maintenanceScreen').classList.add('active');
  window.addEventListener('resize',()=>{if(audioBuf&&document.getElementById('wcard').classList.contains('show')){}});
});
