const intro=document.getElementById('intro');
const enterButton=document.getElementById('enterButton');
const soundButton=document.getElementById('soundButton');
const introAudio=document.getElementById('introAudio');
const introVideo=document.getElementById('introVideo');
const menuButton=document.getElementById('menuButton');
const nav=document.querySelector('.nav');

function setSound(on){
  introAudio.muted=!on;
  introVideo.muted=true;
  soundButton.textContent=on?'Sound on':'Sound off';
  soundButton.setAttribute('aria-pressed',String(on));
  if(on) introAudio.play().catch(()=>{});
  else introAudio.pause();
}
soundButton.addEventListener('click',()=>setSound(introAudio.muted));
enterButton.addEventListener('click',()=>{
  intro.classList.add('is-gone');
  document.body.classList.remove('intro-open');
  introAudio.pause();
  sessionStorage.setItem('enteredIcyverse','1');
});
if(sessionStorage.getItem('enteredIcyverse')==='1'){
  intro.classList.add('is-gone');
  document.body.classList.remove('intro-open');
}
menuButton.addEventListener('click',()=>nav.classList.toggle('is-open'));
document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('is-open')));

function twitchParent(){
  const host=location.hostname;
  return host==='localhost'?'localhost':host;
}
function mountPlayer({live=false,videoId=null}={}){
  const root=document.getElementById('twitchPlayer');
  const parent=encodeURIComponent(twitchParent());
  const src=videoId
    ? `https://player.twitch.tv/?video=${encodeURIComponent(videoId)}&parent=${parent}&autoplay=false`
    : `https://player.twitch.tv/?channel=icyeuro&parent=${parent}&autoplay=false`;
  root.innerHTML=`<iframe src="${src}" allowfullscreen="true" scrolling="no" allow="autoplay; fullscreen"></iframe>`;
  document.querySelector('.signal-dot').classList.toggle('is-live',live);
}
async function loadBroadcast(){
  const pill=document.getElementById('statusPill');
  const label=document.getElementById('broadcastLabel');
  const title=document.getElementById('broadcastTitle');
  const meta=document.getElementById('broadcastMeta');
  const link=document.getElementById('broadcastLink');
  try{
    const res=await fetch('/api/twitch');
    if(!res.ok) throw new Error('API unavailable');
    const data=await res.json();
    if(data.live){
      pill.classList.add('is-live');
      pill.querySelector('b').textContent='Live now';
      label.textContent='IcyEuro is live';
      title.textContent=data.title||'Live on Twitch';
      meta.textContent=[data.game,data.viewers&&`${data.viewers} watching`].filter(Boolean).join(' · ');
      mountPlayer({live:true});
    }else if(data.latestVideo){
      pill.querySelector('b').textContent=data.lastLiveLabel||'Latest broadcast';
      label.textContent='Latest VOD';
      title.textContent=data.latestVideo.title||'Latest IcyEuro broadcast';
      meta.textContent=data.latestVideo.duration||'Twitch VOD';
      link.href=data.latestVideo.url||'https://twitch.tv/icyeuro/videos';
      mountPlayer({videoId:data.latestVideo.id});
    }else throw new Error('No broadcasts');
  }catch(error){
    pill.querySelector('b').textContent='IcyEuro on Twitch';
    label.textContent='Watch the IcyEuro channel';
    title.textContent='IcyEuro';
    meta.textContent='Live and recent broadcasts on Twitch';
    mountPlayer();
  }
}
loadBroadcast();

const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=[...document.querySelectorAll('.nav nav a')];
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{rootMargin:'-40% 0px -50% 0px'});
sections.forEach(s=>observer.observe(s));