/* Pointer gestures: horizontal dragging keeps vertical touch scrolling native. */
(() => {
'use strict';
class GalleryDrag {
  constructor(surface,{start,move,end}) {
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
      gesture={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,axis:null};
      start();
    });
    surface.addEventListener('pointermove',e=>{
      if(!gesture||e.pointerId!==gesture.id)return;
      if(e.pointerType==='mouse'&&(e.buttons&1)===0){finish(e);return;}
      const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
      if(!gesture.axis){
        if(Math.max(Math.abs(dx),Math.abs(dy))<7)return;
        gesture.axis=Math.abs(dx)>Math.abs(dy)*1.15?'x':'y';
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
    for(const type of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(type,finish);
    surface.addEventListener('pointerleave',e=>{if(gesture&&!surface.hasPointerCapture(gesture.id))finish(e)});
    surface.addEventListener('click',e=>{
      if(suppressClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}
    },true);
    surface.addEventListener('dragstart',e=>e.preventDefault());
    window.addEventListener('blur',()=>finish());
  }
}
window.ChevaletGalleryDrag=GalleryDrag;
})();
