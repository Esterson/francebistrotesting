import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';

const events={},captures=new Set(),classes=new Set();
const photo={};
const surface={
  addEventListener(name,handler){events[name]=handler},
  classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
  hasPointerCapture:id=>captures.has(id),
  setPointerCapture(id){
    captures.add(id);
    // Mobile browsers release implicit capture on the original photo.
    events.lostpointercapture({pointerId:id,target:photo});
  },
  releasePointerCapture:id=>captures.delete(id)
};
const window={addEventListener(){}};
runInNewContext(await readFile(new URL('../js/gallery-drag.js',import.meta.url),'utf8'),{window});
let distance=0,ended=0;
new window.ChevaletGalleryDrag(surface,{start(){},move:dx=>distance+=dx,end:()=>ended++});
function emit(name,extra={}){
  let prevented=false,stopped=false;
  events[name]({pointerId:1,isPrimary:true,button:0,buttons:1,pointerType:'touch',
    clientX:100,clientY:100,cancelable:true,target:surface,
    preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true},...extra});
  return {prevented,stopped};
}
emit('pointerdown');
assert(emit('pointermove',{clientX:140}).prevented);
assert.equal(ended,0,'Child capture loss must not end the gesture');
emit('pointermove',{clientX:170});
assert.equal(distance,70,'Touch must continue moving after capture transfer');
emit('pointerup');
assert.equal(ended,1);
assert.equal(captures.size,0);
assert(emit('click',{detail:1}).stopped);
assert(!emit('click',{detail:0}).stopped);
emit('pointerdown');emit('pointerup');
assert(!emit('click',{detail:1}).stopped,'A tap must still open the photo');
emit('pointerdown');
assert(!emit('pointermove',{clientY:140}).prevented,'Vertical touch must scroll the page');
emit('pointercancel');
assert.equal(distance,70);
emit('pointerdown',{pointerType:'mouse'});
emit('pointermove',{pointerType:'mouse',clientX:70});
assert.equal(distance,40,'Mouse dragging must still work in reverse');
emit('lostpointercapture');
assert.equal(classes.size,0);
assert.equal(ended,4);
console.log('PASS: implicit touch capture transfer, continued drag, tap, click suppression, vertical scrolling, mouse drag and cancellation.');
