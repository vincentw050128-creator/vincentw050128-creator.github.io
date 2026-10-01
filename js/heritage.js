(() => {
  const search=document.querySelector('.catalog-search');
  if(search){
    let category='all';
    const filter=()=>{
      let total=0;const q=search.value.trim();
      document.querySelectorAll('.launcher-group').forEach(group=>{
        let count=0;
        group.querySelectorAll('.card').forEach(card=>{const visible=(category==='all'||group.dataset.group===category)&&card.textContent.includes(q);card.hidden=!visible;if(visible)count++;});
        group.hidden=count===0;total+=count;
      });
      document.querySelector('.catalog-empty').hidden=total!==0;
      document.querySelector('.catalog-content').scrollTop=0;
    };
    search.addEventListener('input',filter);
    document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));filter();}));
  }
  document.querySelectorAll('.p05-back-btn').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    let source;try{source=sessionStorage.getItem('xinye:heritageFrom');}catch{}
    const root=new URL('../',document.querySelector('script[src$="/heritage.js"]').src);
    if(source){try{const u=new URL(source);if(u.href.startsWith(root.href)&&u.href!==location.href){if(document.referrer===source)history.back();else location.replace(u.href);return;}}catch{}}
    location.replace(new URL('html/heritage/index.html',root));
  }));
  document.querySelectorAll('.catalog-content .card').forEach(card=>card.addEventListener('click',()=>{try{sessionStorage.setItem('xinye:heritageFrom',location.href);}catch{}}));
})();
