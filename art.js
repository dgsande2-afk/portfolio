(function(){
const c=document.getElementById('art'),x=c.getContext('2d');
const cols=['#e4457a','#f28c28','#2bb3a3','#f5d547','#8a6cff','#ff7a6b'];
let W,H,blooms=[],dpr=Math.min(devicePixelRatio||1,2);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',size);
const r=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
function add(px,py){
  const shape=pick(['round','pointed','star','spike']);
  blooms.push({x:px,y:py,t:0,petals:Math.floor(r(5,12)),size:r(40,110),
    c1:pick(cols),c2:pick(cols),shape,rot:r(0,6.28),spin:r(-.004,.004),stem:r(60,200)});
}
function petal(b,len,w,i,n,col){
  const a=b.rot+i/n*6.283;x.save();x.rotate(a);x.fillStyle=col;x.beginPath();
  if(b.shape==='round'){x.ellipse(len/2,0,len/2,w,0,0,6.283)}
  else if(b.shape==='pointed'){x.moveTo(0,0);x.quadraticCurveTo(len*.5,-w*1.6,len,0);x.quadraticCurveTo(len*.5,w*1.6,0,0)}
  else if(b.shape==='star'){x.moveTo(0,-w*.3);x.lineTo(len,0);x.lineTo(0,w*.3)}
  else{x.rect(0,-w*.25,len,w*.5)}
  x.fill();x.restore();
}
function draw(){
  x.clearRect(0,0,W,H);
  blooms.forEach(b=>{
    b.t=Math.min(b.t+(reduce?1:.04),1);b.rot+=reduce?0:b.spin;
    const e=1-Math.pow(1-b.t,3),s=b.size*e;
    x.save();x.translate(b.x,b.y);
    x.strokeStyle='#2bb3a3';x.lineWidth=4;x.lineCap='round';
    x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(12,b.stem*e*.5,0,b.stem*e);x.stroke();
    for(let i=0;i<b.petals;i++)petal(b,s,s*.28,i,b.petals,b.c1);
    x.save();x.scale(.55,.55);for(let i=0;i<b.petals;i++)petal(b,s,s*.28,i+.5,b.petals,b.c2);x.restore();
    x.fillStyle='#1d1b3a';x.beginPath();x.arc(0,0,s*.14,0,6.283);x.fill();
    x.fillStyle='#f5d547';x.beginPath();x.arc(0,0,s*.08,0,6.283);x.fill();
    x.restore();
  });
  requestAnimationFrame(draw);
}
c.addEventListener('pointerdown',e=>{
  const rc=c.getBoundingClientRect();add(e.clientX-rc.left,e.clientY-rc.top);
});
document.getElementById('clear').addEventListener('click',()=>{blooms=[]});
add(W*.7,H*.4);
draw();
})();
