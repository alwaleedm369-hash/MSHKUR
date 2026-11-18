import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Check, RotateCcw, GlassWater, MousePointer2 } from 'lucide-react';

type Point={x:number;y:number};
const tints=[{id:'smoke',label:'دخاني',color:'#17232d'},{id:'black',label:'أسود خفيف',color:'#080d12'},{id:'blue',label:'أزرق داكن',color:'#18384a'}];
export default function GlassTintTool({src,onExport}:{src:string;onExport:(dataUrl:string)=>void}){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const [points,setPoints]=useState<Point[]>([]);
  const [tint,setTint]=useState('smoke');
  const [opacity,setOpacity]=useState(32);
  const [error,setError]=useState('');
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas||!src)return;
    let active=true;const image=new Image();
    image.onload=()=>{
      if(!active||!canvasRef.current)return;
      const target=canvasRef.current;target.width=image.naturalWidth;target.height=image.naturalHeight;
      const ctx=target.getContext('2d');if(!ctx)return;
      ctx.clearRect(0,0,target.width,target.height);ctx.drawImage(image,0,0);
      if(points.length){
        ctx.beginPath();ctx.moveTo(points[0].x*target.width,points[0].y*target.height);
        for(const point of points.slice(1))ctx.lineTo(point.x*target.width,point.y*target.height);
        if(points.length>=3){ctx.closePath();ctx.fillStyle=tints.find(item=>item.id===tint)!.color+Math.round(opacity/100*255).toString(16).padStart(2,'0');ctx.fill();}
        ctx.strokeStyle='#65a77a';ctx.lineWidth=Math.max(3,target.width/450);ctx.stroke();
        points.forEach(point=>{ctx.beginPath();ctx.arc(point.x*target.width,point.y*target.height,Math.max(5,target.width/180),0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.strokeStyle='#438b60';ctx.lineWidth=3;ctx.stroke();});
      }
    };
    image.onerror=()=>{if(active)setError('تعذر تحميل الصورة في أداة الزجاج.');};
    image.src=src;return()=>{active=false;image.onload=null;image.onerror=null;};
  },[src,points,tint,opacity]);
  function addPoint(event:MouseEvent<HTMLCanvasElement>){
    const canvas=canvasRef.current;if(!canvas)return;
    if(points.length>=16){setError('وصلت إلى 16 نقطة. طبّق التحديد أو أعد ضبطه.');return;}
    const rect=canvas.getBoundingClientRect();
    setPoints(current=>[...current,{x:Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width)),y:Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height))}]);
    setError('');
  }
  function apply(){
    const canvas=canvasRef.current;if(!canvas||points.length<3)return;
    try{onExport(canvas.toDataURL('image/png'));setError('');}
    catch{setError('تعذر تصدير الصورة على هذا الجهاز.');}
  }
  return <section className="glass-tint-tool" dir="rtl">
    <div className="glass-tint-heading"><div><span>أداة يدوية</span><b><GlassWater size={17}/> تضليل الزجاج</b><small>حدد نقاط الزجاج حول النافذة؛ لا يوجد كشف تلقائي.</small></div><MousePointer2 size={19}/></div>
    <div className="glass-tint-canvas-wrap"><canvas ref={canvasRef} onClick={addPoint} aria-label="انقر لتحديد حدود الزجاج"/></div>
    <div className="glass-tint-controls">
      <label>درجة التظليل<select value={tint} onChange={e=>setTint(e.target.value)}>{tints.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>قوة التظليل <b>{opacity}%</b><input type="range" min="10" max="65" step="1" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label>
    </div>
    <div className="glass-tint-footer"><small>{points.length} نقاط · تحتاج 3 نقاط على الأقل لتحديد نافذة واحدة</small><div><button type="button" className="button-outline" onClick={()=>{setPoints([]);setError('');}}><RotateCcw size={14}/> إعادة</button><button type="button" className="button-primary" disabled={points.length<3} onClick={apply}><Check size={14}/> تطبيق التظليل</button></div></div>
    {error&&<p className="glass-tint-error">{error}</p>}
  </section>;
}
