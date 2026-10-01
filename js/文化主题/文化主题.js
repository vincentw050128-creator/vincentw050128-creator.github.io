/* 两个文化页共享的阅读交互；不依赖网络接口。 */
(() => {
  const content=document.querySelector('.culture-page .content');
  if(!content)return;
  const screen=document.querySelector('.screen'),bar=document.querySelector('.culture-topbar');
  const menu=document.querySelector('.chapter-menu'),menuButton=document.querySelector('[data-menu]');
  const viewer=document.querySelector('.viewer'),viewerImage=viewer.querySelector('img');
  const photos=[...document.querySelectorAll('[data-photo]')];
  const uniquePhotos=[...new Map(photos.map(button=>[button.querySelector('img').getAttribute('src'),button])).values()];
  let activePhoto=0,previousFocus;
  function syncHeader(){const reading=content.scrollTop>275;bar.classList.toggle('scrolled',reading);screen.classList.toggle('reading',reading);}
  content.addEventListener('scroll',syncHeader,{passive:true});window.addEventListener('pageshow',syncHeader);syncHeader();
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
  menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
  document.addEventListener('click',event=>{if(!menu.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>anchor.addEventListener('click',event=>{
    const target=document.querySelector(anchor.getAttribute('href'));if(!target)return;
    event.preventDefault();closeMenu();
    const scale=content.getBoundingClientRect().height/content.clientHeight;
    const top=(target.getBoundingClientRect().top-content.getBoundingClientRect().top)/scale+content.scrollTop-114;
    content.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  function showPhoto(index){
    activePhoto=(index+uniquePhotos.length)%uniquePhotos.length;
    const img=uniquePhotos[activePhoto].querySelector('img');viewerImage.src=img.src;viewerImage.alt=img.alt;
    viewer.querySelector('figcaption').textContent=img.alt;
    viewer.querySelector('[data-count]').textContent=`${String(activePhoto+1).padStart(2,'0')} / ${String(uniquePhotos.length).padStart(2,'0')}`;
  }
  function closeViewer(){viewer.hidden=true;content.classList.remove('locked');content.inert=false;bar.inert=false;previousFocus?.focus({preventScroll:true});}
  photos.forEach(button=>button.addEventListener('click',()=>{
    previousFocus=button;showPhoto(uniquePhotos.findIndex(item=>item.querySelector('img').getAttribute('src')===button.querySelector('img').getAttribute('src')));
    viewer.hidden=false;content.classList.add('locked');content.inert=true;bar.inert=true;closeMenu();viewer.querySelector('[data-close]').focus();
  }));
  viewer.querySelector('[data-close]').addEventListener('click',closeViewer);
  viewer.querySelector('[data-prev]').addEventListener('click',()=>showPhoto(activePhoto-1));
  viewer.querySelector('[data-next]').addEventListener('click',()=>showPhoto(activePhoto+1));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){if(!viewer.hidden)closeViewer();else if(!menu.hidden){closeMenu();menuButton.focus();}}
    if(viewer.hidden)return;
    if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(activePhoto-1);}
    if(event.key==='ArrowRight'){event.preventDefault();showPhoto(activePhoto+1);}
    if(event.key==='Tab'){
      const buttons=[...viewer.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  document.querySelectorAll('[data-heritage]').forEach(link=>link.addEventListener('click',()=>{try{sessionStorage.setItem('xinye:heritageFrom',location.href);}catch{}}));
})();
