export async function askLocalModel(message:string):Promise<{reply:string;model:string}>{
  const response=await fetch('/api/assistant/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){if(data.error==='local_model_not_configured')throw new Error('لم يتم إعداد نموذج محلي بعد.');throw new Error(data.message||data.error||'تعذر الوصول إلى النموذج المحلي');}
  return data;
}
