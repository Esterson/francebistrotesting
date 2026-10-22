/* Independent menu-sheet transition, suitable for a Tilda HTML block. */
(() => {
  'use strict';
  class MenuMotion {
    constructor({container,panel,reduced,render}) {
      Object.assign(this,{container,panel,reduced,render});
      this.version=0;this.running=false;this.pending=false;this.animations=new Set();
    }
    visiblePages() {
      return [...this.container.querySelectorAll('.menu-page')].filter(page=>page.getClientRects().length);
    }
    cancelAnimations() {
      for(const animation of this.animations)animation.cancel();
      this.animations.clear();
    }
    finish() {
      this.running=false;
      this.container.classList.remove('is-animating');
      this.panel.removeAttribute('aria-busy');
      for(const page of this.container.querySelectorAll('.menu-page'))page.style.removeProperty('opacity');
    }
    reset() {
      this.version++;this.pending=false;
      this.cancelAnimations();this.finish();
    }
    async play(direction) {
      const out=direction==='out';
      const frames=out
        ? [{opacity:1,transform:'translateY(0)',filter:'blur(0px)'},{opacity:0,transform:'translateY(44px)',filter:'blur(9px)'}]
        : [{opacity:0,transform:'translateY(38px)',filter:'blur(9px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0px)'}];
      const animations=this.visiblePages().filter(page=>typeof page.animate==='function').map((page,index)=>{
        const animation=page.animate(frames,{duration:out?260:340,delay:index*100,easing:out?'cubic-bezier(.4,0,1,1)':'cubic-bezier(.22,1,.36,1)',fill:'both'});
        this.animations.add(animation);return animation;
      });
      await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
    }
    request() {
      if(this.reduced.matches){this.reset();this.render();return Promise.resolve()}
      this.pending=true;
      if(this.running)return this.task;
      this.task=this.run();return this.task;
    }
    async run() {
      const version=this.version;
      this.running=true;this.container.classList.add('is-animating');this.panel.setAttribute('aria-busy','true');
      try {
        while(this.pending) {
          this.pending=false;
          await this.play('out');
          if(version!==this.version)return;
          // Render the latest requested tab/page, including clicks made during exit.
          this.render();this.cancelAnimations();this.pending=false;
          const pages=this.visiblePages();
          for(const page of pages)page.style.opacity='0';
          await Promise.all(pages.map(page=>{
            const img=page.querySelector('img');
            return img&&typeof img.decode==='function'?img.decode().catch(()=>{}):Promise.resolve();
          }));
          if(version!==this.version)return;
          await this.play('in');
          if(version!==this.version)return;
          this.cancelAnimations();
          for(const page of pages)page.style.removeProperty('opacity');
        }
      } finally {
        if(version===this.version){this.cancelAnimations();this.finish()}
      }
    }
  }
  window.ChevaletMenuMotion=MenuMotion;
})();
