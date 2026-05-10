export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8"/>

<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>

<title>CapDrawn · MemeShorts</title>

<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>

<style>

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html{scroll-behavior:smooth;}

:root{

  --w:#ffffff;--bg:#f6f6f9;--bg2:#eeeeF4;

  --border:#e2e2ec;--border2:#c8c8dc;

  --t:#0b0b14;--t2:#52527a;--t3:#9898b8;

  --blue:#0052e0;--blue-lt:#eef3ff;--blue-md:#c0cffb;

  --vip:#b8860b;--vip-lt:#fff9e6;--vip-bd:#f0d060;

  --green:#00b86b;--red:#f03050;--orange:#ff7a00;

  --gold:#f5a623;--gold-lt:#fff8ec;

  --r:12px;--r2:18px;--r3:26px;

  --sh:0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04);

  --sh2:0 4px 24px rgba(0,0,0,.09);

  --sh3:0 12px 48px rgba(0,0,0,.14);

}

body{font-family:'Sora',sans-serif;background:var(--w);color:var(--t);font-size:15px;overflow-x:hidden;}

::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

a{text-decoration:none;color:inherit;}

button{font-family:inherit;cursor:pointer;}

input,textarea,select{font-family:inherit;}



/* ══ TOP BAR ══ */

#topBar{

  position:sticky;top:0;z-index:200;height:58px;

  display:flex;align-items:center;justify-content:space-between;

  padding:0 18px;

  background:rgba(255,255,255,.92);

  backdrop-filter:blur(20px);

  border-bottom:1px solid rgba(226,226,236,.8);

}

.logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:1.05rem;color:var(--t);letter-spacing:-.4px;}

.logo-icon{width:30px;height:30px;background:var(--t);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.85rem;}

.logo-sub{font-size:.6rem;background:var(--blue-lt);color:var(--blue);border:1px solid var(--blue-md);padding:1px 7px;border-radius:20px;font-weight:700;letter-spacing:.04em;}

.top-right{display:flex;align-items:center;gap:8px;}

.nb{padding:7px 14px;border-radius:9px;font-size:.78rem;font-weight:600;border:1.5px solid var(--border);background:var(--w);color:var(--t2);transition:all .15s;cursor:pointer;}

.nb:hover{border-color:var(--border2);}

.nb.solid{background:var(--t);color:#fff;border-color:var(--t);}

.nb.solid:hover{opacity:.85;}

.nb.vip-btn{background:linear-gradient(135deg,#b8860b,#f0c040);color:#fff;border:none;box-shadow:0 2px 10px rgba(184,134,11,.3);}

.avatar-nav{width:32px;height:32px;border-radius:50%;background:var(--blue);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.78rem;color:#fff;overflow:hidden;cursor:pointer;transition:border-color .2s;}

.avatar-nav:hover{border-color:var(--blue);}

.avatar-nav img{width:100%;height:100%;object-fit:cover;}



/* ══ HERO / HOME ══ */

#homePage{padding-bottom:80px;}

.hero{padding:48px 20px 32px;text-align:center;position:relative;overflow:hidden;}

.hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(ellipse,rgba(0,82,224,.07) 0%,transparent 65%);pointer-events:none;}

.hero-pill{display:inline-flex;align-items:center;gap:7px;padding:5px 13px 5px 7px;background:var(--blue-lt);border:1px solid var(--blue-md);border-radius:50px;font-size:.72rem;font-weight:700;color:var(--blue);margin-bottom:20px;}

.hero-pill-dot{width:18px;height:18px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#fff;animation:pulse 2s infinite;}

@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15);}}

h1{font-size:clamp(1.8rem,5vw,3rem);font-weight:900;letter-spacing:-1.8px;line-height:1.08;margin-bottom:14px;}

h1 .grad{background:linear-gradient(135deg,var(--blue),#6090ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

.hero-sub{font-size:.88rem;color:var(--t2);max-width:380px;margin:0 auto 24px;line-height:1.75;}

.cta-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}

.btn-main{display:inline-flex;align-items:center;gap:7px;padding:12px 22px;background:var(--t);color:#fff;border:none;border-radius:var(--r);font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.15);}

.btn-main:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15);}

.btn-out{display:inline-flex;align-items:center;gap:7px;padding:11px 18px;background:var(--w);color:var(--t);border:1.5px solid var(--border);border-radius:var(--r);font-size:.86rem;font-weight:600;cursor:pointer;transition:all .2s;}

.btn-out:hover{border-color:var(--border2);background:var(--bg);}



/* ══ FEED PREVIEW SECTION ══ */

.feed-preview-section{padding:0 16px 24px;}

.sec-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-bottom:8px;display:flex;align-items:center;gap:7px;}

.sec-label::before{content:'';width:12px;height:2px;background:var(--blue);border-radius:2px;}

.sec-title{font-size:1.3rem;font-weight:900;letter-spacing:-.7px;margin-bottom:4px;}

.sec-sub{font-size:.82rem;color:var(--t2);margin-bottom:18px;line-height:1.6;}



/* Preview Cards Row */

.preview-scroll{display:flex;gap:10px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;}

.preview-scroll::-webkit-scrollbar{display:none;}

.preview-card{flex-shrink:0;width:130px;height:220px;border-radius:14px;background:#111;overflow:hidden;position:relative;cursor:pointer;transition:transform .2s;}

.preview-card:hover{transform:scale(1.03);}

.preview-card-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:.5;}

.preview-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);}

.preview-card-info{position:absolute;bottom:10px;left:8px;right:8px;}

.preview-card-name{font-size:.68rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

.preview-card-views{font-size:.6rem;color:rgba(255,255,255,.6);margin-top:1px;}

.preview-card-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}



/* ══ CHAT SECTION ══ */

.chat-section{max-width:800px;margin:0 auto;padding:0 16px 20px;}

.chat-title{font-size:1.1rem;font-weight:900;letter-spacing:-.5px;margin-bottom:4px;}

.chat-sub{font-size:.78rem;color:var(--t3);margin-bottom:18px;}

.login-prompt{display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r);cursor:pointer;margin-bottom:18px;transition:border-color .2s;}

.login-prompt:hover{border-color:var(--blue);}

.lp-av{width:36px;height:36px;border-radius:50%;background:var(--bg2);border:2px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:1rem;}

.lp-txt{font-size:.82rem;color:var(--t3);} .lp-txt strong{color:var(--blue);}

.compose{background:var(--w);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px;margin-bottom:18px;display:none;}

.compose.show{display:block;}

.compose-top{display:flex;gap:10px;align-items:flex-start;}

.c-av{width:36px;height:36px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;flex-shrink:0;overflow:hidden;}

.c-av img{width:100%;height:100%;object-fit:cover;}

.c-inp{flex:1;border:none;outline:none;font-family:inherit;font-size:.86rem;color:var(--t);resize:none;min-height:64px;line-height:1.55;background:transparent;}

.c-inp::placeholder{color:#bbb;}

.compose-bot{display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);}

.c-acts{display:flex;gap:5px;}

.c-act{padding:5px 11px;border-radius:7px;font-size:.72rem;font-weight:600;border:1.5px solid var(--border);background:var(--w);color:var(--t2);cursor:pointer;transition:all .15s;}

.c-act:hover{border-color:var(--border2);}

.c-send{padding:7px 16px;background:var(--t);color:#fff;border:none;border-radius:9px;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .15s;}

.c-send:hover{opacity:.85;}

.ment-drop{display:none;position:absolute;background:var(--w);border:1.5px solid var(--border);border-radius:12px;box-shadow:var(--sh2);width:220px;z-index:100;overflow:hidden;bottom:100%;left:0;margin-bottom:4px;}

.ment-drop.show{display:block;}

.ment-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;transition:background .12s;}

.ment-item:hover{background:var(--bg);}

.cav{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.7rem;color:#fff;overflow:hidden;flex-shrink:0;}

.cav img{width:100%;height:100%;object-fit:cover;border-radius:50%;}

.clist{}

.comment{background:var(--w);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px 16px;margin-bottom:10px;transition:box-shadow .15s;}

.comment:hover{box-shadow:var(--sh);}

.comment.pinned{border-color:var(--blue);background:var(--blue-lt);}

.cm-top{display:flex;align-items:flex-start;gap:10px;}

.cm-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem;color:#fff;flex-shrink:0;overflow:hidden;cursor:pointer;}

.cm-av img{width:100%;height:100%;object-fit:cover;}

.cm-name{font-size:.84rem;font-weight:700;cursor:pointer;transition:color .15s;}

.cm-name:hover{color:var(--blue);}

.cm-handle{font-size:.7rem;color:var(--t3);}

.cm-time{font-size:.65rem;color:var(--t3);margin-left:auto;flex-shrink:0;}

.cm-text{font-size:.84rem;color:var(--t2);margin-top:7px;line-height:1.6;word-break:break-word;}

.cm-text .mention{color:var(--blue);font-weight:600;cursor:pointer;}

.cm-text .mention:hover{text-decoration:underline;}

.cm-actions{display:flex;align-items:center;gap:8px;margin-top:8px;}

.cm-like{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:var(--bg);font-size:.72rem;font-weight:600;color:var(--t3);cursor:pointer;transition:all .15s;}

.cm-like:hover,.cm-like.liked{border-color:#f03050;color:#f03050;background:#fff0f2;}

.cm-reply{font-size:.72rem;font-weight:600;color:var(--t3);cursor:pointer;padding:4px 8px;border-radius:20px;border:1px solid transparent;transition:all .15s;}

.cm-reply:hover{background:var(--bg);border-color:var(--border);}

.cm-del{font-size:.65rem;color:var(--red);cursor:pointer;margin-left:auto;padding:4px 8px;border-radius:6px;transition:background .15s;}

.cm-del:hover{background:#fff0f2;}

.pin-badge{display:inline-flex;align-items:center;gap:3px;font-size:.62rem;font-weight:700;color:var(--blue);background:var(--blue-lt);border:1px solid var(--blue-md);padding:2px 7px;border-radius:4px;margin-bottom:5px;}

.ver-badge{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;background:var(--blue);clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);margin-left:3px;flex-shrink:0;}

.ver-badge svg{width:8px;height:8px;fill:white;}

.vip-seal-badge{display:inline-flex;align-items:center;gap:2px;padding:1px 5px;background:var(--vip-lt);border:1px solid var(--vip-bd);border-radius:4px;font-size:.6rem;font-weight:700;color:var(--vip);margin-left:3px;}



/* superchat */

.superchat-bar{display:none;overflow-x:auto;white-space:nowrap;padding:8px 0;margin-bottom:12px;scrollbar-width:none;}

.superchat-bar.show{display:block;}

.superchat-bar::-webkit-scrollbar{display:none;}

.sc-item{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;margin-right:8px;min-width:180px;animation:scIn .3s ease;}

@keyframes scIn{from{transform:translateX(-20px);opacity:0}to{transform:none;opacity:1}}

.sc-1{background:linear-gradient(135deg,#b8860b,#f0c040);} .sc-2{background:linear-gradient(135deg,#e0245e,#ff6b9d);} .sc-3{background:linear-gradient(135deg,#0052e0,#4080ff);}

.sc-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.72rem;color:#fff;background:rgba(0,0,0,.25);flex-shrink:0;}

.sc-msg{font-size:.78rem;color:#fff;font-weight:600;} .sc-val{margin-left:auto;font-size:.7rem;font-weight:700;color:rgba(255,255,255,.8);}



/* ══ SHORT VIDEO FEED ══ */

#videoFeedPage{display:none;position:fixed;inset:0;z-index:290;background:#000;overflow:hidden;}

#videoFeedContainer{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;}

#videoFeedContainer::-webkit-scrollbar{display:none;}

.vid-snap-item{position:relative;height:100vh;width:100%;scroll-snap-align:start;overflow:hidden;background:#000;}

.vid-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 45%,rgba(0,0,0,.1) 100%);}

.vid-side-actions{position:absolute;right:12px;bottom:100px;display:flex;flex-direction:column;align-items:center;gap:18px;z-index:5;}

.vid-heart-btn{background:none;border:none;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:transform .15s;}

.vid-heart-btn:hover{transform:scale(1.1);}

.vid-heart-btn.liked svg{fill:#f03050;stroke:#f03050;}

.vid-heart-btn.liked{animation:heartPop .3s ease;}

@keyframes heartPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}

.vid-act-btn{background:none;border:none;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;}

.vid-act-count{font-size:.68rem;font-weight:700;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5);}

.vid-info{position:absolute;bottom:90px;left:14px;right:70px;z-index:5;}

.vid-author{display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;}

.vid-av{width:38px;height:38px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.88rem;color:#fff;overflow:hidden;flex-shrink:0;}

.vid-av img{width:100%;height:100%;object-fit:cover;}

.vid-author-name{font-size:.88rem;font-weight:700;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5);}

.vid-author-handle{font-size:.72rem;color:rgba(255,255,255,.7);}

.vid-caption{font-size:.82rem;color:#fff;line-height:1.5;text-shadow:0 1px 4px rgba(0,0,0,.5);word-break:break-word;}

.vid-pause-icon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;background:rgba(0,0,0,.5);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;pointer-events:none;z-index:6;}

.vid-pause-icon.show{opacity:1;}

/* meme video special style */

.vid-meme-source{position:absolute;top:12px;right:12px;z-index:7;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:4px 10px;display:flex;align-items:center;gap:5px;font-size:.68rem;font-weight:700;color:#fff;}

.vid-meme-badge{background:linear-gradient(135deg,#f03050,#ff7a00);padding:3px 8px;border-radius:20px;font-size:.58rem;font-weight:800;color:#fff;letter-spacing:.04em;}

/* Loading state for meme videos */

.vid-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111;z-index:4;}

.vid-loading-spin{width:44px;height:44px;border:3px solid rgba(255,255,255,.1);border-top:3px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:12px;}

@keyframes spin{to{transform:rotate(360deg)}}

.vid-loading-text{font-size:.8rem;color:rgba(255,255,255,.5);font-weight:600;}

/* Feed header */

.feed-header{position:absolute;top:0;left:0;right:0;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;z-index:10;background:linear-gradient(to bottom,rgba(0,0,0,.6) 0%,transparent 100%);pointer-events:none;}

.feed-header button{pointer-events:all;background:rgba(0,0,0,.4);border:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(8px);}

.feed-tabs{display:flex;gap:18px;pointer-events:all;}

.feed-tab{font-size:.84rem;font-weight:700;color:rgba(255,255,255,.55);cursor:pointer;transition:color .15s;padding-bottom:3px;border-bottom:2px solid transparent;}

.feed-tab.active{color:#fff;border-bottom-color:#fff;}



/* ══ PROFILE PAGE ══ */

#profilePage{position:fixed;inset:0;z-index:280;background:var(--w);overflow-y:auto;display:none;padding-bottom:80px;}

#profilePage.show{display:block;}

.prof-back{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);height:52px;display:flex;align-items:center;gap:12px;padding:0 14px;}

.prof-back button{background:none;border:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .15s;cursor:pointer;color:var(--t);}

.prof-back button:hover{background:var(--bg);}

.prof-back-name{font-size:.95rem;font-weight:700;letter-spacing:-.2px;}

.prof-cover{height:90px;position:relative;overflow:hidden;}

.prof-cover-inner{position:absolute;inset:0;}

.prof-av-row{display:flex;align-items:flex-end;justify-content:space-between;padding:0 16px;margin-top:-32px;margin-bottom:10px;}

.prof-av-big{width:72px;height:72px;border-radius:50%;border:3.5px solid var(--w);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#fff;overflow:hidden;flex-shrink:0;cursor:pointer;box-shadow:var(--sh);}

.prof-av-big img{width:100%;height:100%;object-fit:cover;}

.prof-av-actions{display:flex;gap:8px;align-items:center;padding-bottom:4px;}

.prof-follow-btn{padding:9px 20px;background:var(--t);color:#fff;border:none;border-radius:22px;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;}

.prof-follow-btn:hover{opacity:.85;}

.prof-follow-btn.following{background:var(--bg);color:var(--t);border:1.5px solid var(--border);}

.prof-share-btn{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--border);background:var(--w);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;transition:all .15s;}

.prof-share-btn:hover{background:var(--bg);}

.prof-edit-btn{padding:8px 18px;background:var(--bg);color:var(--t);border:1.5px solid var(--border);border-radius:22px;font-size:.82rem;font-weight:700;cursor:pointer;}

.prof-body{padding:0 16px;}

.prof-name-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px;}

.prof-name{font-size:1.15rem;font-weight:800;letter-spacing:-.3px;}

.prof-verified-check{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:var(--blue);clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);flex-shrink:0;}

.prof-verified-check svg{width:9px;height:9px;fill:white;}

.vip-seal{display:inline-flex;align-items:center;gap:2px;padding:2px 7px;background:var(--vip-lt);border:1px solid var(--vip-bd);border-radius:6px;font-size:.65rem;font-weight:700;color:var(--vip);}

.prof-handle-row{display:flex;align-items:center;gap:5px;margin-bottom:8px;}

.prof-handle{font-size:.82rem;color:var(--t3);}

.prof-stats-row{display:flex;gap:20px;margin-bottom:10px;}

.prof-stat{text-align:center;}

.psn{font-size:1rem;font-weight:800;letter-spacing:-.3px;}

.psl{font-size:.68rem;color:var(--t3);}

.prof-badges-row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;}

.badge-pill{padding:3px 10px;border-radius:20px;font
