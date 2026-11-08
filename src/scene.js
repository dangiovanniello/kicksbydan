// Photographic turntables: 36 source angles of each matching model/colorway.
// This is an image sequence, not a generic mesh, a 3D scan, or the seller's pair.
export function createShowroom(container,products){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Scroll-controlled 360-degree sneaker rotation');container.append(canvas);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable');
 const cache=new Map();let width=innerWidth,height=innerHeight,dirty=true,lastFrame=-1,lastIndex=-1,lastTransition=-1,turn=0,lastTime=0;
 const debug={ready:false,index:0,progress:0,rotation:0,frame:0,loadedFrames:0,kind:'36-angle photographic turntable',source:'StockX'};window.__kicksScene=debug;
 function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio,1.6);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(ratio,0,0,ratio,0,0);dirty=true}resize();addEventListener('resize',resize);
 function load(index){if(index>=products.length||cache.has(index))return;const state={images:[],loaded:0};cache.set(index,state);let next=0;function request(){if(cache.get(index)!==state)return;const n=next++;if(n>=36)return;const image=new Image();image.decoding='async';image.onload=()=>{if(cache.get(index)!==state)return;state.images[n]=image;state.loaded++;dirty=true;if(index===debug.index){debug.loadedFrames=state.loaded;debug.ready=true}request()};image.onerror=()=>{state.failed=true;request()};image.src=products[index].frameBase+'/'+String(n+1).padStart(2,'0')+'.jpg'}for(let n=0;n<4;n++)request()}
 function nearest(state,frame){if(!state)return;for(let d=0;d<36;d++){const image=state.images[(frame+d)%36]||state.images[(frame-d+36)%36];if(image)return image}}
 function draw(index,frame,offset,opacity){const image=nearest(cache.get(index),frame);if(!image)return;const mobile=width<700;const imageWidth=mobile?width*1.12:Math.min(width*.62,1050);const imageHeight=imageWidth*image.naturalHeight/image.naturalWidth;const x=(mobile?width*.5:width*.69)-imageWidth/2+offset*width;const y=(mobile?height*.65:height*.55)-imageHeight/2;ctx.globalAlpha=opacity;ctx.drawImage(image,x,y,imageWidth,imageHeight);ctx.globalAlpha=1}
 function update(progress,time,rotating,reduced=false){const delta=Math.min(.06,(time-lastTime)/1000||0);lastTime=time;if(rotating&&!reduced)turn+=delta*.1;
 const index=Math.min(products.length-1,Math.floor(progress)),fraction=progress-index;const frame=reduced?0:Math.floor(((Math.min(1,fraction/.82)+turn)%1)*36);const transition=reduced?0:Math.max(0,(fraction-.82)/.18);load(index);if(fraction>.4)load(index+1);
 if(dirty||frame!==lastFrame||index!==lastIndex||Math.abs(transition-lastTransition)>.0001){ctx.clearRect(0,0,width,height);draw(index,frame,-transition*.6,1-transition);if(transition>0&&index<products.length-1)draw(index+1,0,(1-transition)*.6,transition);lastFrame=frame;lastIndex=index;lastTransition=transition;dirty=false}
 debug.index=index;debug.frame=frame;debug.rotation=frame*10;debug.progress=progress;debug.loadedFrames=cache.get(index)?.loaded||0;debug.ready=debug.loadedFrames>0;
 // Keep at most the current shoe and its two neighbors decoded in memory.
 for(const key of cache.keys())if(width<700?(key<index||key>index+1):Math.abs(key-index)>1)cache.delete(key);
 }
 return{update};
}
