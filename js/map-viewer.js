/* 原分辨率地图：按当前倍率重新布局图片，不放大低分辨率合成图层。 */
(() => {
  const map=document.querySelector('.map'),canvas=document.querySelector('.map-canvas'),img=document.querySelector('.map-image');
  const screen=document.querySelector('.screen'),sheet=document.querySelector('.sheet');
  const points=window.XinyeMapPoints,records=window.XinyeHeritage,cardBody=sheet.querySelector('.card-body'),detail=sheet.querySelector('.detail');
  const towerContent=cardBody.innerHTML;
  let selected=points.find(p=>p.name==='抟云塔');
  const buttons=new Map();
  const root=new URL('../',document.querySelector('script[src$="/map-viewer.js"]').src);
  function openDetail(point){
    if(point.name==='抟云塔'){window.Xinye?.go('tower');return;}
    const record=records.find(r=>r.name===point.ref);if(!record)return;
    try{sessionStorage.setItem('xinye:heritageFrom',location.href);}catch{}
    location.assign(new URL('html/heritage/'+record.href,root));
  }
  points.forEach(point=>{
    const button=document.createElement('button');button.className='map-point'+(point.name==='抟云塔'?' tower-hotspot':'');
    button.setAttribute('aria-label',point.name==='抟云塔'?'进入抟云塔详情':'查看'+point.name+'信息');button.dataset.point=point.name;
    Object.assign(button.style,{left:point.x/5353*100+'%',top:point.y/3842*100+'%',width:point.width/5353*100+'%',height:point.height/3842*100+'%'});
    button.addEventListener('click',event=>{event.stopPropagation();if(point.name==='抟云塔')openDetail(point);else {openCard(point);requestAnimationFrame(()=>focusPoint(point));}});
    canvas.append(button);buttons.set(point.name,button);
  });
  let zoom=1,x=0,y=0,base=1,min=1,max=1,ready=false,gesture=null,tap=null;
  const pointers=new Map(),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  canvas.style.willChange='auto';canvas.style.transformOrigin='0 0';
  img.style.objectFit='fill';img.style.imageRendering='auto';
  const outerScale=()=>map.getBoundingClientRect().width/map.clientWidth || 1;
  const local=(clientX,clientY)=>{const r=map.getBoundingClientRect(),k=outerScale();return {x:(clientX-r.left)/k-map.clientWidth/2,y:(clientY-r.top)/k-map.clientHeight/2};};
  function draw(){
    if(!ready)return;
    zoom=clamp(zoom,min,max);
    const w=img.naturalWidth*base*zoom,h=img.naturalHeight*base*zoom;
    x=clamp(x,-Math.max(0,(w-map.clientWidth)/2),Math.max(0,(w-map.clientWidth)/2));
    y=clamp(y,-Math.max(0,(h-map.clientHeight)/2),Math.max(0,(h-map.clientHeight)/2));
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    canvas.style.transform=`translate(${(map.clientWidth-w)/2+x}px, ${(map.clientHeight-h)/2+y}px)`;
    map.dataset.zoom=String(zoom);map.dataset.maxZoom=String(max);map.dataset.minZoom=String(min);
    document.querySelector('.zoom-in').disabled=zoom>=max-0.0001;
    document.querySelector('.zoom-out').disabled=zoom<=min+0.0001;
  }
  function dimensions(){
    if(!img.naturalWidth)return;
    const nextBase=Math.max(map.clientWidth/img.naturalWidth,map.clientHeight/img.naturalHeight);
    if(ready)zoom=zoom*base/nextBase;
    base=nextBase;
    min=Math.min(map.clientWidth/img.naturalWidth,map.clientHeight/img.naturalHeight)/base;
    // 一个原图像素至少对应一个物理屏幕像素时停止放大。
    max=Math.max(min,1/(base*(window.devicePixelRatio||1)*outerScale()));
    ready=true;draw();
  }
  function zoomTo(next,anchor={x:0,y:0}){
    if(!ready)return;const z=clamp(next,min,max),ratio=z/zoom;
    x=anchor.x-(anchor.x-x)*ratio;y=anchor.y-(anchor.y-y)*ratio;zoom=z;draw();
  }
  function zoomBy(factor,anchor){zoomTo(zoom*factor,anchor);if(typeof say==='function')say(zoom>=max-.001?'已到原图清晰放大上限':`地图 ${Math.round(zoom*100)}%`);}
  document.querySelector('.zoom-in').addEventListener('click',()=>zoomBy(1.25));
  document.querySelector('.zoom-out').addEventListener('click',()=>zoomBy(.8));
  map.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(-clamp(e.deltaY,-100,100)*.003),local(e.clientX,e.clientY));},{passive:false});
  function begin(){
    const values=[...pointers.values()];if(!values.length){gesture=null;return;}
    if(values.length===1)gesture={count:1,p:values[0],x,y};
    else {const [a,b]=values;gesture={count:2,d:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},x,y,zoom};}
  }
  map.addEventListener('pointerdown',e=>{
    if(!ready)return;
    const button=e.target.closest('.map-point');
    tap=pointers.size===0&&button?{button,x:e.clientX,y:e.clientY}:null;
    e.preventDefault();pointers.set(e.pointerId,local(e.clientX,e.clientY));map.setPointerCapture(e.pointerId);map.classList.add('dragging');begin();
  });
  map.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>6)tap=null;
    pointers.set(e.pointerId,local(e.clientX,e.clientY));const values=[...pointers.values()];
    if(gesture.count===1){x=gesture.x+values[0].x-gesture.p.x;y=gesture.y+values[0].y-gesture.p.y;}
    else {const [a,b]=values;if(!b)return;const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};zoom=clamp(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.d,min,max);const ratio=zoom/gesture.zoom;x=mid.x-(gesture.mid.x-gesture.x)*ratio;y=mid.y-(gesture.mid.y-gesture.y)*ratio;}
    draw();
  });
  function end(e){const activate=e.type==='pointerup'&&pointers.size===1&&tap;tap=null;pointers.delete(e.pointerId);begin();if(!pointers.size)map.classList.remove('dragging');if(activate)activate.button.click();}
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>map.addEventListener(type,end));
  function layoutCard(){
    // 依照实际换行收紧卡片；正文末行与“查看详情”保持14px间距。
    const desc=cardBody.querySelector('.desc'),photo=cardBody.querySelector('.tower');
    if(!desc)return;
    desc.style.position='static';
    const textBottom=desc.offsetTop+desc.offsetHeight;
    const imageBottom=photo?photo.offsetTop+photo.offsetHeight:0;
    screen.style.setProperty('--map-card-height',Math.ceil(Math.max(textBottom,imageBottom)+83)+'px');
    desc.style.position='';
  }
  function openCard(point=selected){
    selected=point;const record=records.find(r=>r.name===point.ref);
    sheet.classList.toggle('generic-card',point.name!=='抟云塔');sheet.classList.toggle('no-photo',!record?.image);
    if(point.name==='抟云塔')cardBody.innerHTML=towerContent;
    else{
      cardBody.replaceChildren();
      const add=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;cardBody.append(el);return el;};
      add('span','tag',record?record.badges.join(' · '):'地图标注点');add('h1','',point.name);
      if(record){add('div','meta',record.tagline);add('p','desc',record.summary);if(record.image){const photo=add('img','tower','');photo.src=new URL('html/heritage/'+record.image,root).href;photo.alt=record.name;}}
      else add('p','desc','现有62处文保详情中暂无该点的独立介绍，可继续浏览地图或打开文保点列表。');
    }
    detail.removeAttribute('data-nav');detail.disabled=!record;detail.innerHTML=record?'查看详情 <span>›</span>':'暂无独立详情';
    sheet.classList.add('open');screen.classList.add('card-open');buttons.forEach((b,n)=>b.classList.toggle('selected',n===point.name));
    cardBody.scrollTop=0;layoutCard();
  }
  function closeCard(){sheet.classList.remove('open');screen.classList.remove('card-open');buttons.forEach(b=>b.classList.remove('selected'));buttons.get(selected.name).focus({preventScroll:true});}
  function focusPoint(point){dimensions();const w=img.naturalWidth*base*zoom,h=img.naturalHeight*base*zoom;x=(.5-point.x/5353)*w;y=(.5-point.y/3842)*h;draw();}
  detail.addEventListener('click',()=>openDetail(selected));
  document.querySelector('.close-card').addEventListener('click',closeCard);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheet.classList.contains('open'))closeCard();});
  function init(){
    let state;try{state=JSON.parse(sessionStorage.getItem('xinye:map:v3')||'null');}catch{}
    if(state){selected=points.find(p=>p.name===state.selected)||selected;if(state.open)openCard(selected);dimensions();zoom=state.zoom;x=state.x;y=state.y;draw();}
    else{openCard(selected);zoom=2.5;focusPoint(selected);}
  }
  if(img.complete&&img.naturalWidth)init();else img.addEventListener('load',init,{once:true});
  new ResizeObserver(dimensions).observe(map);window.addEventListener('resize',()=>requestAnimationFrame(dimensions));
  new ResizeObserver(layoutCard).observe(screen);document.fonts?.ready.then(layoutCard);
  window.addEventListener('pagehide',()=>{try{sessionStorage.setItem('xinye:map:v3',JSON.stringify({zoom,x,y,open:sheet.classList.contains('open'),selected:selected.name}));}catch{}});
  const search=document.querySelector('.search input'),results=document.createElement('div');results.className='map-search-results';screen.append(results);
  search.addEventListener('input',()=>{results.replaceChildren();const q=search.value.trim();if(!q)return;points.filter(p=>p.name.includes(q)||(p.name==='新兰公路'&&'兰新公路'.includes(q))).forEach(point=>{const b=document.createElement('button');b.textContent=point.name;b.addEventListener('click',()=>{results.replaceChildren();search.value='';openCard(point);zoom=Math.max(zoom,2.5);requestAnimationFrame(()=>focusPoint(point));});results.append(b);});if(!results.children.length){const p=document.createElement('p');p.textContent='没有找到对应地图标注';p.style.padding='0 14px';results.append(p);}});
  window.XinyeMap=Object.freeze({select(name){const point=points.find(p=>p.name===name);if(point){openCard(point);requestAnimationFrame(()=>focusPoint(point));}},points});
})();
