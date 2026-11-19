import { useState } from 'react';

type Props = { before: string; after: string; label?: string };
export default function BeforeAfterSlider({ before, after, label = 'مقارنة قبل وبعد' }: Props) {
  const [position, setPosition] = useState(50);
  return (
    <div dir="rtl" aria-label={label} style={{ position:'relative', overflow:'hidden', width:'100%', aspectRatio:'4/3', borderRadius:14, background:'#e9eeeb', border:'1px solid #dce6e0' }}>
      <img src={after} alt="بعد المعالجة" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}} />
      <div style={{position:'absolute',inset:0,width:position+'%',overflow:'hidden',borderLeft:'2px solid white'}}>
        <img src={before} alt="الصورة الأصلية قبل المعالجة" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}} />
      </div>
      <span style={{position:'absolute',top:10,right:10,padding:'4px 9px',borderRadius:20,background:'#172b27c9',color:'#fff',fontSize:11}}>قبل</span>
      <span style={{position:'absolute',top:10,left:10,padding:'4px 9px',borderRadius:20,background:'#147a68',color:'#fff',fontSize:11}}>بعد</span>
      <input aria-label="اسحب لمقارنة الأصل والنتيجة" type="range" min="0" max="100" value={position} onChange={e=>setPosition(Number(e.target.value))} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'ew-resize'}} />
      <span aria-hidden="true" style={{position:'absolute',top:0,bottom:0,left:position+'%',transform:'translateX(-50%)',width:3,background:'#fff',boxShadow:'0 0 8px #0004',pointerEvents:'none'}} />
    </div>
  );
}
