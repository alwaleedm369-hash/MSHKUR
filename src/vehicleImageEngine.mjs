/** MSHKUR/AIBG deterministic image-engine primitives. Normalized geometry; originals are immutable. */
export const DEFAULT_CANVAS = Object.freeze({ width: 1600, height: 1200 });
export const COMMANDS = Object.freeze(["REMOVE/", "KEEP/", "REMOVE/REGION", "KEEP/REGION", "CENTER/", "FIT/", "WHITE/", "TRANSPARENT/", "REVIEW/"]);

export function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

export function normalizeRect(rect) {
  const x1=clamp(Math.min(rect.x,rect.x+rect.width),0,1), y1=clamp(Math.min(rect.y,rect.y+rect.height),0,1);
  const x2=clamp(Math.max(rect.x,rect.x+rect.width),0,1), y2=clamp(Math.max(rect.y,rect.y+rect.height),0,1);
  if (x2-x1<=0 || y2-y1<=0) throw new Error("Region must have a positive area.");
  return {x:x1,y:y1,width:Number((x2-x1).toFixed(12)),height:Number((y2-y1).toFixed(12))};
}

function validateBounds(sourceWidth,sourceHeight,bounds,target,padding) {
  if (![sourceWidth,sourceHeight,target.width,target.height].every(v=>Number.isFinite(v)&&v>0)) throw new Error("Image dimensions must be positive.");
  const x1=clamp(bounds.x,0,sourceWidth), y1=clamp(bounds.y,0,sourceHeight);
  const x2=clamp(bounds.x+bounds.width,0,sourceWidth), y2=clamp(bounds.y+bounds.height,0,sourceHeight);
  const b={x:x1,y:y1,width:Math.max(0,x2-x1),height:Math.max(0,y2-y1)};
  if (!b.width||!b.height) throw new Error("No visible subject pixels were found.");
  const inset=clamp(padding,0,0.3), maxW=target.width*(1-inset*2), maxH=target.height*(1-inset*2);
  const scale=Math.min(maxW/b.width,maxH/b.height);
  return {b,width:b.width*scale,height:b.height*scale,scale};
}

/** Centered composition for catalog assets; always fits the full detected subject. */
export function getCenteredSubjectPlacement(sourceWidth,sourceHeight,bounds,target=DEFAULT_CANVAS,padding=0.08) {
  const v=validateBounds(sourceWidth,sourceHeight,bounds,target,padding);
  return {canvas:{width:target.width,height:target.height},source:v.b,destination:{x:(target.width-v.width)/2,y:(target.height-v.height)/2,width:v.width,height:v.height},scale:v.scale};
}

/** Grounded catalog composition: the tires sit on a consistent visual baseline (not floating mid-canvas). */
export function getGroundedSubjectPlacement(sourceWidth,sourceHeight,bounds,target=DEFAULT_CANVAS,padding=0.08,ground=0.86) {
  const v=validateBounds(sourceWidth,sourceHeight,bounds,target,padding);
  const baseline=target.height*clamp(ground,0.55,0.94);
  const x=(target.width-v.width)/2, y=baseline-v.height;
  if (y<0 || y+v.height>target.height) throw new Error("Grounded placement exceeds the output canvas.");
  return {canvas:{width:target.width,height:target.height},source:v.b,destination:{x,y,width:v.width,height:v.height},baseline,scale:v.scale};
}

/** Compact slash-command grammar. Coordinates are normalized x,y,width,height in 0..1. */
export function parseImageCommand(input) {
  const value=String(input??"").trim().toUpperCase();
  const simple={"CENTER":"CENTER","CENTER/":"CENTER","FIT":"FIT","FIT/":"FIT","WHITE":"WHITE","WHITE/":"WHITE","TRANSPARENT":"TRANSPARENT","TRANSPARENT/":"TRANSPARENT","REVIEW":"REVIEW","REVIEW/":"REVIEW"};
  if (simple[value]) return {action:simple[value]};
  const match=/^(REMOVE|KEEP)(?:\/REGION)?(?:\/|\s)+([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)$/.exec(value);
  if (!match) throw new Error("Use REMOVE/ x,y,w,h; KEEP/ x,y,w,h; CENTER/; FIT/; WHITE/; TRANSPARENT/; or REVIEW/.");
  return {action:match[1],region:normalizeRect({x:Number(match[2]),y:Number(match[3]),width:Number(match[4]),height:Number(match[5])})};
}

export function applyAlphaRegion(alpha,width,height,command) {
  if (!(alpha instanceof Uint8Array)||alpha.length!==width*height) throw new Error("Invalid alpha plane.");
  if (!["KEEP","REMOVE"].includes(command.action)) throw new Error("Expected KEEP or REMOVE region command.");
  const r=command.region,x0=clamp(Math.floor(r.x*width),0,width),y0=clamp(Math.floor(r.y*height),0,height);
  const x1=clamp(Math.ceil((r.x+r.width)*width),0,width),y1=clamp(Math.ceil((r.y+r.height)*height),0,height);
  for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) alpha[y*width+x]=command.action==="REMOVE"?0:255;
  return alpha;
}

export function inspectAlphaPlane(alpha,width,height,threshold=12) {
  if (!(alpha instanceof Uint8Array)||alpha.length!==width*height) throw new Error("Invalid alpha plane.");
  let minX=width,minY=height,maxX=-1,maxY=-1,visible=0;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) if(alpha[y*width+x]>threshold) {visible++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  if(!visible) return {visiblePixels:0,bounds:null,touchesEdge:false,occupancy:0};
  const bounds={x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1};
  return {visiblePixels:visible,bounds,touchesEdge:minX===0||minY===0||maxX===width-1||maxY===height-1,occupancy:visible/(width*height)};
}

/** Deterministic QA gates; warnings never claim semantic car detection. */
export function reviewVehicleMask(report,width,height) {
  const issues=[];
  if(!report?.bounds||!report.visiblePixels) issues.push({code:"EMPTY_MASK",severity:"block",message:"No foreground pixels detected."});
  else {
    if(report.touchesEdge) issues.push({code:"EDGE_CONTACT",severity:"review",message:"Foreground touches the source edge; inspect possible clipping."});
    if(report.occupancy<0.035) issues.push({code:"LOW_OCCUPANCY",severity:"review",message:"Subject occupies very little of the frame; inspect segmentation."});
    if(report.occupancy>0.94) issues.push({code:"HIGH_OCCUPANCY",severity:"review",message:"Foreground covers almost the whole frame; inspect background leakage."});
    const ratio=report.bounds.width/report.bounds.height;
    if(ratio<0.7||ratio>5.2) issues.push({code:"UNUSUAL_SHAPE",severity:"review",message:"Foreground shape is unusual for a side/profile vehicle image."});
    const marginX=Math.min(report.bounds.x,width-(report.bounds.x+report.bounds.width))/width;
    if(marginX<0.005) issues.push({code:"HORIZONTAL_CROP_RISK",severity:"review",message:"Subject is very close to a horizontal edge."});
  }
  return {status:issues.some(x=>x.severity==="block")?"blocked":issues.length?"needs-review":"passed",issues,visiblePixels:report?.visiblePixels??0,bounds:report?.bounds??null};
}

/** Stable batch plan keeps one canvas, baseline, padding and output policy for every input. */
export function createBatchPlan(items,{target=DEFAULT_CANVAS,padding=0.08,ground=0.86,background="white"}={}) {
  if(!Array.isArray(items)||!items.length) throw new Error("A batch must contain at least one image.");
  if(!["white","transparent"].includes(background)) throw new Error("Unsupported batch background.");
  return items.map((item,index)=>({id:item.id??String(index),source:item,canvas:{...target},padding,ground,background,sequence:index+1}));
}
