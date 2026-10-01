/* 页面路由统一入口；页面样式与业务内容仍由各自 HTML 管理。 */
(() => {
  const scriptURL = document.currentScript.src;
  const root = new URL('../', scriptURL);
  const pages = Object.freeze({
    rewardTasks: '打卡奖励/任务入口.html',
    splash: 'p01-splash.html', login: 'p02-login.html', home: 'P03_-V1.6-B2_Apple.html',
    map: 'P03_景区导览地图_V2.1_交互版_Apple.html', tower: 'p05-tayun-tower-apple.html',
    tickets: 'P06_门票_完整展示.html', mine: 'P07_我的新叶_V1.0_Apple.html', heritage: 'heritage/index.html',
    cultureFestival: '文化主题/三月三_祭祖巡游.html',
    cultureReading: '文化主题/耕读文脉.html',
    checkinXishan: '打卡奖励/西山祠堂打卡.html',
    checkinYouxu: '打卡奖励/有序堂打卡.html'
  });
  // 所有底部“任务”入口统一进入新叶集章；景点正文中的打卡按钮保持原用途。
  document.querySelectorAll('nav a,nav button').forEach(el=>{
    if(el.textContent.trim()==='任务'){el.dataset.nav='rewardTasks';delete el.dataset.pending;}
  });
  // 静态托管可能将 foo.html 重定向为 foo；两种地址识别为同一页。
  const routeName = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  const currentFile = routeName.endsWith('.html') ? routeName : routeName + '.html';
  const current = document.querySelector('.catalog-screen') ? 'heritage' : document.querySelector('[data-screen="splash"]') ? 'splash' : Object.keys(pages).find(key => pages[key].split('/').pop() === currentFile);
  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key,value) { try { sessionStorage.setItem(key,value); } catch {} }
  };
  const url = key => new URL('html/' + pages[key], root).href;
  function saveScroll() {
    const values = [...document.querySelectorAll('.content,.p05-scroll-content,.catalog-content')].map(el=>el.scrollTop);
    storage.set('xinye:scroll:'+currentFile, JSON.stringify(values));
  }
  function go(key) {
    if (!pages[key]) return;
    if (key === current) return;
    saveScroll();
    if (key === 'tower') storage.set('xinye:towerFrom', JSON.stringify({page:current,href:location.href}));
    if (key === 'tickets') storage.set('xinye:ticketsFrom', JSON.stringify({page:current,href:location.href}));
    if (key === 'cultureFestival' || key === 'cultureReading') storage.set('xinye:from:'+key, JSON.stringify({page:current,href:location.href}));
    if (key === 'heritage') storage.set('xinye:catalogFrom', JSON.stringify({page:current,href:location.href}));
    location.assign(url(key));
  }
  function cultureReturn(sourceKey = 'xinye:from:'+current) {
    let source;try {source=JSON.parse(storage.get(sourceKey));}catch{}
    if (source && pages[source.page] && source.page !== current && document.referrer === source.href) history.back();
    else location.replace(url('home'));
  }
  function catalogReturn() {
    // 按浏览器真实访问顺序退一步，也适用于本地文件没有 referrer 的情况。
    if (history.length > 1) {history.back();return;}
    let source;try {source=JSON.parse(storage.get('xinye:catalogFrom'));}catch{}
    try {
      const previous=new URL(source?.href || document.referrer);
      if (previous.href.startsWith(root.href) && previous.href !== location.href) {
        location.replace(previous.href);return;
      }
    } catch {}
    location.replace(url('home'));
  }
  function back() {
    let source;try {source=JSON.parse(storage.get('xinye:towerFrom'));}catch{}
    // 打卡站点使用具体详情来源地址，返回该站而非统一任务入口。
    if(source?.href){try{const previous=new URL(source.href);if(previous.href.startsWith(root.href)&&previous.href!==location.href){
      if(history.length>1)history.back();else location.replace(previous.href);return;
    }}catch{}}
    if (source && pages[source.page] && source.page !== 'tower') {
      if (document.referrer && new URL(document.referrer).href === source.href) history.back();
      else location.replace(url(source.page));
    } else location.replace(url('map'));
  }
  function ticketReturn() {
    let source;try {source=JSON.parse(storage.get('xinye:ticketsFrom'));}catch{}
    const fallback=source && pages[source.page] && source.page!=='tickets' ? source.page : 'home';
    // 购票内层会占用浏览器历史；明确返回进入门票的页面，避免退回订单步骤。
    location.replace(source && pages[source.page] && source.page!=='tickets' ? url(source.page) : url(fallback));
  }
  let timer;
  function notice(message = '此功能为演示预留，后续补充对应界面') {
    let el = document.querySelector('[data-toast],.toast');
    if (!el) {
      el=document.createElement('div');el.className='xinye-notice';el.setAttribute('role','status');
      (document.querySelector('.screen') || document.body).append(el);
    }
    el.textContent=message;el.classList.add('show');clearTimeout(timer);
    timer=setTimeout(()=>el.classList.remove('show'),2200);
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(link && link.href === url('heritage')) {
      storage.set('xinye:catalogFrom', JSON.stringify({page:current,href:location.href}));
    }
    const target=event.target.closest('[data-nav],[data-pending]');
    if(!target)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(target.dataset.pending)notice();
    else if(target.dataset.nav==='back')back();
    else if(target.dataset.nav==='cultureBack')cultureReturn();
    else if(target.dataset.nav==='catalogBack')catalogReturn();
    else if(target.dataset.nav==='cultureOrigin')cultureReturn('xinye:catalogFrom');
    else go(target.dataset.nav);
  },true);
  document.addEventListener('keydown',event=>{
    if(!['Enter',' '].includes(event.key))return;
    const target=event.target.closest('[role="button"][data-nav],[role="button"][data-pending]');
    if(target){event.preventDefault();target.click();}
  });
  window.addEventListener('pagehide',saveScroll);
  window.addEventListener('pageshow',event=>{
    // 新点击进入详情从顶部开始；只有历史返回才恢复阅读位置。
    const detail=document.querySelector('.p05-scroll-content');
    const historyVisit=event.persisted || performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    if(detail && !historyVisit) {
      detail.scrollTop=0;
      storage.set('xinye:scroll:'+currentFile,'[0]');
      return;
    }
    try {const values=JSON.parse(storage.get('xinye:scroll:'+currentFile)||'[]');
      document.querySelectorAll('.content,.p05-scroll-content,.catalog-content').forEach((el,i)=>{if(values[i])el.scrollTop=values[i];});
    }catch{}
  });
  function fitDesktop() {
    const stage=document.querySelector('.stage');if(!stage)return;
    stage.style.zoom='';
    if(innerWidth<=760)return;
    const h=884.8;
    const w=390;
    const scale=Math.min(1,(innerHeight-32)/h,(innerWidth-32)/w);
    if(scale<1)stage.style.zoom=String(Math.max(.25,scale));
  }
  fitDesktop();window.addEventListener('resize',fitDesktop);
  document.querySelectorAll('[data-od-id="p02-user-agreement"],[data-od-id="p02-privacy-policy"]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();notice('协议内容为演示预留');}));
  window.Xinye=Object.freeze({pages,go,back,ticketReturn,notice});
})();
