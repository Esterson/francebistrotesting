/* Pointer gestures: horizontal dragging keeps vertical touch scrolling native. */
(() => {
'use strict';
class GalleryDrag {
  constructor(surface,{start,move,end,nativeTouch=false}) {
    let gesture=null,suppressClick=false;
    const finish=e=>{
      if(!gesture||(e&&e.pointerId!==undefined&&e.pointerId!==gesture.id))return;
      const id=gesture.id;gesture=null;
      surface.classList.remove('is-dragging');
      if(surface.hasPointerCapture(id))surface.releasePointerCapture(id);
      end();
    };
    surface.addEventListener('pointerdown',e=>{
      if(gesture||e.isPrimary===false||e.button!==0)return;
      suppressClick=false;
      if(nativeTouch&&e.pointerType==='touch')return;
      gesture={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,axis:null};
      start();
    });
    surface.addEventListener('pointermove',e=>{
      if(!gesture||e.pointerId!==gesture.id)return;
      if(e.pointerType==='mouse'&&(e.buttons&1)===0){finish(e);return;}
      const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
      if(!gesture.axis){
        if(Math.max(Math.abs(dx),Math.abs(dy))<7)return;
        if(Math.abs(dx)>Math.abs(dy)*1.15)gesture.axis='x';
        else if(Math.abs(dy)>Math.abs(dx)*1.15)gesture.axis='y';
        else return;
        if(gesture.axis==='x'){
          suppressClick=true;
          surface.setPointerCapture(e.pointerId);
          surface.classList.add('is-dragging');
        }
      }
      if(gesture.axis!=='x')return;
      if(e.cancelable)e.preventDefault();
      move(e.clientX-gesture.lastX);
      gesture.lastX=e.clientX;
    },{passive:false});
    for(const type of ['pointerup','pointercancel'])surface.addEventListener(type,finish);
    // Touch starts with implicit capture on the photo. Releasing that capture
    // bubbles here when we transfer it to the surface; the drag is still active.
    surface.addEventListener('lostpointercapture',e=>{if(e.target===surface)finish(e)});
    surface.addEventListener('pointerleave',e=>{if(gesture&&!surface.hasPointerCapture(gesture.id))finish(e)});
    surface.addEventListener('click',e=>{
      if(suppressClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}
    },true);
    surface.addEventListener('dragstart',e=>e.preventDefault());
    window.addEventListener('blur',()=>finish());
  }
}
// Touch scrolling belongs to the browser: no capture, transforms or preventDefault.
// Only a real horizontal swipe pauses autoplay and suppresses the following click.
class GalleryTouch {
  constructor(surface,{start,end}) {
    let touch=null,suppressClick=false;
    const finish=()=>{if(touch?.dragging)end();touch=null};
    surface.addEventListener('touchstart',e=>{
      if(e.touches.length!==1){finish();return}
      suppressClick=false;
      const p=e.touches[0];touch={x:p.clientX,y:p.clientY,dragging:false};
    },{passive:true});
    surface.addEventListener('touchmove',e=>{
      if(!touch||e.touches.length!==1)return;
      const p=e.touches[0],dx=Math.abs(p.clientX-touch.x),dy=Math.abs(p.clientY-touch.y);
      if(!touch.dragging&&dx>7&&dx>dy){touch.dragging=true;suppressClick=true;start()}
    },{passive:true});
    for(const type of ['touchend','touchcancel'])surface.addEventListener(type,finish,{passive:true});
    surface.addEventListener('click',e=>{
      if(suppressClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation()}
    },true);
    window.addEventListener('blur',finish);
  }
}
window.ChevaletGalleryDrag=GalleryDrag;
window.ChevaletGalleryTouch=GalleryTouch;
})();
