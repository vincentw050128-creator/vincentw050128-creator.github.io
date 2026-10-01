/* 八站本机会话演示：每站记录独立，重复打卡不增加总数。 */
(() => {
 const places=window.XinyeStations,total=places.length,key='xinye:checkin-eight:v1';
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 const ids=new Set(places.map(p=>p.id)),current=places.find(p=>p.id===document.body.dataset.station);
 const dialog=q('dialog');let trigger,timer;
 function read(){
  try{const s=JSON.parse(sessionStorage.getItem(key)||'null');if(s)return {completed:[...new Set((s.completed||[]).filter(id=>ids.has(id)))],favorites:[...new Set((s.favorites||[]).filter(id=>ids.has(id)))],claimed:!!s.claimed,selected:ids.has(s.selected)?s.selected:places[0].id};
   const old=JSON.parse(sessionStorage.getItem('xinye:reward-prototype:v1')||'null');
   return {completed:old?.xishanDone?['xishan']:[],favorites:old?.favorite?['xishan']:[],claimed:!!old?.claimed,selected:places[0].id};
  }catch{return {completed:[],favorites:[],claimed:false,selected:places[0].id};}
 }
 let state=read();
 function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}}
 if(current){state.selected=current.id;}save();
 const selected=()=>current||places.find(p=>p.id===state.selected)||places[0];
 function render(){
  const count=state.completed.length,p=selected();
  all('[data-count]').forEach(el=>el.textContent=`${count} / ${total}`);
  all('[data-dots],[data-segments]').forEach(el=>{el.innerHTML=places.map((_,index)=>`<i class="${index<count?'done':''}" title="第${index+1}枚印章${index<count?'，已集得':'，待集得'}"></i>`).join('');el.setAttribute('aria-label',`已完成 ${count} / ${total} 处`);if(el.hasAttribute('data-segments'))el.setAttribute('aria-valuenow',count);});
  all('[data-locked]').forEach(b=>{const unlocked=count>=Number(b.dataset.locked);b.querySelector('.lock-badge').textContent=unlocked?'已解锁':'未解锁';b.querySelector(':scope > span:last-child').textContent=unlocked?'已达成解锁条件':`打卡 ${b.dataset.locked} 处可解锁`;});
  if(q('[data-claim]'))q('[data-claim]').innerHTML='<img class="icon" src="../../assets/打卡奖励/icons/gift.svg" alt="">'+(state.claimed?'查看领取记录':'立即领取');
  const done=state.completed.includes(p.id);
  if(q('[data-checkin-label]'))q('[data-checkin-label]').textContent=done?'查看打卡印章':'立即打卡';
  if(q('[data-station-status]'))q('[data-station-status]').textContent=done?'已完成':'进行中';
  const favorite=q('[data-station-favorite]');if(favorite){favorite.setAttribute('aria-pressed',String(state.favorites.includes(p.id)));favorite.setAttribute('aria-label',(state.favorites.includes(p.id)?'取消收藏':'收藏')+p.name);}
  if(q('[data-journey-name]')){
   q('[data-journey-name]').textContent=p.name;q('[data-journey-subtitle]').textContent=p.subtitle;
   q('[data-journey-index]').textContent=`${p.order} / ${total}`;
   q('[data-journey-description]').textContent=`走进${p.name}，${p.subtitle}。`;
   q('[data-journey-photo]').src=p.hero;q('[data-journey-photo]').alt=p.heroAlt;
   q('[data-journey-status]').textContent=done?'已完成':'待完成';q('[data-journey-link]').href=p.file;
  }
 }
 function notice(message){const el=q('.toast');el.textContent=message;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),2600);}
 function open(html){if(!dialog.open)trigger=document.activeElement;q('.dialog-body').innerHTML=html;if(!dialog.open)dialog.showModal();q('.dialog-close').focus();}
 function close(){dialog.close();trigger?.focus();}
 function list(progress=false){const p=selected();open(`<h2>${progress?'我的打卡进度':'选择打卡景点'}</h2><p>已完成 ${state.completed.length} / ${total} 处，按顺序探索，也可选择任意一站。</p><ol class="station-list">${places.map(item=>`<li><a href="${item.file}" class="${state.completed.includes(item.id)?'is-done':''}" ${item.id===p.id?'aria-current="page"':''}><span class="station-number">${item.order}</span><span class="station-copy"><strong>${item.name}</strong><small>${item.subtitle}</small></span><span class="station-state">${state.completed.includes(item.id)?'已打卡':'未打卡'}</span></a></li>`).join('')}</ol>`);}
 function stamp(){const p=selected(),next=places.find(item=>item.order>p.order&&!state.completed.includes(item.id))||places.find(item=>!state.completed.includes(item.id));open(`<h2>${p.name} · 已打卡</h2><p>已收集这一站的文化印章，当前进度 ${state.completed.length} / ${total} 处。</p><p>此为本机演示记录，不作为现场到访或奖励兑换凭证。</p><div class="station-actions">${next?`<a class="primary" href="${next.file}">下一站 · ${next.name}</a>`:'<p>八处文化印章已集齐。</p>'}<a class="${next?'station-secondary':'primary'}" href="奖励兑换.html">查看奖励</a></div>`);}
 all('[data-select-station],[data-progress]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();list(el.hasAttribute('data-progress'));}));
 q('[data-checkin]')?.addEventListener('click',()=>{const p=selected();if(state.completed.includes(p.id))return stamp();open(`<h2>打卡 · ${p.name}</h2><p>完成这一站，收集${p.name}的文化印记。</p><p>当前为演示打卡，不启用定位或核验现场到访。</p><button class="primary" data-confirm-checkin>确认演示打卡</button>`);});
 q('[data-station-favorite]')?.addEventListener('click',()=>{const p=selected(),done=state.favorites.includes(p.id);state.favorites=done?state.favorites.filter(id=>id!==p.id):[...state.favorites,p.id];save();render();notice(done?'已取消收藏':'已收藏'+p.name);});
 q('[data-station-photo]')?.addEventListener('click',()=>{const p=selected();open(`<h2>${p.name}</h2><img class="large-photo" src="${p.photo}" alt="${p.photoAlt}">`);});
 q('[data-station-detail]')?.addEventListener('click',()=>{try{sessionStorage.setItem('xinye:heritageFrom',location.href);if(current.id==='tower')sessionStorage.setItem('xinye:towerFrom',JSON.stringify({page:'checkinTower',href:location.href}));}catch{}});
 q('.dialog-close')?.addEventListener('click',close);
 dialog.addEventListener('click',e=>{
  if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}
  if(e.target.closest('[data-confirm-checkin]')){const p=selected();state=read();if(!state.completed.includes(p.id))state.completed.push(p.id);state.selected=p.id;save();render();stamp();}
  if(e.target.closest('[data-close]'))close();
  if(e.target.closest('[data-confirm-claim]')){state.claimed=true;save();render();open('<h2>演示领取已完成</h2><p>新叶 · 昆曲咖啡</p><p>这是一条本机演示记录，不是实物兑换凭证。</p><button class="primary" data-close>完成</button>');}
 });
 q('[data-claim]')?.addEventListener('click',()=>{if(state.claimed)return open('<h2>领取记录</h2><p>新叶 · 昆曲咖啡</p><p>已完成演示领取，未生成实物兑换订单。</p><button class="primary" data-close>知道了</button>');open('<h2>领取新叶 · 昆曲咖啡</h2><p>当前用于体验奖励领取流程，正式领取条件、库存与兑换地点待后续确定。</p><button class="primary" data-confirm-claim>确认演示领取</button>');});
 q('[data-info]')?.addEventListener('click',()=>open('<h2>奖励说明</h2><p>游古村、集印章，收藏新叶的独家纪念。</p><p>当前为界面演示，咖啡领取门槛及实际兑换规则待确认。</p>'));
 all('[data-locked]').forEach(b=>b.addEventListener('click',()=>open(`<h2>${b.dataset.name}</h2><p>${state.completed.length>=Number(b.dataset.locked)?'已达成演示解锁条件，商品详情待补充。':`完成 ${b.dataset.locked} 处打卡后解锁，当前进度 ${state.completed.length} / ${total}。`}</p><button class="primary" data-close>知道了</button>`)));
 q('[data-share]')?.addEventListener('click',()=>notice('当前为本地界面演示，分享功能待接入'));
 window.addEventListener('pageshow',()=>{state=read();if(current)state.selected=current.id;save();render();});
 render();
})();
