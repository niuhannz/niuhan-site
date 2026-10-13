// Fit the actual CRT cabinet and both switch housings, rather than cropping
// one fixed camera view into every screen shape. Dimensions are in scene metres.
const bounds=[
  {x:[-.83,.83],y:[.94,2.155],z:[-1.555,-.56]},
  {x:[-.43,.43],y:[.807,.977],z:[.375,.825]}
];
const pitch=.5*Math.PI/180, sin=Math.sin(pitch),cos=Math.cos(pitch);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export function fitRoomViewport(width,height,{touch=false,dpr=1}={}) {
  const w=Math.max(1,Math.round(width)),h=Math.max(1,Math.round(height)),aspect=w/h;
  const portrait=aspect<1;
  const layout=portrait?(w<=600?'phone-portrait':'tablet-portrait'):(touch?'landscape-touch':'desktop');
  const side=portrait?.94:.88,top=.86;
  // Short touch landscapes put controls at the sides to preserve image size.
  const sideDock=touch&&!portrait&&w>=480&&h<=560;
  const bottom=touch&&!sideDock?Math.max(.32,1-2*(portrait?100:80)/h):.82;
  let cameraZ=2.5+.65*clamp((1-aspect)/.5,0,1),tanHalf=0;
  function required(z) {
    let value=Math.tan(17*Math.PI/180);
    for(const b of bounds)for(const x of b.x)for(const y of b.y)for(const pz of b.z) {
      const d=z-pz,dy=y-1.3,depth=cos*d+sin*dy,v=cos*dy-sin*d;
      value=Math.max(value,Math.abs(x)/(depth*aspect*side),Math.abs(v)/(depth*(v>=0?top:bottom)));
    }
    return value;
  }
  // Very short windows get a little more distance, never a clipped television.
  tanHalf=required(cameraZ);
  while(tanHalf>Math.tan(32*Math.PI/180)&&cameraZ<6) {cameraZ+=.1;tanHalf=required(cameraZ);}
  const fov=2*Math.atan(tanHalf)*180/Math.PI;
  return {width:w,height:h,aspect,layout,input:touch?'touch':'mouse',sideDock,cameraZ,fov,
    horizontalFov:2*Math.atan(tanHalf*aspect)*180/Math.PI,
    pixelRatio:Math.min(Math.max(1,dpr),1.65,Math.sqrt(3200000/(w*h))),
    safeNdc:{side,top,bottom}};
}
