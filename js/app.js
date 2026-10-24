(() => {
'use strict';
const {copy,gallery}=window.ChevaletContent;
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const readLanguage=()=>['en','fr'].includes(new URLSearchParams(location.search).get('lang'))?'en':'ru';
let lang=readLanguage();
let activeTab='kitchen';
const pageByTab={kitchen:0,bar:0};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const nav=$('#navigation'),navToggle=$('.nav-toggle'),info=$('#info-dialog'),lightbox=$('#lightbox');
let lastFocus=null;
let lightboxType='menu',lightboxIndex=0;
const pageSrc=i=>`assets/menu-${lang}-${activeTab}-${i+1}.svg`;
const t=key=>copy[lang][key]??key;
let lenis=null;
function setupSmoothScroll(){
  lenis?.destroy();lenis=null;
  if(!reduced.matches&&window.Lenis){
    lenis=new window.Lenis({autoRaf:false,smoothWheel:true,duration:1.15,lerp:.085,syncTouch:false,prevent:node=>!!node.closest('[data-lenis-prevent]')});
    lenis.on('scroll',()=>scrollDirty=true);
  }
}
function syncScrollLock(){
  const locked=nav.classList.contains('open')||info.open||lightbox.open;
  document.body.classList.toggle('locked',locked);
  if(locked)lenis?.stop();else lenis?.start();
}

/* Local typography: short Russian words stay with the following word;
   em dashes use non-breaking spacing. Text nodes only. */
function typograph(){
  $$('[data-i18n]').forEach(el=>{
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode())){
      let value=node.nodeValue;
      if(lang==='ru'){
        value=value.replace(/(^|[\s(«])((?:а|и|в|во|к|ко|с|со|у|о|об|от|до|из|за|на|не|ни|по|но|да|для|при|без|под|над)) /giu,'$1$2\u00a0');
        value=value.replace(/\s+—\s+/g,'\u00a0— ');
        value=value.replace(/"([^"\n]+)"/g,'«$1»');
      }
      node.nodeValue=value;
    }
  });
}

// On phones the arch captions flow below the pinned scene, preserving 18 px text.
const mobileDetails=document.createElement('div');mobileDetails.className='arch-mobile-details';
$$('.atmosphere-sticky>.arch-detail').forEach(figure=>mobileDetails.append(figure.cloneNode(true)));
$('.atmosphere-story').after(mobileDetails);

function translate(){
  document.documentElement.lang=lang;
  $$('[data-i18n]').forEach(el=>el.innerHTML=t(el.dataset.i18n));
  document.title=t('title');
  $('meta[name="description"]').content=t('description');
  $('meta[property="og:title"]').content=t('title');
  $('meta[property="og:description"]').content=t('description');
  $$('[data-lang]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.lang===lang)));
  nav.setAttribute('aria-label',lang==='en'?'Main navigation':'Основная навигация');
  $('.header .wordmark').setAttribute('aria-label',lang==='en'?'Chevalet — home':'Chevalet — главная');
  $$('.dialog-close,.nav-close,.lightbox-close').forEach(b=>b.setAttribute('aria-label',t('close')));
  $$('[data-menu-prev],#lightbox-prev').forEach(b=>b.setAttribute('aria-label',t('previous')));
  $$('[data-menu-next],#lightbox-next').forEach(b=>b.setAttribute('aria-label',t('next')));
  lightbox.setAttribute('aria-label',t('image'));
  $('.tabs').setAttribute('aria-label',t('menu'));
  $('.city-map').setAttribute('aria-label',lang==='en'?'Illustrative map of Nizhny Novgorod':'Иллюстративная карта Нижнего Новгорода');
  const altMap=[['.hero-image','Бар CHEVALET, бордовые кресла и кирпичные своды','Chevalet bar with burgundy chairs and brick vaults'],['.atmosphere-photo img','Подсвеченная арка в интерьере CHEVALET','Illuminated arch in the Chevalet interior'],['.detail-left img','Изысканная подача блюда','Beautifully presented dish'],['.detail-right img','Винная коллекция бара','The bar’s wine collection']];
  altMap.forEach(([s,ru,en])=>$$(s).forEach(img=>img.alt=lang==='en'?en:ru));
  menuMotion.reset();renderMenu();renderGallery();updatePauseLabel();typograph();sizeAtmosphereCopy();scrollDirty=true;
}
$$('[data-lang]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();lang=a.dataset.lang;const url=new URL(location);url.searchParams.set('lang',lang);try{history.pushState({},'',url)}catch{}translate()}));
addEventListener('popstate',()=>{lang=readLanguage();translate()});

function setNav(open){
  if(open)lastFocus=document.activeElement;
  nav.classList.toggle('open',open);nav.inert=!open;navToggle.setAttribute('aria-expanded',String(open));
  syncScrollLock();
  $('main').inert=open;$('.header').inert=open;syncFooterAccess();
  if(open)$('.nav-close').focus();else lastFocus?.focus({preventScroll:true});
}
navToggle.addEventListener('click',()=>setNav(true));$('.nav-close').addEventListener('click',()=>setNav(false));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.hash);if(!target)return;e.preventDefault();if(nav.classList.contains('open'))setNav(false);const headerHeight=$('#header').offsetHeight;let top=target.getBoundingClientRect().top+scrollY-headerHeight;if(a.hash==='#about')top=reduced.matches?innerHeight:$('#home').offsetTop+($('#home').offsetHeight-$('.hero-sticky').offsetHeight)*.94;if(lenis)lenis.scrollTo(Math.max(0,top),{duration:1.25});else scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});history.replaceState({},'',`${location.pathname}${location.search}${a.hash}`)}));
addEventListener('keydown',e=>{if(!nav.classList.contains('open'))return;if(e.key==='Escape')setNav(false);if(e.key==='Tab'){const focusables=$$('a,button',nav),first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});

function showInfo(kind){if(nav.classList.contains('open'))setNav(false);$('#dialog-title').innerHTML=t(kind+'Title');$('#dialog-text').textContent=t(kind+'Text');typograph();info.showModal();syncScrollLock()}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>{showInfo('booking');document.dispatchEvent(new CustomEvent('chevalet:booking',{detail:{source:b.closest('section')?.id||'navigation',language:lang}}))}));
$$('[data-contact]').forEach(b=>b.addEventListener('click',()=>showInfo('contactDialog')));$$('[data-legal]').forEach(b=>b.addEventListener('click',()=>showInfo('privacy')));
$('.dialog-close').addEventListener('click',()=>info.close());$('.dialog-done').addEventListener('click',()=>info.close());
for(const d of [info,lightbox]){d.addEventListener('close',syncScrollLock);d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})}

function renderMenu(){
  const current=pageByTab[activeTab];
  $('#menu-panel').setAttribute('aria-labelledby',`tab-${activeTab}`);
  $('#menu-pages').replaceChildren(...[current,(current+1)%3].map(i=>{const b=document.createElement('button');b.className='menu-page';b.setAttribute('aria-label',`${t('zoomAlt')} ${i+1} — ${t(activeTab)}`);const img=document.createElement('img');img.src=pageSrc(i);img.alt=`${t(activeTab)} · ${i+1}`;img.width=720;img.height=1000;img.loading='lazy';b.append(img);b.addEventListener('click',()=>openLightbox('menu',i));return b}));
  $('#menu-counter').textContent=`0${current+1} / 03`;
}
const menuMotion=new window.ChevaletMenuMotion({container:$('#menu-pages'),panel:$('#menu-panel'),reduced,render:renderMenu});
reduced.addEventListener('change',()=>{menuMotion.reset();renderMenu()});
function stepMenu(n){pageByTab[activeTab]=(pageByTab[activeTab]+n+3)%3;menuMotion.request()}
function selectTab(tab){if(activeTab===tab)return;activeTab=tab;$$('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===activeTab));b.tabIndex=b.dataset.tab===activeTab?0:-1});menuMotion.request()}
$$('[data-tab]').forEach(b=>{b.addEventListener('click',()=>selectTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tab=e.key==='Home'?'kitchen':e.key==='End'?'bar':activeTab==='kitchen'?'bar':'kitchen';selectTab(tab);$(`[data-tab="${tab}"]`).focus()}})});
$('[data-menu-prev]').addEventListener('click',()=>stepMenu(-1));$('[data-menu-next]').addEventListener('click',()=>stepMenu(1));
function swipe(el,callback){let x=0,y=0;el.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX;y=e.changedTouches[0].clientY},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)callback(dx<0?1:-1)},{passive:true})}
swipe($('#menu-panel'),stepMenu);

function openLightbox(type,index){lightboxType=type;lightboxIndex=index;$('.lightbox-scroll').classList.remove('zoomed');updateLightbox();lightbox.showModal();syncScrollLock()}
function updateLightbox(){const img=$('#lightbox-image');img.src=lightboxType==='menu'?pageSrc(lightboxIndex):gallery[lightboxIndex].src;img.alt=lightboxType==='menu'?`${t('zoomAlt')} ${lightboxIndex+1}`:gallery[lightboxIndex][lang];$('#lightbox-label').textContent=lightboxType==='menu'?`${t(activeTab)} · ${t('sampleMenu')}`:gallery[lightboxIndex][lang];$('#lightbox-count').textContent=`0${lightboxIndex+1} / 0${lightboxType==='menu'?3:gallery.length}`;$('#zoom-toggle').textContent=t($('.lightbox-scroll').classList.contains('zoomed')?'reduce':'enlarge')}
function stepLightbox(n){const length=lightboxType==='menu'?3:gallery.length;lightboxIndex=(lightboxIndex+n+length)%length;$('.lightbox-scroll').classList.remove('zoomed');updateLightbox()}
$('#lightbox-prev').addEventListener('click',()=>stepLightbox(-1));$('#lightbox-next').addEventListener('click',()=>stepLightbox(1));$('.lightbox-close').addEventListener('click',()=>lightbox.close());
function zoom(){const s=$('.lightbox-scroll');s.classList.toggle('zoomed');$('#zoom-toggle').textContent=t(s.classList.contains('zoomed')?'reduce':'enlarge')}
$('#zoom-toggle').addEventListener('click',zoom);$('#lightbox-image').addEventListener('click',zoom);
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();stepLightbox(1)}if(e.key==='ArrowLeft'){e.preventDefault();stepLightbox(-1)}});
swipe($('.lightbox-scroll'),n=>{if(!$('.lightbox-scroll').classList.contains('zoomed'))stepLightbox(n)});

let galleryPaused=false,galleryHover=false,galleryKeyboardFocus=false,gallerySpeed=0,galleryDragging=false,galleryResumeAt=0;
function renderGallery(){const track=$('#gallery-track');track.replaceChildren(...[...gallery,...gallery,...gallery].map((item,i)=>{const b=document.createElement('button');b.className='gallery-item';b.setAttribute('aria-label',item[lang]);if(i<gallery.length||i>=gallery.length*2){b.tabIndex=-1;b.setAttribute('aria-hidden','true')}const img=document.createElement('img');img.src=item.src;img.alt=item[lang];img.loading='lazy';b.append(img);b.addEventListener('click',()=>openLightbox('gallery',i%gallery.length));b.addEventListener('focus',()=>galleryKeyboardFocus=b.matches(':focus-visible'));b.addEventListener('blur',()=>galleryKeyboardFocus=false);return b}));gallerySpeed=0;galleryHover=false;galleryKeyboardFocus=false;const width=galleryGroupWidth();gallerySurface.scrollLeft=width}
$('#gallery-track').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')galleryHover=true});$('#gallery-track').addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')galleryHover=false});
const gallerySurface=$('.gallery-window');
let galleryScrollRemainder=0;
function galleryGroupWidth(){
  const items=$('#gallery-track').children;
  return items[gallery.length]?.offsetLeft-items[0]?.offsetLeft||0;
}
function moveGallery(delta){
  const width=galleryGroupWidth();if(!width)return;
  const distance=delta+galleryScrollRemainder,step=Math.trunc(distance);
  galleryScrollRemainder=distance-step;if(!step)return;
  const next=gallerySurface.scrollLeft+step;
  gallerySurface.scrollLeft=width+((next-width)%width+width)%width;
}
new window.ChevaletGalleryDrag(gallerySurface,{
  nativeTouch:true,
  start(){galleryDragging=true;gallerySpeed=0;galleryScrollRemainder=0},
  move(dx){moveGallery(-dx)},
  end(){galleryDragging=false;galleryResumeAt=performance.now()+700}
});
new window.ChevaletGalleryTouch(gallerySurface,{
  start(){galleryDragging=true;gallerySpeed=0;galleryKeyboardFocus=false;galleryScrollRemainder=0},
  end(){galleryDragging=false;galleryResumeAt=performance.now()+900}
});
// Leave native momentum alone, including after touchend.
gallerySurface.addEventListener('scroll',()=>{
  const now=performance.now();
  if(now<galleryResumeAt)galleryResumeAt=Math.max(galleryResumeAt,now+250);
},{passive:true});
function updatePauseLabel(){$('#gallery-pause span').textContent=t(galleryPaused?'play':'pause');$('#gallery-pause').setAttribute('aria-pressed',String(galleryPaused))}
$('#gallery-pause').addEventListener('click',()=>{galleryPaused=!galleryPaused;updatePauseLabel()});

const hero=$('.hero-story'),heroContent=$('.hero-content'),intro=$('.hero-intro'),atmosphere=$('.atmosphere-story');
const atmosphereCopy=$('.atmosphere-copy');
let atmosphereCopyExtra=0;
function sizeAtmosphereCopy(){
  const styles=getComputedStyle(atmosphereCopy);
  const contentHeight=[...atmosphereCopy.children].reduce((height,el)=>{
    const style=getComputedStyle(el);
    return height+el.getBoundingClientRect().height+parseFloat(style.marginTop)+parseFloat(style.marginBottom);
  },parseFloat(styles.paddingTop)+parseFloat(styles.paddingBottom));
  atmosphereCopyExtra=reduced.matches?0:Math.max(0,Math.ceil(contentHeight-$('.atmosphere-sticky').offsetHeight));
  atmosphere.style.setProperty('--copy-extra',`${atmosphereCopyExtra}px`);
  atmosphereCopy.classList.toggle('is-tall',atmosphereCopyExtra>0);
  scrollDirty=true;
}
addEventListener('resize',sizeAtmosphereCopy);
reduced.addEventListener('change',sizeAtmosphereCopy);
const atmosphereCopyObserver=new ResizeObserver(sizeAtmosphereCopy);
[...atmosphereCopy.children].forEach(el=>atmosphereCopyObserver.observe(el));
const neighbours=$$('.hero-grid>.collage-photo');
let scrollDirty=true,lastTime=0;
function updateScroll(){
  const stage=$('.hero-sticky');
  const p=clamp(-hero.getBoundingClientRect().top/(hero.offsetHeight-stage.offsetHeight));
  const shrink=smooth((p-.02)/.30);
  const blur=smooth((p-.66)/.1),fade=1-blur,introP=smooth((p-.79)/.12);
  // Overlapping entrances from outside the stage. Neighbours never fade or scale.
  const phases={sides:smooth((p-.045)/.30),top:smooth((p-.12)/.30),bottom:smooth((p-.19)/.30)};
  const mobile=innerWidth<640,cellWidth=stage.clientWidth*(mobile?.52:.48),cellHeight=stage.offsetHeight*(mobile?.52:.48);
  for(const photo of neighbours){
    const col=Number(photo.dataset.col),row=Number(photo.dataset.row);
    // Centre tiles move vertically first; corner tiles follow with a subtle inward drift.
    const progress=row===0?phases.sides:smooth((p-(row<0?.12:.19)-(col===0?0:.04))/.30);
    const finalX=col*(cellWidth+15),finalY=row*(cellHeight+15);
    const startX=row===0?col*((stage.clientWidth+cellWidth)/2+40):finalX+col*(mobile?26:58);
    const startY=row!==0?row*((stage.offsetHeight+cellHeight)/2+40+(col===0?0:20)):finalY;
    const x=startX+(finalX-startX)*progress,y=startY+(finalY-startY)*progress;
    photo.style.opacity=1;
    photo.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
  }
  hero.style.setProperty('--shrink',shrink);hero.style.setProperty('--fade',fade);hero.style.setProperty('--intro',introP);hero.style.setProperty('--blur',`${blur*7}px`);hero.style.setProperty('--dim',blur*.27);
  intro.classList.toggle('is-tall',intro.scrollHeight>stage.offsetHeight+1);
  intro.style.setProperty('--intro-scroll',`${Math.max(0,intro.scrollHeight-stage.offsetHeight)*smooth((p-.91)/.085)}px`);
  intro.classList.toggle('visible',introP>.01);intro.setAttribute('aria-hidden',String(introP<.1));
  const hideHero=fade<.03;heroContent.setAttribute('aria-hidden',String(hideHero));heroContent.inert=hideHero;
  const atmosphereTravel=Math.max(0,-atmosphere.getBoundingClientRect().top);
  atmosphereCopy.style.setProperty('--copy-scroll',`${Math.min(atmosphereTravel,atmosphereCopyExtra)}px`);
  const ap=clamp((atmosphereTravel-atmosphereCopyExtra)/(atmosphere.offsetHeight-innerHeight-atmosphereCopyExtra));
  atmosphere.style.setProperty('--arch',smooth((ap-.12)/.58));atmosphere.style.setProperty('--arch-copy',1-smooth(ap/.3));atmosphere.style.setProperty('--details',smooth((ap-.54)/.25));
  $('#header').classList.toggle('solid',scrollY>hero.offsetHeight-85);
  syncFooterAccess();
}
function frame(time){lenis?.raf(time);const dt=Math.min(time-lastTime,45)/1000||0;lastTime=time;if(scrollDirty&&!reduced.matches){updateScroll();scrollDirty=false}else if(reduced.matches)$('#header').classList.toggle('solid',scrollY>innerHeight-85);
  const visible=$('.gallery-window').getBoundingClientRect();if(visible.bottom>0&&visible.top<innerHeight){const target=galleryPaused||galleryHover||galleryKeyboardFocus||galleryDragging||time<galleryResumeAt||lightbox.open||nav.classList.contains('open')||reduced.matches?0:(innerWidth<640?36:28);gallerySpeed+=(target-gallerySpeed)*.06;if(!galleryDragging&&time>=galleryResumeAt&&gallerySpeed>.05)moveGallery(gallerySpeed*dt)}
  requestAnimationFrame(frame)
}
addEventListener('scroll',()=>scrollDirty=true,{passive:true});addEventListener('resize',()=>scrollDirty=true);reduced.addEventListener('change',()=>{scrollDirty=true;setupSmoothScroll();syncScrollLock();document.documentElement.classList.toggle('js-motion',!reduced.matches);if(reduced.matches){hero.removeAttribute('style');atmosphere.removeAttribute('style');heroContent.inert=false;heroContent.removeAttribute('aria-hidden');intro.removeAttribute('aria-hidden')}});
if(!reduced.matches)document.documentElement.classList.add('js-motion');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('shown');observer.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));
// Preserve the reveal on short landscape screens while allowing a tall footer to scroll.
const footer=$('.footer');
function syncFooterAccess(){footer.inert=nav.classList.contains('open')||(!reduced.matches&&$('main').getBoundingClientRect().bottom>=innerHeight)}
function sizeFooter(){footer.style.setProperty('--footer-bottom',`${Math.min(0,innerHeight-footer.offsetHeight)}px`);syncFooterAccess()}
new ResizeObserver(sizeFooter).observe(footer);addEventListener('resize',sizeFooter);
document.fonts.ready.then(()=>{sizeFooter();sizeAtmosphereCopy();scrollDirty=true});
translate();sizeFooter();setupSmoothScroll();requestAnimationFrame(frame);
})();
