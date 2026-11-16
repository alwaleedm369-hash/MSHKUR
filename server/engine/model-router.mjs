export function getLocalModelStatus(){
  const endpoint=process.env.LOCAL_LLM_BASE_URL;
  if(!endpoint) return {provider:'none',status:'not_configured',paidFallback:false};
  try {
    const url=new URL(endpoint);
    if(!['http:','https:'].includes(url.protocol)) throw new Error('invalid protocol');
    return {provider:'llama.cpp-openai-compatible',status:'configured',paidFallback:false};
  } catch {
    return {provider:'none',status:'invalid_configuration',paidFallback:false};
  }
}

export async function generateWithLocalModel({messages,temperature=0.2,maxTokens=700}){
  const status=getLocalModelStatus();
  if(status.status!=='configured') throw Object.assign(new Error('لم يتم إعداد نموذج محلي بعد.'),{code:'local_model_not_configured'});
  if(!Array.isArray(messages)||messages.length<1||messages.length>20) throw Object.assign(new Error('Invalid messages'),{code:'invalid_messages'});
  const endpoint=process.env.LOCAL_LLM_BASE_URL.replace(/\/$/,'');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),Number(process.env.LOCAL_LLM_TIMEOUT_MS||30000));
  try{
    const response=await fetch(endpoint+'/v1/chat/completions',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({model:process.env.LOCAL_LLM_MODEL||'local-model',messages,temperature,max_tokens:maxTokens,stream:false}),
      signal:controller.signal
    });
    if(!response.ok) throw Object.assign(new Error('Local model server returned '+response.status),{code:'local_model_error'});
    const data=await response.json();
    const content=data?.choices?.[0]?.message?.content;
    if(typeof content!=='string') throw Object.assign(new Error('Local model returned an invalid response'),{code:'invalid_model_response'});
    return {content,model:data.model||'local-model',usage:data.usage||null,provider:'local'};
  }catch(error){
    if(error.name==='AbortError') throw Object.assign(new Error('انتهت مهلة النموذج المحلي.'),{code:'local_model_timeout'});
    throw error;
  }finally{clearTimeout(timeout);}
}
