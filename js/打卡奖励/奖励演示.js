// 独立演示数据，不读取或覆盖既有真实页面的打卡记录。
(() => {
 const key='xinye:reward-prototype:v1';let state={count:3,claimed:false,xishanDone:false,favorite:false};
 try{const s=JSON.parse(sessionStorage.getItem(key)||'null');if(s&&Number.isInteger(s.count)&&s.count>=0&&s.count<=8)state={count:s.count,claimed:!!s.claimed,xishanDone:!!s.xishanDone,favorite:!!s.favorite};}catch{}
 const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];const dialog=q('dialog');let trigger,timer;
 function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}}
 function render(){all('[data-count]').forEach(el=>el.textContent=`${state.count} / 8`);all('[data-dots],[data-segments]').forEach(el=>{el.innerHTML=Array.from({length:8},(_,i)=>`<i class="${i<state.count?'done':''}"></i>`).join('');el.setAttribute('aria-label',`已完成 ${state.count} / 8 处`);if(el.hasAttribute('data-segments'))el.setAttribute('aria-valuenow',state.count);});all('[data-locked]').forEach(b=>{const unlocked=state.count>=Number(b.dataset.locked);b.querySelector('.lock-badge').textContent=unlocked?'已解锁':'未解锁';b.querySelector(':scope > span:last-child').textContent=unlocked?'已达成解锁条件':`打卡 ${b.dataset.locked} 处可解锁`;});const claim=q('[data-claim]');if(claim)claim.innerHTML='<img class="icon" src="../../assets/打卡奖励/icons/gift.svg" alt="">'+(state.claimed?'查看领取记录':'立即领取');}
 function notice(message){q('.toast').textContent=message;q('.toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>q('.toast').classList.remove('show'),2600);}
 function open(html){trigger=document.activeElement;q('.dialog-body').innerHTML=html;dialog.showModal();q('.dialog-close').focus();}
 function close(){dialog.close();trigger?.focus();}
 function renderXishan(){
  if(q('[data-checkin-label]'))q('[data-checkin-label]').textContent=state.xishanDone?'查看打卡印章':'立即打卡';
  if(q('[data-xishan-status]'))q('[data-xishan-status]').textContent=state.xishanDone?'已完成':'进行中';
  if(q('[data-xishan-favorite]')){q('[data-xishan-favorite]').setAttribute('aria-pressed',String(state.favorite));q('[data-xishan-favorite]').setAttribute('aria-label',state.favorite?'取消收藏西山祠堂':'收藏西山祠堂');}
  if(q('.task-page .badge'))q('.task-page .badge').textContent=state.xishanDone?'已完成':'待完成';
 }
 function stamp(){open(`<h2>西山祠堂 · 已打卡</h2><p>已收集这一站的文化印章，当前进度 ${state.count} / 8 处。</p><p>此为本机演示记录，不作为现场到访或奖励兑换凭证。</p><a class="primary" href="奖励兑换.html">查看奖励</a>`);}
 q('[data-checkin]')?.addEventListener('click',()=>{if(state.xishanDone)return stamp();open('<h2>打卡 · 西山祠堂</h2><p>完成这一站，收集西山祠堂的文化印记。</p><p>当前为演示打卡，不启用定位或核验现场到访。</p><button class="primary" data-confirm-checkin>确认演示打卡</button>');});
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-confirm-checkin]')){if(!state.xishanDone){state.xishanDone=true;state.count=Math.min(8,state.count+1);save();}render();renderXishan();stamp();}});
 q('[data-xishan-favorite]')?.addEventListener('click',()=>{state.favorite=!state.favorite;save();renderXishan();notice(state.favorite?'已收藏西山祠堂':'已取消收藏');});
 q('[data-xishan-photo]')?.addEventListener('click',()=>open('<h2>西山祠堂</h2><img class="large-photo" src="../../assets/打卡奖励/images/西山祠堂.jpg" alt="西山祠堂庭院">'));
 q('.dialog-close').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 q('[data-progress]')?.addEventListener('click',()=>open(`<h2>我的打卡进度</h2><p>当前已完成 <strong data-live-count>${state.count}</strong> / 8 处。</p><p>以下为界面演示，可调整进度查看奖励的解锁状态。</p><label>演示打卡数量<input aria-label="演示打卡数量" type="range" min="0" max="8" step="1" value="${state.count}" data-demo-count></label><button class="primary" data-close>完成</button>`));
 dialog.addEventListener('input',e=>{if(e.target.matches('[data-demo-count]')){state.count=Number(e.target.value);q('[data-live-count]').textContent=state.count;save();render();}});
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();if(e.target.closest('[data-confirm-claim]')){state.claimed=true;save();render();open('<h2>演示领取已完成</h2><p>新叶 · 昆曲咖啡</p><p>这是一条本机演示记录，不是实物兑换凭证。</p><button class="primary" data-close>完成</button>');}});
 q('[data-claim]')?.addEventListener('click',()=>{if(state.claimed)return open('<h2>领取记录</h2><p>新叶 · 昆曲咖啡</p><p>已完成演示领取，未生成实物兑换订单。</p><button class="primary" data-close>知道了</button>');open('<h2>领取新叶 · 昆曲咖啡</h2><p>当前用于体验奖励领取流程，正式领取条件、库存与兑换地点待后续确定。</p><button class="primary" data-confirm-claim>确认演示领取</button>');});
 q('[data-info]')?.addEventListener('click',()=>open('<h2>奖励说明</h2><p>游古村、集印章，收藏新叶的独家纪念。</p><p>当前为界面演示，咖啡领取门槛及实际兑换规则待确认。</p>'));
 all('[data-locked]').forEach(b=>b.addEventListener('click',()=>open(`<h2>${b.dataset.name}</h2><p>${state.count>=Number(b.dataset.locked)?'已达成演示解锁条件，商品详情待补充。':`完成 ${b.dataset.locked} 处打卡后解锁，当前进度 ${state.count} / 8。`}</p><button class="primary" data-close>知道了</button>`)));
 q('[data-share]')?.addEventListener('click',()=>notice('当前为本地界面演示，分享功能待接入'));
 render();renderXishan();
})();
