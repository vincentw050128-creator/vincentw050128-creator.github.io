/* 所有演示页共用首页的设备尺寸、状态图标与展示位置。 */
(() => {
  const chromeURL=document.currentScript.src;
  const bottomNav=document.querySelector('.screen > nav.tabbar,.screen > nav.task-tabs');
  if(bottomNav){
    const style=document.createElement('link');style.rel='stylesheet';
    style.href=new URL('../../assets/打卡奖励/styles/统一底部导航.css',chromeURL).href;document.head.append(style);
    bottomNav.classList.add('nav-reference');
    [...bottomNav.children].forEach((item,index)=>{
      if(!item.matches('a,button'))return;
      const label=item.textContent.trim();
      const icon=document.createElement('span');icon.className='nav-reference-icon';
      const img=document.createElement('img');img.alt='';
      img.src=new URL('../../assets/打卡奖励/icons/navigation/tab-'+index+'.svg',chromeURL).href;
      icon.append(img);item.replaceChildren(icon,document.createTextNode(label));
      item.classList.add('nav-reference-item');
    });
  }
  const device=document.querySelector('.device'),screen=device?.querySelector('.screen');
  if(!screen)return;
  device.classList.add('unified-device');
  device.querySelectorAll(':scope > .rail,:scope > .island,:scope > .unified-rail,:scope > .unified-island').forEach(el=>el.remove());
  device.insertAdjacentHTML('afterbegin',[1,2,3,4].map(i=>`<i class="unified-rail r${i}" aria-hidden="true"></i>`).join('')+'<i class="unified-island" aria-hidden="true"></i>');
  screen.querySelectorAll('.statusbar,.status').forEach(el=>el.remove());
  const status=document.createElement('div');status.className='site-status';status.setAttribute('aria-hidden','true');
  status.innerHTML=`<span class="site-time">9:41</span><span class="site-signals"><svg viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx=".6"/><rect x="4" y="5" width="3" height="6" rx=".6"/><rect x="8" y="3" width="3" height="8" rx=".6"/><rect x="12" y="0" width="3" height="11" rx=".6"/></svg><svg viewBox="0 0 17 11"><path d="M8.5 1.5C5.5 1.5 2.7 2.6 0.5 4.6L2 6.1C3.8 4.5 6.1 3.6 8.5 3.6c2.4 0 4.7 0.9 6.5 2.5l1.5-1.5c-2.2-2-5-3.1-8-3.1zM3.5 7.6L5 9.1c1-0.9 2.2-1.4 3.5-1.4 1.3 0 2.5 0.5 3.5 1.4l1.5-1.5c-1.4-1.3-3.1-2-5-2-1.9 0-3.6 0.7-5 2zM6.5 10.6l2 2 2-2c-0.5-0.5-1.2-0.8-2-0.8s-1.5 0.3-2 0.8z"/></svg><svg class="site-battery" viewBox="0 0 25 11"><rect x=".5" y=".5" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-opacity=".45"/><rect x="22" y="3.5" width="1.5" height="4" rx=".4" fill="currentColor" fill-opacity=".45"/><rect x="2" y="2" width="18" height="7" rx="1.4"/></svg></span>`;
  screen.append(status);
  // 首页白色图标保持原样；统一浅阴影让同一套图标在浅底页也可辨认。
  let caption=document.querySelector('.stage > .caption,.stage > .p05-stage-label');
  if(!caption){caption=document.createElement('div');caption.className='caption';caption.textContent='新叶村数字导览';device.parentElement.prepend(caption);}
  caption.classList.add('site-caption');
})();
