(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const state = JSON.parse(localStorage.getItem('aegisGameState') || '{"xp":0,"games":0,"streak":0,"badges":[],"best":{}}');
  const save = () => localStorage.setItem('aegisGameState', JSON.stringify(state));
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const level = () => Math.floor(state.xp / 250) + 1;
  const next = () => level() * 250;
  function toast(msg, kind='success') {
    const t=document.createElement('div'); t.className='game-toast '+kind; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'),20); setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),250)},2800);
  }
  function award(xp, badge, text) {
    state.xp += xp; state.games += 1;
    if (badge && !state.badges.includes(badge)) { state.badges.push(badge); toast('🏆 Badge unlocked: '+badge); }
    save(); render(); if(text) toast('+'+xp+' XP — '+text);
  }
  function render(){
    const lv=level(), pct=clamp((state.xp-(lv-1)*250)/250*100,0,100);
    if($('#xp-value')) $('#xp-value').textContent=state.xp+' XP';
    if($('#level-value')) $('#level-value').textContent='Level '+lv;
    if($('#xp-bar')) $('#xp-bar').style.width=pct+'%';
    if($('#games-value')) $('#games-value').textContent=state.games;
    if($('#badge-count')) $('#badge-count').textContent=state.badges.length;
    if($('#streak-value')) $('#streak-value').textContent=state.streak;
    if($('#badge-list')) $('#badge-list').innerHTML=state.badges.length ? state.badges.map(b=>`<span class="badge">🏆 ${b}</span>`).join('') : '<span class="muted">Play a game to unlock your first badge.</span>';
  }

  // Phishing game
  const phishData=[
    {text:'URGENT: Your Kean account will be deleted today. Verify immediately at kean-support-login.com',bad:true,why:'The domain is suspicious and the message uses urgency.'},
    {text:'Your instructor posted an announcement in Canvas. Sign in through your usual Canvas bookmark to view it.',bad:false,why:'No suspicious link or pressure is present.'},
    {text:'You won $2,500! Send your password and SSN to claim your prize.',bad:true,why:'Requests for passwords and sensitive information are major red flags.'},
    {text:'GitHub: A repository you follow has a new release. Visit github.com directly to review it.',bad:false,why:'The safe behavior is to navigate to the known site yourself.'}
  ];
  let phishIndex=0;
  function nextPhish(){
    const d=phishData[phishIndex%phishData.length]; phishIndex++;
    $('#phish-message').textContent=d.text; $('#phish-feedback').textContent='';
    $('#phish-card').dataset.answer=d.bad?'phish':'safe';
  }
  function phish(answer){
    const card=$('#phish-card'); if(!card || !card.dataset.answer)return;
    const correct=answer===card.dataset.answer, d=phishData[(phishIndex-1+phishData.length)%phishData.length];
    $('#phish-feedback').textContent=(correct?'✅ Correct! ':'❌ Not quite. ')+d.why;
    if(correct) award(75, 'Phish Finder', 'phishing detected'); else toast('No XP — analyze the sender, link, urgency, and request.','error');
    setTimeout(nextPhish, 1100);
  }

  // Password game
  function passwordScore(v){
    let s=0; if(v.length>=8)s+=20;if(v.length>=12)s+=20;if(/[a-z]/.test(v)&&/[A-Z]/.test(v))s+=20;if(/\d/.test(v))s+=20;if(/[^A-Za-z0-9]/.test(v))s+=20; return s;
  }
  function updatePassword(){
    const v=$('#game-password').value, s=passwordScore(v); $('#password-meter').style.width=s+'%'; $('#password-score').textContent=s+'/100';
    $('#password-crack').textContent=s<40?'Very weak':s<70?'Getting stronger':s<90?'Strong':'Excellent';
  }
  function checkPassword(){ const s=passwordScore($('#game-password').value); if(s>=90) award(100,'Password Pro','strong password created'); else toast('Reach 90/100 to complete this challenge.','error'); }

  // Firewall game
  const firewallEvents=[
    ['192.168.1.25','Normal browser traffic','allow'],['45.77.12.9','Repeated failed admin logins','block'],['10.0.0.8','Internal database request','allow'],['203.0.113.55','Port scan across 24 ports','block'],['172.16.0.5','Employee HTTPS session','allow']
  ]; let fwIndex=0;
  function firewall(){
    const [ip,desc,ans]=firewallEvents[fwIndex%firewallEvents.length]; fwIndex++;
    $('#fw-ip').textContent=ip;$('#fw-desc').textContent=desc;$('#fw-card').dataset.answer=ans;$('#fw-feedback').textContent='';
  }
  function fwPick(v){const c=$('#fw-card'),ok=v===c.dataset.answer;$('#fw-feedback').textContent=ok?'🛡️ Correct decision.':'⚠️ Review the event carefully.';if(ok)award(60,'Firewall Defender','traffic handled');else toast('No XP — inspect the behavior and source.','error');setTimeout(firewall,1000)}

  // Bug hunter
  let bugTimer, bugScore=0, bugLeft=20;
  function startBugs(){
    const arena=$('#bug-arena'); if(!arena)return; bugScore=0;bugLeft=20;$('#bug-score').textContent='0';$('#bug-time').textContent='20';arena.innerHTML='';
    const tick=setInterval(()=>{bugLeft--;$('#bug-time').textContent=bugLeft;if(bugLeft<=0){clearInterval(tick);clearTimeout(bugTimer);arena.innerHTML='<div class="bug-finished">Time! Score: '+bugScore+'</div>';if(bugScore>=8)award(120,'Bug Hunter','8+ bugs caught');else if(bugScore>0)award(30,null,'bugs caught');}},1000);
    const spawn=()=>{if(bugLeft<=0)return;const b=document.createElement('button');b.className='bug';b.textContent=['🐛','🪲','👾'][Math.floor(Math.random()*3)];b.style.left=(Math.random()*86+4)+'%';b.style.top=(Math.random()*72+12)+'%';b.onclick=()=>{bugScore++;$('#bug-score').textContent=bugScore;b.remove();};arena.appendChild(b);clearTimeout(bugTimer);bugTimer=setTimeout(spawn,650);};spawn();
  }

  // Quiz
  const quiz=[
    ['What does XSS stand for?',['Cross-Site Scripting','Extra Secure System','XML Secure Service'],0],
    ['Which is the strongest password?',['password123','Emmanuel2026','T7!qL9#zP2@x'],2],
    ['What does authorization decide?',['Who you are','What you are allowed to do','Your IP address'],1],
    ['What is phishing?',['A social-engineering attempt to steal information','A firewall rule','A database backup'],0]
  ]; let qi=0, qscore=0;
  function loadQuiz(){const q=quiz[qi%quiz.length];$('#quiz-question').textContent=q[0];$('#quiz-options').innerHTML=q[1].map((o,i)=>`<button data-i="${i}">${o}</button>`).join('');$('#quiz-feedback').textContent='';}
  function answerQuiz(i){const q=quiz[qi%quiz.length],ok=i===q[2];$('#quiz-feedback').textContent=ok?'✅ Correct!':'❌ Incorrect.';if(ok){qscore++;award(50,qscore>=4?'Cyber Scholar':null,'quiz answer');}qi++;setTimeout(loadQuiz,900)}

  // Incident response
  const incidents=[['A user clicked a suspicious link and entered credentials.',['Reset credentials and investigate sessions','Ignore it','Post the password publicly'],0],['A server is receiving thousands of requests per second.',['Investigate/mitigate the traffic','Give the server more passwords','Disable all logging'],0]];let ii=0;
  function loadIncident(){const x=incidents[ii%incidents.length];$('#incident-title').textContent=x[0];$('#incident-options').innerHTML=x[1].map((o,i)=>`<button data-i="${i}">${o}</button>`).join('');$('#incident-feedback').textContent=''}
  function answerIncident(i){const x=incidents[ii%incidents.length],ok=i===x[2];$('#incident-feedback').textContent=ok?'🚨 Good response.':'⚠️ That response increases risk.';if(ok)award(80,'Incident Commander','incident contained');ii++;setTimeout(loadIncident,1000)}

  document.addEventListener('click',e=>{
    if(e.target.matches('[data-phish]')) phish(e.target.dataset.phish);
    if(e.target.matches('[data-fw]')) fwPick(e.target.dataset.fw);
    if(e.target.matches('#start-bugs')) startBugs();
    if(e.target.matches('#password-check')) checkPassword();
    if(e.target.matches('#quiz-options button')) answerQuiz(+e.target.dataset.i);
    if(e.target.matches('#incident-options button')) answerIncident(+e.target.dataset.i);
    if(e.target.matches('[data-reset-game]')) {localStorage.removeItem('aegisGameState');location.reload();}
  });
  $('#game-password')?.addEventListener('input',updatePassword);
  $('#games-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-game-tab]');if(!b)return;$$('[data-game-panel]').forEach(p=>p.hidden=p.id!==b.dataset.gameTab);$$('[data-game-tab]').forEach(x=>x.classList.toggle('active',x===b));});
  nextPhish();firewall();loadQuiz();loadIncident();render();
})();

// Optional immersive features: rank, security events, and the secret terminal.
(() => {
  const rankEl=document.getElementById('rank-value'), lb=document.getElementById('lb-you'), player=document.getElementById('player-name');
  const saved=JSON.parse(localStorage.getItem('aegisGameState')||'{"xp":0,"badges":[]}');
  const rank=saved.xp>=1500?'Cyber Legend':saved.xp>=1000?'Elite Defender':saved.xp>=500?'Security Analyst':'Rookie';
  if(rankEl)rankEl.textContent=rank;if(lb)lb.textContent=(saved.xp||0)+' XP';
  const acct=JSON.parse(localStorage.getItem('portfolioDemoAccount')||'null');if(player&&acct?.name)player.textContent=acct.name;
  const event=document.getElementById('security-event');
  const events=['⚠️ <strong>SECURITY ALERT:</strong> Suspicious login activity detected. Review your account.','🛰️ <strong>NETWORK EVENT:</strong> Port scan detected and contained.','🎯 <strong>MISSION:</strong> Complete a challenge to earn XP and unlock a badge.'];
  setTimeout(()=>{if(event){event.innerHTML=events[Math.floor(Math.random()*events.length)];event.hidden=false;setTimeout(()=>event.hidden=true,6500)}},4500);
  const term=document.getElementById('secret-terminal'),input=document.getElementById('terminal-input'),out=document.getElementById('terminal-output'),close=document.getElementById('terminal-close');
  let keys=''; document.addEventListener('keydown',e=>{keys=(keys+e.key.toLowerCase()).slice(-8);if(keys==='terminal'){term.hidden=false;input.focus();}});
  close?.addEventListener('click',()=>term.hidden=true); input?.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const c=input.value.trim().toLowerCase();input.value='';const replies={help:'commands: status, scan, badges, clear, exit',status:'SYSTEM: ONLINE | FIREWALL: ACTIVE | MANNIE: READY',scan:'SCAN COMPLETE: 0 critical vulnerabilities in this demo.',badges:'Badges are earned in the Cyber Arcade.',clear:''};if(c==='exit')term.hidden=true;else if(c==='clear')out.textContent='';else out.innerHTML += '\n> '+c+'\n'+(replies[c]||'Unknown command. Type help.');out.scrollTop=out.scrollHeight;});
})();
