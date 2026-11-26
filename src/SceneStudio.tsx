import { useEffect, useRef, useState } from 'react';
import { Check, Sun, Sparkles, CircleDot } from 'lucide-react';

type SceneId = 'silver'|'white'|'dark'|'warm';
const scenes:{id:SceneId;label:string;top:string;bottom:string;floor:string;accent:string}[]=[
  {id:'silver',label:'استوديو فضي',top:'#eef1f1',bottom:'#cbd3d3',floor:'#d9dfdf',accent:'#ffffff'},
  {id:'white',label:'أبيض نقي',top:'#ffffff',bottom:'#e9edeb',floor:'#f1f3f2',accent:'#ffffff'},
  {id:'dark',label:'استوديو داكن',top:'#39434a',bottom:'#111a20',floor:'#202a30',accent:'#aab9c1'},
  {id:'warm',label:'استوديو دافئ',top:'#f1e7da',bottom:'#cdbba7',floor:'#d9c9b8',accent:'#fff5e8'}
];
export default function SceneStudio({src,onExport,initialScene='silver'}:{src:string;onExport:(dataUrl:string)=>void;initialScene?:SceneId}){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const [scene,setScene]=useState<SceneId>(initialScene);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!src||!canvasRef.current)return;
    let active=true;
    setReady(false);setError('');
    const image=new Image();
    image.onload=()=>{
      if(!active||!canvasRef.current)return;
      const canvas=canvasRef.current,ctx=canvas.getContext('2d');
      if(!ctx){setError('تعذر تشغيل محرر الاستوديو على هذا المتصفح.');return;}
      const preset=scenes.find(item=>item.id===scene)!;
      const width=1600,height=1200,floorY=850;
      canvas.width=width;canvas.height=height;
      const background=ctx.createLinearGradient(0,0,0,height);
      background.addColorStop(0,preset.top);background.addColorStop(.68,preset.bottom);background.addColorStop(1,preset.floor);
      ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.5,height*.48,30,width*.5,height*.48,650);
      glow.addColorStop(0,preset.accent+'88');glow.addColorStop(1,preset.accent+'00');
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      const floor=ctx.createLinearGradient(0,floorY,0,height);
      floor.addColorStop(0,preset.floor+'00');floor.addColorStop(.15,preset.floor);floor.addColorStop(1,preset.bottom);
      ctx.fillStyle=floor;ctx.fillRect(0,floorY,width,height-floorY);
      ctx.strokeStyle=preset.accent+'55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,floorY);ctx.lineTo(width,floorY);ctx.stroke();
      const scale=Math.min(1400/image.naturalWidth,850/image.naturalHeight);
      const drawWidth=image.naturalWidth*scale,drawHeight=image.naturalHeight*scale;
      const x=(width-drawWidth)/2,y=175+(850-drawHeight)/2;
      ctx.save();ctx.globalAlpha=.22;ctx.filter='blur(25px)';ctx.fillStyle='#17221d';ctx.beginPath();ctx.ellipse(width/2,floorY+38,Math.min(510,drawWidth*.43),45,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.shadowColor='#17221d55';ctx.shadowBlur=24;ctx.shadowOffsetY=12;ctx.drawImage(image,x,y,drawWidth,drawHeight);ctx.restore();
      ctx.save();ctx.globalAlpha=.075;ctx.translate(0,y*2+drawHeight+12);ctx.scale(1,-1);ctx.drawImage(image,x,y,drawWidth,drawHeight);ctx.restore();
      const fade=ctx.createLinearGradient(0,floorY,0,height);fade.addColorStop(0,'#ffffff00');fade.addColorStop(.5,preset.bottom+'99');fade.addColorStop(1,preset.bottom);
      ctx.fillStyle=fade;ctx.fillRect(0,floorY,width,height-floorY);
      const vignette=ctx.createRadialGradient(width/2,height/2,300,width/2,height/2,1000);
      vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,scene==='dark'?'#00000030':'#24352b12');
      ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
      if(active){setReady(true);onExport(canvas.toDataURL('image/png'));}
    };
    image.onerror=()=>{if(active)setError('تعذر قراءة صورة السيارة الشفافة. أعد إزالة الخلفية ثم حاول مجدداً.');};
    image.src=src;
    return()=>{active=false;image.onload=null;image.onerror=null;};
  },[src,scene,onExport]);
  return <section className="scene-studio" dir="rtl">
    <div className="scene-studio-head"><div><span>MSHKUR SCENE STUDIO</span><b>اختر مشهد السيارة</b><small>تركيب محلي على جهازك · لا يغيّر تفاصيل السيارة</small></div><Sparkles size={19}/></div>
    <div className="scene-studio-presets">
      {scenes.map(item=><button key={item.id} className={scene===item.id?'active':''} onClick={()=>setScene(item.id)} aria-pressed={scene===item.id}><i style={{background:`linear-gradient(145deg,${item.top},${item.bottom})`}}/>{item.label}{scene===item.id&&<Check size={14}/>}</button>)}
    </div>
    <div className="scene-studio-canvas"><canvas ref={canvasRef}/>{!ready&&!error&&<span><CircleDot size={16}/> جارٍ تركيب المشهد...</span>}</div>
    {error&&<p className="scene-studio-error">{error}</p>}
    <div className="scene-studio-note"><Sun size={15}/> خلفيات ثابتة وظلال تركيبية؛ لا يوجد توليد لأجزاء السيارة أو تغيير مواصفاتها.</div>
  </section>;
}
