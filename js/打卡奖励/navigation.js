/* 模块内部导航为真实相对链接；主导航回到现有项目。 */
(() => {
 const project=new URL('../../',document.currentScript.src);
 const routes={home:'P03_-V1.6-B2_Apple.html',map:'P03_景区导览地图_V2.1_交互版_Apple.html',explore:'heritage/index.html',mine:'P07_我的新叶_V1.0_Apple.html',xishanDetail:'heritage/pages/GB_004_西山祠堂.html'};
 document.querySelectorAll('[data-external]').forEach(a=>a.href=new URL('html/'+routes[a.dataset.external],project).href);
 document.querySelectorAll('[data-detail-path]').forEach(a=>a.href=new URL(a.dataset.detailPath,project).href);
 document.querySelector('[data-external="xishanDetail"]')?.addEventListener('click',()=>{try{sessionStorage.setItem('xinye:heritageFrom',location.href);}catch{}});
 function fit(){const stage=document.querySelector('.stage');stage.style.zoom='';if(innerWidth>760)stage.style.zoom=String(Math.min(1,(innerHeight-32)/884.8,(innerWidth-32)/390));}
 fit();addEventListener('resize',fit);
})();
