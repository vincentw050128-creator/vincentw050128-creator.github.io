(() => {
  'use strict';
  const id=document.body.dataset.place;
  const names={xishan:'西山祠堂',youxu:'有序堂'};
  const files={xishan:'西山祠堂_打卡.html',youxu:'有序堂_打卡.html'};
  const key='xinye:checkin:v1';
  let fallback={completed:[],favorites:[]};
  const clean=v=>({completed:[...new Set((Array.isArray(v?.completed)?v.completed:[]).filter(x=>names[x]))],favorites:[...new Set((Array.isArray(v?.favorites)?v.favorites:[]).filter(x=>names[x]))]});
  function read(){try{return clean(JSON.parse(localStorage.getItem(key)||'{}'));}catch{return fallback;}}
  function write(v){fallback=clean(v);try{localStorage.setItem(key,JSON.stringify(fallback));}catch{notice('浏览器未允许保存，记录仅在当前页面有效');}}
  const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
  let timer,trigger;
  function notice(text){q('.status-message').textContent=text;q('.status-message').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>q('.status-message').classList.remove('show'),2600);}
  function render(){const s=read(),done=s.completed.includes(id);q('[data-count]').textContent=s.completed.length+' / 8';q('[role=progressbar]').setAttribute('aria-valuenow',s.completed.length);all('.segments span').forEach((el,i)=>el.classList.toggle('done',i<s.completed.length));q('.status-pill').textContent=done?'已打卡':'进行中';q('[data-checkin-label]').textContent=done?'查看打卡印章':'立即打卡';q('[data-checkin]').classList.toggle('completed',done);q('[data-favorite]').setAttribute('aria-pressed',String(s.favorites.includes(id)));q('[data-favorite]').setAttribute('aria-label',s.favorites.includes(id)?'取消收藏':'收藏景点');}
  function close(){q('.overlay').hidden=true;q('.content').inert=false;q('.top-actions').inert=false;q('.task-tabs').inert=false;trigger?.focus();}
  function open(html){trigger=document.activeElement;q('[data-sheet-body]').innerHTML=html;q('.overlay').hidden=false;q('.content').inert=true;q('.top-actions').inert=true;q('.task-tabs').inert=true;q('[data-close]').focus();}
  const button=(label,action)=>`<button class="primary" data-action="${action}">${label}</button>`;
  function tasks(){const s=read();open(`<h2>我的打卡</h2><p>寻访新叶，收集沿途的文化印记。</p><div class="place-list">${Object.keys(names).map(k=>`<a class="place-link" href="${files[k]}"><strong>${names[k]}</strong><small>${s.completed.includes(k)?'已打卡':'去打卡'} ›</small></a>`).join('')}</div><p class="sheet-note">已完成 ${s.completed.length} / 8 处。本次开放两处景点，其余任务待开放。</p><button class="reset" data-action="reset-confirm">重置本机演示记录</button>`);}
  function success(){open(`<div class="success-copy"><div class="success-mark"><img src="../../assets/打卡任务/图标/check.svg" alt=""></div><h2>${names[id]} · 已打卡</h2><p>已收集这处景点的文化印章。<br>当前进度 ${read().completed.length} / 8 处。</p></div>${button('继续探索','tasks')}<p class="sheet-note">此为演示印章，不作为现场到访或奖励兑换凭证。</p>`);}
  q('[data-checkin]').addEventListener('click',()=>{if(read().completed.includes(id))return success();open(`<h2>打卡 · ${names[id]}</h2><p>体验收集文化印章，记录这一站的发现。</p><p class="sheet-note">当前为演示打卡，不启用相机或定位，不核验现场到访。</p>${button('确认演示打卡','confirm')}`);});
  q('[data-favorite]').addEventListener('click',()=>{const s=read();s.favorites=s.favorites.includes(id)?s.favorites.filter(k=>k!==id):[...s.favorites,id];write(s);render();notice(s.favorites.includes(id)?'已收藏这处景点':'已取消收藏');});
  q('[data-tasks]').addEventListener('click',tasks);
  q('[data-reward]').addEventListener('click',()=>open(`<h2>打卡奖励</h2><p>完成全部 8 处打卡，收集完整的文化印记。</p><p>当前已完成 ${read().completed.length} / 8 处。</p><p class="sheet-note">本次可体验西山祠堂与有序堂。其余六处任务及具体奖励待开放，暂不提供实物兑换。</p>${button('查看打卡景点','tasks')}`));
  q('[data-photo]').addEventListener('click',()=>open(`<h2>${names[id]}</h2><img class="large-photo" src="${q('[data-photo] img').getAttribute('src')}" alt="${q('[data-photo] img').alt}">`));
  q('[data-detail]').addEventListener('click',()=>{try{sessionStorage.setItem('xinye:heritageFrom',location.href);}catch{}});
  q('[data-return]').addEventListener('click',e=>{if(document.referrer){try{const ref=new URL(document.referrer),root=new URL('../../',location.href);if(ref.href.startsWith(root.href)&&ref.href!==location.href){e.preventDefault();history.back();}}catch{}}});
  q('[data-close]').addEventListener('click',close);
  q('.overlay').addEventListener('click',e=>{if(e.target===q('.overlay'))close();const action=e.target.closest('[data-action]')?.dataset.action;if(action==='confirm'){const s=read();if(!s.completed.includes(id))s.completed.push(id);write(s);render();success();}if(action==='tasks')tasks();if(action==='reset-confirm')open(`<h2>重置演示记录？</h2><p>清除本机的两处打卡与收藏记录，恢复初始体验。</p>${button('确认重置','reset')}`);if(action==='reset'){write({completed:[],favorites:[]});render();tasks();}});
  document.addEventListener('keydown',e=>{if(q('.overlay').hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){const items=all('.overlay button,.overlay a').filter(el=>!el.disabled),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  // 缩短主图容器，使照片底部渐变、标题和卡片保持原有相对关系。
  function fitCards(){
    const screen=q('.screen'),cards=q('.cards'),nav=q('.task-tabs'),hero=q('.hero');
    const gap=parseFloat(getComputedStyle(cards).rowGap)||12;
    const baseHeight=innerWidth>760?362:Math.min(415,Math.max(330,innerHeight*.44));
    const cardHeight=cards.getBoundingClientRect().height/(screen.getBoundingClientRect().height/screen.clientHeight);
    const desiredHeight=nav.offsetTop-gap-cardHeight-parseFloat(getComputedStyle(cards).marginTop);
    // 极矮视口保留照片及标题空间，内容仍可滚动访问。
    screen.style.setProperty('--hero-height',Math.max(240,Math.min(baseHeight,desiredHeight))+'px');
    screen.style.setProperty('--navigation-clearance',(screen.clientHeight-nav.offsetTop+gap)+'px');
  }
  new ResizeObserver(fitCards).observe(q('.screen'));
  new ResizeObserver(fitCards).observe(q('.cards'));
  new ResizeObserver(fitCards).observe(q('.hero'));
  window.addEventListener('resize',()=>requestAnimationFrame(()=>requestAnimationFrame(fitCards)));
  document.fonts.ready.then(fitCards);
  window.addEventListener('storage',render);window.addEventListener('pageshow',()=>{render();fitCards();});render();fitCards();
})();
